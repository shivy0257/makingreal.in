import { useEffect } from "react";

const INTERACTIVE = 'a, button, [role="button"], summary, label, .chip, select';
const TEXT_FIELD = 'input, textarea, select, [contenteditable="true"]';
const TRAIL_FRAMES = 9;
const FRAME_WEIGHTS = [0.55, 0.46, 0.38, 0.31, 0.25, 0.19, 0.145, 0.105, 0.075];
const FRAME_SCALES = [0.94, 0.91, 0.88, 0.85, 0.82, 0.79, 0.76, 0.73, 0.7];
const FRAME_DELAY = 27;
const HISTORY_MS = 900;
const BASE_FRAME = 16.7;

type Point = { x: number; y: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const CORNERS = '<span class="mr-corner mr-tl"></span><span class="mr-corner mr-tr"></span><span class="mr-corner mr-bl"></span><span class="mr-corner mr-br"></span><span class="mr-dot"></span>';

export function ReticleCursor() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let teardown: (() => void) | null = null;

    const mount = () => {
      const root = document.createElement("div");
      root.className = "mr-cursor is-hidden";
      root.setAttribute("aria-hidden", "true");
      root.innerHTML = `
        <svg class="mr-trail" aria-hidden="true" focusable="false">
          <path class="mr-trail-blur" />
          <path class="mr-trail-core" />
        </svg>
        ${Array.from({ length: TRAIL_FRAMES }, () => `<div class="mr-frame"><div class="mr-frame-box">${CORNERS}</div></div>`).join("")}
        <div class="mr-pulse"><span class="mr-pulse-ring"></span></div>
        <div class="mr-main"><div class="mr-halo"></div><div class="mr-main-box">${CORNERS}</div></div>`;
      document.body.appendChild(root);
      document.documentElement.classList.add("has-reticle-cursor");

      const main = root.querySelector<HTMLElement>(".mr-main")!;
      const mainBox = root.querySelector<HTMLElement>(".mr-main-box")!;
      const frameEls = Array.from(root.querySelectorAll<HTMLElement>(".mr-frame"));
      const trail = root.querySelector<SVGSVGElement>(".mr-trail")!;
      const trailBlur = root.querySelector<SVGPathElement>(".mr-trail-blur")!;
      const trailCore = root.querySelector<SVGPathElement>(".mr-trail-core")!;
      const pulse = root.querySelector<HTMLElement>(".mr-pulse")!;
      const pulseRing = root.querySelector<HTMLElement>(".mr-pulse-ring")!;

      const frames: Point[] = Array.from({ length: TRAIL_FRAMES }, () => ({ x: -100, y: -100 }));
      const history: { x: number; y: number; t: number }[] = [];
      const trailPoints: Point[] = Array.from({ length: TRAIL_FRAMES + 1 }, () => ({ x: -100, y: -100 }));
      let x = -100, y = -100, targetX = -100, targetY = -100;
      let lastX = 0, lastY = 0, lastT = 0, lastMoveT = 0;
      let speed = 0, hoverT = 0, hoverTarget = 0, trailVis = 0;
      let raf = 0, scrollRaf = 0, moved = false, lastTarget: EventTarget | null = null;
      let lastFrameT = 0;

      const setHoverState = (target: EventTarget | null) => {
        if (!(target instanceof Element)) return;
        const text = !!target.closest(TEXT_FIELD);
        const interactive = !text && !!target.closest(INTERACTIVE);
        root.classList.toggle("is-text", text);
        root.classList.toggle("is-hover", interactive);
        hoverTarget = interactive ? 1 : 0;
      };

      const pathD = (points: Point[]) => {
        if (points.length < 2) return "";
        let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
        for (let i = 1; i < points.length - 1; i++) {
          const mx = (points[i].x + points[i + 1].x) / 2;
          const my = (points[i].y + points[i + 1].y) / 2;
          d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
        }
        const end = points[points.length - 1];
        d += ` L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
        return d;
      };

      const sampleAt = (time: number, out: Point) => {
        const last = history.length - 1;
        if (last < 0) { out.x = targetX; out.y = targetY; return; }
        if (time >= history[last].t) { out.x = history[last].x; out.y = history[last].y; return; }
        if (time <= history[0].t) { out.x = history[0].x; out.y = history[0].y; return; }
        let i = last;
        while (i > 0 && history[i].t > time) i--;
        const a = history[i];
        const b = history[Math.min(i + 1, last)];
        const f = clamp((time - a.t) / (b.t - a.t || 1), 0, 1);
        out.x = a.x + (b.x - a.x) * f;
        out.y = a.y + (b.y - a.y) * f;
      };

      const resetTrail = () => {
        trail.style.opacity = "0";
        trailBlur.setAttribute("d", "");
        trailCore.setAttribute("d", "");
      };

      const setTrailPath = () => {
        for (let i = 0; i < TRAIL_FRAMES; i++) {
          trailPoints[i].x = frames[TRAIL_FRAMES - 1 - i].x;
          trailPoints[i].y = frames[TRAIL_FRAMES - 1 - i].y;
        }
        trailPoints[TRAIL_FRAMES].x = x;
        trailPoints[TRAIL_FRAMES].y = y;
        const d = pathD(trailPoints);
        trailBlur.setAttribute("d", d);
        trailCore.setAttribute("d", d);
      };

      const tick = () => {
        raf = 0;
        const now = performance.now();
        const rawDt = lastFrameT ? now - lastFrameT : BASE_FRAME;
        const dt = clamp(rawDt, 8, 64);
        lastFrameT = now;
        const step = (factor: number) => 1 - Math.pow(1 - factor, dt / BASE_FRAME);

        x += (targetX - x) * step(0.55);
        y += (targetY - y) * step(0.55);
        if (Math.abs(targetX - x) + Math.abs(targetY - y) < 0.05) { x = targetX; y = targetY; }
        main.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

        speed *= Math.pow(0.9, dt / BASE_FRAME);
        hoverT += (hoverTarget - hoverT) * step(0.16);

        const idleMs = now - lastMoveT;
        const idle = idleMs > 140;
        const fadeTau = idle ? 420 : 85;
        trailVis += ((idle ? 0 : 1) - trailVis) * (1 - Math.exp(-dt / fadeTau));

        const speedNorm = clamp(speed / 2.4, 0, 1);

        while (history.length > 2 && now - history[0].t > HISTORY_MS) history.shift();

        const compression = 1 - hoverT * 0.32;
        for (let i = 0; i < TRAIL_FRAMES; i++) {
          const frame = frames[i];
          sampleAt(now - (i + 1) * FRAME_DELAY * compression, frame);
          const alpha = FRAME_WEIGHTS[i] * trailVis * (0.45 + 0.55 * speedNorm) * (1 - hoverT * 0.5);
          const el = frameEls[i];
          el.style.transform = `translate3d(${frame.x.toFixed(2)}px, ${frame.y.toFixed(2)}px, 0) scale(${FRAME_SCALES[i].toFixed(3)})`;
          el.style.opacity = alpha.toFixed(3);
          el.style.visibility = alpha < 0.012 ? "hidden" : "visible";
        }

        trail.style.opacity = (trailVis * (0.2 + 0.55 * speedNorm) * (1 - hoverT * 0.55)).toFixed(3);
        if (trailVis > 0.01) setTrailPath();

        const settling = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.25;
        const breathing = Math.abs(hoverTarget - hoverT) > 0.01 || trailVis > 0.01;
        if (settling || breathing) raf = requestAnimationFrame(tick);
      };

      const start = () => {
        if (!raf && !document.hidden) {
          lastFrameT = 0;
          raf = requestAnimationFrame(tick);
        }
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const nx = event.clientX, ny = event.clientY;
        const now = performance.now();
        if (!moved) {
          moved = true;
          x = targetX = lastX = nx;
          y = targetY = lastY = ny;
          frames.forEach(frame => { frame.x = nx; frame.y = ny; });
          history.length = 0;
          main.style.transform = `translate3d(${nx}px, ${ny}px, 0)`;
        } else {
          const dt = Math.max(now - lastT, 1);
          const distance = Math.hypot(nx - lastX, ny - lastY);
          const inst = distance / dt;
          speed = Math.max(speed * 0.55, Math.min(inst, 4));
        }
        history.push({ x: nx, y: ny, t: now });
        if (history.length > 240) history.shift();
        lastX = nx; lastY = ny; lastT = now; lastMoveT = now;
        targetX = nx; targetY = ny;
        if (root.classList.contains("is-hidden")) root.classList.remove("is-hidden");
        if (event.target !== lastTarget) { lastTarget = event.target; setHoverState(event.target); }
        start();
      };

      const onOver = (event: PointerEvent) => {
        if (!moved || event.pointerType === "touch" || event.target === lastTarget) return;
        lastTarget = event.target;
        setHoverState(event.target);
        start();
      };

      const onDown = (event: PointerEvent) => {
        if (event.pointerType === "touch" || event.button !== 0 || !moved) return;
        mainBox.classList.remove("is-click");
        void mainBox.offsetWidth;
        mainBox.classList.add("is-click");
        pulse.style.transform = `translate3d(${event.clientX.toFixed(1)}px, ${event.clientY.toFixed(1)}px, 0)`;
        pulseRing.classList.remove("is-on");
        void pulseRing.offsetWidth;
        pulseRing.classList.add("is-on");
      };

      const onPulseEnd = () => pulseRing.classList.remove("is-on");
      const onLeave = () => root.classList.add("is-hidden");
      const onScroll = () => {
        if (scrollRaf) return;
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          if (!moved) return;
          const under = document.elementFromPoint(targetX, targetY);
          if (under && under !== lastTarget) { lastTarget = under; setHoverState(under); start(); }
        });
      };
      const onResize = () => {
        history.length = 0;
        frames.forEach(frame => { frame.x = targetX; frame.y = targetY; });
        resetTrail();
      };
      const onVisibility = () => {
        if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
        else start();
      };

      const onAnimEnd = (event: AnimationEvent) => {
        if (event.animationName === "mr-reticle-click") mainBox.classList.remove("is-click");
        if (event.animationName === "mr-pulse") pulseRing.classList.remove("is-on");
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
      mainBox.addEventListener("animationend", onAnimEnd);
      pulseRing.addEventListener("animationend", onAnimEnd);

      teardown = () => {
        cancelAnimationFrame(raf);
        cancelAnimationFrame(scrollRaf);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerdown", onDown);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("blur", onLeave);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        mainBox.removeEventListener("animationend", onAnimEnd);
        pulseRing.removeEventListener("animationend", onAnimEnd);
        root.remove();
        document.documentElement.classList.remove("has-reticle-cursor");
      };
    };

    const sync = () => {
      const shouldRun = fine.matches && !reduced.matches;
      if (shouldRun && !teardown) mount();
      else if (!shouldRun && teardown) {
        teardown();
        teardown = null;
      }
    };

    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      teardown?.();
    };
  }, []);

  return null;
}
