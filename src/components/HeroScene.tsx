import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { GlassFold } from "@/components/GlassFold";

type SceneImage = { src: string; smallSrc: string; width: number; height: number; alt: string };

export function HeroScene({ primary, detail }: { primary: SceneImage; detail: SceneImage }) {
  const scene = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = scene.current;
    const layer = rig.current;
    if (!host || !layer) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.02 ? requestAnimationFrame(tick) : 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      if (motion.matches || !pointer.matches || event.pointerType !== "mouse") return;
      const bounds = host.getBoundingClientRect();
      tx = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
      ty = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
      start();
    };
    const reset = () => { if (motion.matches || !pointer.matches) return; tx = 0; ty = 0; start(); };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      x = y = tx = ty = 0;
      layer.style.transform = "";
    };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", reset);
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
    };
  }, []);

  return <div className="hero-scene" ref={scene}>
    <div className="hero-photo-rig" ref={rig}>
      <figure className="hero-photo">
        <GlassFold image={primary} cover={detail} hero />
        <figcaption className="hero-fold-caption"><span>One vision. Different perspectives.</span><span>MAKINGREAL / 01</span></figcaption>
      </figure>
      <a className="hero-gallery-link glass" href="#work"><span>Explore visual directions</span><ArrowUpRight aria-hidden="true" /></a>
    </div>
  </div>;
}
