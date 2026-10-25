import { useEffect, useRef } from "react";
import cafe from "@/assets/cafe-editorial.webp";
import creator from "@/assets/creator-editorial.webp";
import coast from "@/assets/coast-editorial.webp";

const frames = [
  { image: cafe, className: "frame-food", width: 900, height: 900 },
  { image: creator, className: "frame-creator", width: 900, height: 1350 },
  { image: coast, className: "frame-coast", width: 900, height: 600 },
];

export function PhotoWall({ contact = false }: { contact?: boolean }) {
  const wall = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = wall.current;
    const host = node?.parentElement;
    if (!node || !host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let targetX = 0, targetY = 0, x = 0, y = 0, raf = 0;
    const tick = () => {
      x += (targetX - x) * 0.065;
      y += (targetY - y) * 0.065;
      node.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
      node.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.05) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !fine.matches) return;
      const rect = host.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 55;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 40;
      start();
    };
    const reset = () => { targetX = 0; targetY = 0; start(); };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", reset);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={wall} className={`photo-wall ${contact ? "photo-wall-contact" : ""}`} aria-hidden="true">
    {frames.map(frame => <div className={`photo-frame ${frame.className}`} key={frame.className}>
      <div className="frame-inner"><img src={frame.image} alt="" width={frame.width} height={frame.height} loading={contact ? "lazy" : "eager"} decoding="async" /></div>
    </div>)}
  </div>;
}