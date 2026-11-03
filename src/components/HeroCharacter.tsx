import { useEffect, useRef } from "react";

const VIDEO_SRC = "/hero-camera-boy.mp4";
const VW = 1920;
const VH = 1080;

// Measured from the actual video frame (1920x1080)
const LENS = { x: 1198 / VW, y: 878 / VH };
const CHAR_BOX = { x0: 764 / VW, x1: 1628 / VW, y0: 0, y1: 1076 / VH };

export function HeroCharacter() {
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const video = videoRef.current;
    const rig = rigRef.current;
    const flash = flashRef.current;
    if (!layer || !video || !rig || !flash) return;

    const interactive = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!motion.matches) video.play().catch(() => {});

    let cx = 0, cy = 0, cw = 1, ch = 1;

    const measure = () => {
      const el = video.getBoundingClientRect();
      const vw = video.videoWidth || VW;
      const vh = video.videoHeight || VH;
      if (!el.width || !el.height) return;
      const s = Math.max(el.width / vw, el.height / vh);
      cw = vw * s;
      ch = vh * s;
      const op = getComputedStyle(video).objectPosition.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
      const px = op ? Number(op[1]) : 50;
      const py = op ? Number(op[2]) : 50;
      cx = (el.width - cw) * (px / 100);
      cy = (el.height - ch) * (py / 100);
      const size = (190 / VW) * cw;
      flash.style.left = `${cx + cw * LENS.x}px`;
      flash.style.top = `${cy + ch * LENS.y}px`;
      flash.style.width = `${size}px`;
      flash.style.height = `${size}px`;
    };

    measure();
    video.addEventListener("loadedmetadata", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(layer);

    // Camera-lens flash: deliberate click or tap on the character only
    let lastFlash = 0;
    const onTap = (e: MouseEvent) => {
      if (motion.matches) return;
      const now = performance.now();
      if (now - lastFlash < 260) return;
      const rect = layer.getBoundingClientRect();
      const fx = (e.clientX - rect.left - cx) / cw;
      const fy = (e.clientY - rect.top - cy) / ch;
      if (fx < CHAR_BOX.x0 || fx > CHAR_BOX.x1 || fy < CHAR_BOX.y0 || fy > CHAR_BOX.y1) return;
      lastFlash = now;
      flash.animate(
        [
          { opacity: 0, transform: "translate(-50%, -50%) scale(.25)" },
          { opacity: 0.95, transform: "translate(-50%, -50%) scale(.82)", offset: 0.22 },
          { opacity: 0, transform: "translate(-50%, -50%) scale(1.2)" },
        ],
        { duration: 520, easing: "cubic-bezier(.2, .7, .3, 1)" }
      );
    };
    layer.addEventListener("click", onTap);

    // Cursor-responsive rig: restrained translation + slight tilt, eased
    const rigPos = { x: 0, y: 0, r: 0, tx: 0, ty: 0, tr: 0 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (motion.matches) return;
      const nx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth - 0.5) * 2));
      const ny = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight - 0.5) * 2));
      rigPos.tx = nx * 16;
      rigPos.ty = ny * 10;
      rigPos.tr = nx * 1.1;
    };
    const onLeave = () => {
      rigPos.tx = 0; rigPos.ty = 0; rigPos.tr = 0;
    };
    const tick = () => {
      rigPos.x += (rigPos.tx - rigPos.x) * 0.055;
      rigPos.y += (rigPos.ty - rigPos.y) * 0.055;
      rigPos.r += (rigPos.tr - rigPos.r) * 0.055;
      rig.style.transform = `translate3d(${rigPos.x}px, ${rigPos.y}px, 0) rotate(${rigPos.r}deg)`;
      raf = requestAnimationFrame(tick);
    };

    const syncMotion = () => {
      if (motion.matches) {
        video.pause();
        onLeave();
        cancelAnimationFrame(raf);
        raf = 0;
        rig.style.transform = "";
      } else {
        video.play().catch(() => {});
        if (interactive && !raf) raf = requestAnimationFrame(tick);
      }
    };

    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      if (!motion.matches) raf = requestAnimationFrame(tick);
    }
    motion.addEventListener("change", syncMotion);

    return () => {
      video.removeEventListener("loadedmetadata", measure);
      ro.disconnect();
      layer.removeEventListener("click", onTap);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      motion.removeEventListener("change", syncMotion);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hero-character" ref={layerRef} aria-hidden="true">
      <div className="hero-character-rig" ref={rigRef}>
        <div className="hero-character-idle">
          <video
            ref={videoRef}
            className="hero-character-video"
            src={VIDEO_SRC}
            poster="/hero-camera-boy-poster.webp"
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          />
          <div className="hero-flash" ref={flashRef} />
        </div>
      </div>
    </div>
  );
}
