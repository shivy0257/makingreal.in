import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

type FoldImage = { src: string; smallSrc?: string; width: number; height: number; alt: string };
type Frame = { image: FoldImage; index: number };
type Turn = { from: Frame; to: Frame; forward: boolean };

const UNFOLD_MS = 1800;
const PAGE_TURN_MS = 760;
const PRELOAD_WAIT_MS = 900;
const PHOTO_SIZES = "(min-width: 1520px) 1200px, 92vw";

export function GlassFold({ image, cover = image, index = 0, instant = false, hero = false }: {
  image: FoldImage;
  cover?: FoldImage;
  index?: number;
  instant?: boolean;
  hero?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const device = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const pageAnimation = useRef<Animation | null>(null);
  const pageReflections = useRef<Animation[]>([]);
  const entranceAnimations = useRef<Animation[]>([]);
  const [shown, setShown] = useState<Frame>({ image, index });
  const [turn, setTurn] = useState<Turn | null>(null);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useRef<HTMLButtonElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    const host = stage.current;
    const body = device.current;
    const panel = opener.current;
    if (!host || !body || !panel) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = media.matches;
    const finish = () => {
      host.dataset.fold = "open";
      entranceAnimations.current.forEach(animation => animation.cancel());
      entranceAnimations.current = [];
    };
    const sync = () => {
      reduced.current = media.matches;
      if (media.matches) { finish(); pageAnimation.current?.finish(); }
    };
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (media.matches || host.dataset.fold === "open") { finish(); return; }
      const easing = getComputedStyle(host).getPropertyValue("--ease-in-out").trim();
      host.dataset.fold = "opening";
      const options = { duration: UNFOLD_MS, easing, fill: "both" as const };
      const open = panel.animate([{ transform: "rotateY(180deg)" }, { transform: "rotateY(0deg)" }], options);
      const center = body.animate([
        { transform: "translateX(-25%) rotateX(6deg) rotateY(-14deg) rotateZ(-2deg)" },
        { transform: "translateX(0) rotateX(6deg) rotateY(-6deg) rotateZ(-2deg)" },
      ], options);
      const sheen = host.querySelector<HTMLElement>(".fold-cover .fold-reflection")?.animate([
        { transform: "translateX(-65%)", opacity: .05 },
        { transform: "translateX(45%)", opacity: .65, offset: .55 },
        { transform: "translateX(110%)", opacity: 0 },
      ], options);
      entranceAnimations.current = [open, center, ...(sheen ? [sheen] : [])];
      open.finished.then(finish).catch(() => {});
    }, { threshold: .25 });
    host.dataset.fold = media.matches ? "open" : "closed";
    observer.observe(host);
    media.addEventListener("change", sync);
    return () => { observer.disconnect(); media.removeEventListener("change", sync); finish(); pageAnimation.current?.cancel(); };
  }, []);

  useEffect(() => {
    if (image.src === shown.image.src && !turn && !instant && !reduced.current) return;
    const host = stage.current;
    if (host) host.dataset.fold = "open";
    entranceAnimations.current.forEach(animation => animation.cancel());
    entranceAnimations.current = [];
    if (instant || reduced.current) {
      pageAnimation.current?.cancel();
      if (image.src === shown.image.src && !turn) return;
      setShown({ image, index });
      setTurn(null);
      return;
    }
    if (turn) {
      const animation = pageAnimation.current;
      if (animation) {
        const rate = image.src === turn.from.image.src ? -1 : 1;
        animation.updatePlaybackRate(rate);
        pageReflections.current.forEach(reflection => reflection.updatePlaybackRate(rate));
      }
      return;
    }
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const preload = new Image();
    preload.sizes = PHOTO_SIZES;
    if (image.smallSrc) preload.srcset = `${image.smallSrc} 640w, ${image.src} ${image.width}w`;
    preload.src = image.src;
    Promise.race([preload.decode().catch(() => {}), new Promise(resolve => { timeout = setTimeout(resolve, PRELOAD_WAIT_MS); })]).then(() => {
      clearTimeout(timeout);
      if (!cancelled) setTurn({ from: shown, to: { image, index }, forward: index > shown.index });
    });
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [image, index, instant, shown, turn]);

  useEffect(() => {
    if (!turn || !leaf.current) return;
    const start = turn.forward ? 0 : -180;
    const end = turn.forward ? -180 : 0;
    const options = { duration: PAGE_TURN_MS, easing: getComputedStyle(leaf.current).getPropertyValue("--ease-in-out").trim(), fill: "both" as const };
    const animation = leaf.current.animate([{ transform: `rotateY(${start}deg)` }, { transform: `rotateY(${end}deg)` }], options);
    pageAnimation.current = animation;
    const reflections = [...leaf.current.querySelectorAll<HTMLElement>(".fold-reflection")].map(element => element.animate([
      { transform: "translateX(-80%)", opacity: .1 },
      { transform: "translateX(10%)", opacity: .6, offset: .5 },
      { transform: "translateX(100%)", opacity: .08 },
    ], options));
    pageReflections.current = reflections;
    animation.finished.then(() => {
      setShown(animation.playbackRate < 0 ? turn.from : turn.to);
      setTurn(null);
    }).catch(() => {});
    return () => { animation.cancel(); reflections.forEach(reflection => reflection.cancel()); if (pageAnimation.current === animation) pageAnimation.current = null; };
  }, [turn]);

  const face = (photo: FoldImage, side: "left" | "right", accessible = false) => <div className={`fold-face fold-${side}`}>
    <img key={`${photo.src}-${attempt}`} className="fold-photo" src={photo.src}
      srcSet={photo.smallSrc ? `${photo.smallSrc} 640w, ${photo.src} ${photo.width}w` : undefined}
      sizes={hero ? "(min-width: 768px) 46vw, 88vw" : PHOTO_SIZES} width={photo.width} height={photo.height}
      alt={accessible ? photo.alt : ""} draggable={false} decoding="async" loading={hero ? "eager" : "lazy"}
      {...(hero ? { fetchpriority: "high" } : {})}
      onLoad={() => {
        if (retry.current === document.activeElement) retry.current?.closest(".gallery-slide")?.querySelector<HTMLButtonElement>(".gallery-card")?.focus({ preventScroll: true });
        setLoaded(previous => previous[photo.src] ? previous : { ...previous, [photo.src]: true });
        setFailed(previous => previous === photo.src ? null : previous);
      }} onError={() => setFailed(photo.src)} />
    <span className="fold-reflection" aria-hidden="true" />
  </div>;
  const left = turn ? (turn.forward ? turn.from : turn.to) : shown;
  const right = turn ? (turn.forward ? turn.to : turn.from) : shown;
  const front = turn ? (turn.forward ? turn.from : turn.to) : shown;
  const back = turn ? (turn.forward ? turn.to : turn.from) : shown;

  return <div ref={stage} className={`fold-stage${hero ? " fold-hero" : ""}`} aria-busy={!loaded[image.src] && failed !== image.src}>
    <div ref={device} className="fold-device">
      <div ref={opener} className="fold-opener">
        {face(left.image, "left")}
        <div className="fold-cover" aria-hidden="true">
          <img src={cover.smallSrc || cover.src} width={cover.width} height={cover.height} alt="" draggable={false} decoding="async" />
          <span className="fold-cover-type">MAKING<br /><b>REAL.</b></span>
          <span className="fold-cover-note">A different perspective.</span>
          <span className="fold-reflection" />
        </div>
      </div>
      <div className="fold-fixed">{face(right.image, "right", true)}</div>
      {turn && <div ref={leaf} className="fold-leaf" data-direction={turn.forward ? "forward" : "backward"} aria-hidden="true">
        <div className="fold-leaf-front">{face(front.image, "right")}</div>
        <div className="fold-leaf-back">{face(back.image, "left")}</div>
      </div>}
    </div>
    <span className="fold-ground" aria-hidden="true" />
    {failed === image.src && <div className="fold-failure" role="status">
      <span>Image unavailable.</span>
      <button ref={retry} type="button" className="btn btn-ghost btn-sm" onClick={event => {
        event.currentTarget.closest(".gallery-slide")?.querySelector<HTMLButtonElement>(".gallery-card")?.focus({ preventScroll: true });
        setFailed(null);
        setAttempt(value => value + 1);
      }}>Retry image <ArrowUpRight aria-hidden="true" /></button>
    </div>}
  </div>;
}
