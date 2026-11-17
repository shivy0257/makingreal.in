import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEventHandler, type PointerEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { GlassFold } from "@/components/GlassFold";

export type GalleryImage = {
  src: string;
  smallSrc?: string;
  width: number;
  height: number;
  title: string;
  description: string;
  alt: string;
  credit?: string;
  sourceUrl?: string;
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useManualCarousel(reduced: boolean, startIndex = 0) {
  // Keep one snap per image, including when several cards fit in the viewport.
  const [viewport, api] = useEmblaCarousel({ align: "start", containScroll: false, loop: false, startIndex, watchFocus: false });
  const [state, setState] = useState({ index: startIndex, previous: false, next: false });
  useEffect(() => {
    if (!api) return;
    const update = () => {
      const index = api.selectedScrollSnap();
      setState({ index, previous: api.canScrollPrev(), next: api.canScrollNext() });
      const focusedSlide = api.slideNodes().findIndex(node => node.contains(document.activeElement));
      if (focusedSlide !== -1 && focusedSlide !== index) {
        const target = api.slideNodes()[index]?.querySelector<HTMLButtonElement>(".gallery-card") ?? api.rootNode();
        target.focus({ preventScroll: true });
      }
    };
    update();
    api.on("select", update).on("reInit", update);
    return () => { api.off("select", update).off("reInit", update); };
  }, [api]);
  useEffect(() => {
    if (!api) return;
    const index = api.selectedScrollSnap();
    api.reInit({ duration: reduced ? 0 : 25, startIndex: index });
    const finishDrag = () => { if (reduced) api.scrollTo(api.selectedScrollSnap(), true); };
    finishDrag();
    api.on("pointerUp", finishDrag);
    return () => { api.off("pointerUp", finishDrag); };
  }, [api, reduced]);
  const go = (index: number, instant = false) => api?.scrollTo(index, reduced || instant);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!api || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || !event.currentTarget.contains(event.target as Node)) return;
    if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
    const index = api.selectedScrollSnap();
    const last = api.scrollSnapList().length - 1;
    const next = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    go(Math.max(0, Math.min(last, next)), true);
  };
  return { viewport, api, ...state, go, onKeyDown };
}

type ImageSlideProps = {
  image: GalleryImage;
  active: boolean;
  enabled?: boolean;
  viewer?: boolean;
  label: string;
  onOpen?: MouseEventHandler<HTMLButtonElement>;
};

function ImageSlide({ image, active, enabled = true, viewer = false, label, onOpen }: ImageSlideProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const element = useRef<HTMLImageElement>(null);
  const retryButton = useRef<HTMLButtonElement>(null);
  const failedSource = useRef(image.src);
  useEffect(() => {
    if (!enabled || status !== "loading" || !element.current) return;
    const img = element.current;
    if (img.complete && img.naturalWidth > 0) { setStatus("loaded"); return; }
    let timeout: ReturnType<typeof setTimeout> | undefined;
    // Lazy, offscreen images get no deadline until they actually enter view.
    const observer = new IntersectionObserver(entries => {
      clearTimeout(timeout);
      if (entries.some(entry => entry.isIntersecting)) {
        timeout = setTimeout(() => {
          failedSource.current = img.currentSrc || img.src;
          setStatus("error");
        }, 20000);
      }
    });
    observer.observe(img);
    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [enabled, status, attempt]);
  const media = (
    <div className={viewer ? "viewer-image-wrap" : "gallery-image-wrap"} aria-busy={enabled && status === "loading"}>
      {enabled && <img className={viewer ? "viewer-image" : "gallery-image"} key={attempt} ref={element} src={attempt ? failedSource.current : image.src}
        srcSet={!attempt && image.smallSrc && image.width > 640 ? `${image.smallSrc} 640w, ${image.src} ${image.width}w` : undefined}
        sizes={viewer ? "(min-width: 1080px) 1028px, 96vw" : "(min-width: 1520px) 1006px, (min-width: 768px) 67vw, 83vw"}
        width={image.width} height={image.height} alt={image.alt} loading={viewer && active ? "eager" : "lazy"} decoding="async" draggable={false}
        style={{ opacity: status === "loaded" ? 1 : 0 }} onLoad={() => {
          const retry = retryButton.current;
          if (retry && document.activeElement === retry) {
            const card = retry.closest(".gallery-slide")?.querySelector<HTMLButtonElement>(".gallery-card");
            (card ?? retry.closest<HTMLElement>(".viewer-viewport"))?.focus({ preventScroll: true });
          }
          setStatus("loaded");
        }}
        onError={event => { failedSource.current = event.currentTarget.currentSrc || event.currentTarget.src; setStatus("error"); }} />}
      {enabled && status === "loading" && <span className="image-loading">Loading image…</span>}
      {enabled && status === "error" && <span className="image-error">Image unavailable.</span>}
    </div>
  );
  return <>
    {viewer ? media : <button type="button" className="gallery-card" tabIndex={active ? 0 : -1} aria-label={`Open ${label}`} aria-haspopup="dialog" onClick={onOpen}>
      {media}
      <span className="gallery-caption"><strong>{image.title}</strong><span>{image.description}</span></span>
    </button>}
    {active && status === "error" && <div className="image-error" role="status">
      <button ref={retryButton} type="button" aria-label={`Retry image: ${image.title}`} onClick={event => {
        // Retry is a sibling of the card, never an invalid nested button.
        const card = event.currentTarget.closest(".gallery-slide")?.querySelector<HTMLButtonElement>(".gallery-card");
        (card ?? event.currentTarget.closest<HTMLElement>(".viewer-viewport"))?.focus({ preventScroll: true });
        setStatus("loading");
        setAttempt(value => value + 1);
      }}>Retry image</button>
    </div>}
  </>;
}

function CarouselControls({ carousel, images, viewportId, viewer = false }: {
  carousel: Pick<ReturnType<typeof useManualCarousel>, "index" | "previous" | "next" | "go">;
  images: GalleryImage[];
  viewportId: string;
  viewer?: boolean;
}) {
  return <div className={viewer ? "viewer-controls" : "gallery-controls"}>
    <button type="button" className="icon-button" aria-label="Previous image" aria-controls={viewportId} disabled={!carousel.previous} onClick={event => carousel.go(carousel.index - 1, event.detail === 0)}><ChevronLeft aria-hidden="true" /></button>
    <div className="gallery-dots" role="group" aria-label="Choose an image">
      {images.map((image, index) => <button key={`${image.src}-${index}`} type="button" className="gallery-dot"
        aria-label={`Show image ${index + 1} of ${images.length}: ${image.title}`} aria-current={index === carousel.index ? "true" : undefined}
        aria-controls={viewportId} onClick={event => carousel.go(index, event.detail === 0)} />)}
    </div>
    <button type="button" className="icon-button" aria-label="Next image" aria-controls={viewportId} disabled={!carousel.next} onClick={event => carousel.go(carousel.index + 1, event.detail === 0)}><ChevronRight aria-hidden="true" /></button>
    <span className="gallery-status sr-only" aria-live="polite" aria-atomic="true">Image {carousel.index + 1} of {images.length}: {images[carousel.index]?.title}</span>
  </div>;
}

function GalleryViewer({ images, initialIndex, reduced, onRestoreFocus }: {
  images: GalleryImage[];
  initialIndex: number;
  reduced: boolean;
  onRestoreFocus: () => void;
}) {
  const carousel = useManualCarousel(reduced, initialIndex);
  const viewportId = useId();
  const selected = Math.min(carousel.index, images.length - 1);
  const image = images[selected];
  const sourceUrl = image.sourceUrl && /^https?:\/\//i.test(image.sourceUrl) ? image.sourceUrl : undefined;
  return <Dialog.Portal>
    <Dialog.Overlay className="gallery-backdrop" />
    <Dialog.Content className="gallery-dialog" onKeyDown={carousel.onKeyDown} onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
      <div className="gallery-dialog-header">
        <div>
          <Dialog.Title className="gallery-title">{image.title}</Dialog.Title>
          <Dialog.Description className="gallery-description">{image.description}</Dialog.Description>
        </div>
        <Dialog.Close className="gallery-close icon-button" aria-label="Close gallery"><X aria-hidden="true" /></Dialog.Close>
      </div>
      <div className="viewer-viewport" ref={carousel.viewport} id={viewportId} tabIndex={-1} role="region" aria-roledescription="carousel" aria-label="Full-size images">
        <div className="viewer-track">
          {images.map((item, index) => <div key={`${item.src}-${index}`} className="viewer-slide" role="group" aria-roledescription="slide"
            aria-label={`${index + 1} of ${images.length}: ${item.title}`} aria-hidden={index !== selected}>
            <ImageSlide key={`${item.src}-${item.smallSrc}`} image={item} viewer active={index === selected} enabled={Math.abs(index - selected) <= 1} label={item.title} />
          </div>)}
        </div>
      </div>
      <CarouselControls carousel={carousel} images={images} viewportId={viewportId} viewer />
      {(image.credit || sourceUrl) && <p className="viewer-credit">{sourceUrl
        ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${image.credit || "Image source"} (opens in a new tab)`}>{image.credit || "Image source"}</a>
        : image.credit}</p>}
    </Dialog.Content>
  </Dialog.Portal>;
}

export function SlideWall({ images }: { images: GalleryImage[] }) {
  const reduced = useReducedMotion();
  const [selection, setSelection] = useState({ index: 0, instant: false });
  const viewportId = useId();
  const root = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const [open, setOpen] = useState(false);
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  const index = Math.min(selection.index, images.length - 1);
  const go = (target: number, instant = false) => setSelection({ index: Math.max(0, Math.min(images.length - 1, target)), instant });
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
    const target = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: images.length - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    go(target, true);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    suppressClickUntil.current = performance.now() + 500;
    go(index + (dx < 0 ? 1 : -1));
  };
  if (!images.length) return null;
  const image = images[index];
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <section ref={root} className="editorial-gallery" role="region" aria-roledescription="carousel" aria-label="Image gallery" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="gallery-viewport" id={viewportId} tabIndex={-1}
        onPointerDown={event => { if (event.isPrimary && event.button === 0) gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId }; }}
        onPointerUp={onPointerUp} onPointerCancel={() => { gesture.current = null; }}>
        <div className="gallery-slide" data-active="true" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${images.length}: ${image.title}`}>
          <div className="gallery-image-wrap">
            <GlassFold image={image} index={index} instant={selection.instant || reduced} />
            <button type="button" className="gallery-card" aria-label={`Open ${image.title}, image ${index + 1} of ${images.length}`} aria-haspopup="dialog" onClick={event => {
              if (event.defaultPrevented || performance.now() < suppressClickUntil.current) return;
              returnFocus.current = event.currentTarget;
              setOpenedIndex(index);
              setOpen(true);
            }}><span className="fold-open-label">View full image <ArrowUpRight aria-hidden="true" /></span></button>
          </div>
          <div className="gallery-caption"><span className="fold-count">{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span><strong>{image.title}</strong><span>{image.description}</span></div>
        </div>
      </div>
      <CarouselControls carousel={{ index, previous: index > 0, next: index < images.length - 1, go }} images={images} viewportId={viewportId} />
    </section>
    {openedIndex !== null && <GalleryViewer images={images} initialIndex={Math.min(openedIndex, images.length - 1)} reduced={reduced} onRestoreFocus={() => {
      if (open) return;
      setOpenedIndex(null);
      const target = returnFocus.current?.isConnected ? returnFocus.current : root.current;
      target?.focus({ preventScroll: true });
    }} />}
  </Dialog.Root>;
}
