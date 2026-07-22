"use client";

import { useEffect, useRef } from "react";
import { ParticleEffect, SceneKey } from "@/lib/story";
import { renderScene } from "./sceneRenderer";
import { ParticleSystem } from "./particleSystem";

interface GameCanvasProps {
  scene: SceneKey;
  /** Changes identity (nodeId+effect) whenever a fresh burst should fire. */
  burstKey: string;
  effect: ParticleEffect;
}

/**
 * Renders the whole visual layer of the VN: a crossfading procedural
 * background (two stacked canvases, GPU-composited via CSS opacity +
 * translate3d) plus a single particle canvas driven by one
 * requestAnimationFrame loop. The background is only repainted when the
 * scene changes — never per frame — so the steady-state per-frame cost is
 * just "update + draw ~160 particles", which comfortably holds 60 FPS on
 * mobile browsers.
 */
export default function GameCanvas({ scene, burstKey, effect }: GameCanvasProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bgRefA = useRef<HTMLCanvasElement | null>(null);
  const bgRefB = useRef<HTMLCanvasElement | null>(null);
  const particleRef = useRef<HTMLCanvasElement | null>(null);
  const activeLayerRef = useRef<"a" | "b">("a");
  const systemRef = useRef<ParticleSystem | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const runningRef = useRef(true);

  // Initialize particle system + RAF loop once.
  useEffect(() => {
    systemRef.current = new ParticleSystem();
    const wrap = wrapRef.current;
    if (!wrap) return;

    function resize() {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      sizeRef.current = { w, h, dpr };
      for (const ref of [bgRefA, bgRefB, particleRef]) {
        const canvas = ref.current;
        if (!canvas) continue;
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      // Repaint whichever bg layer is currently visible after a resize.
      const visibleCanvas = activeLayerRef.current === "a" ? bgRefA.current : bgRefB.current;
      const ctx = visibleCanvas?.getContext("2d");
      if (ctx) renderScene(ctx, w, h, scene);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    function onVisibility() {
      runningRef.current = document.visibilityState === "visible";
      if (runningRef.current) lastTsRef.current = null;
    }
    document.addEventListener("visibilitychange", onVisibility);

    function loop(ts: number) {
      rafRef.current = requestAnimationFrame(loop);
      if (!runningRef.current) return;
      if (lastTsRef.current == null) lastTsRef.current = ts;
      let dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      // Clamp dt to avoid huge jumps after tab switches / frame drops.
      dt = Math.min(dt, 1 / 20);

      const { w, h } = sizeRef.current;
      const canvas = particleRef.current;
      const system = systemRef.current;
      if (!canvas || !system || w === 0 || h === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      system.update(dt, w, h);
      ctx.clearRect(0, 0, w, h);
      system.draw(ctx);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      systemRef.current?.clear();
      systemRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Repaint background (crossfade) whenever the scene changes.
  useEffect(() => {
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;
    const nextLayer = activeLayerRef.current === "a" ? "b" : "a";
    const canvas = nextLayer === "a" ? bgRefA.current : bgRefB.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) renderScene(ctx, w, h, scene);
    activeLayerRef.current = nextLayer;
    // Force a style flush via rAF so the opacity transition below actually
    // animates instead of snapping.
    requestAnimationFrame(() => {
      const elA = bgRefA.current;
      const elB = bgRefB.current;
      if (!elA || !elB) return;
      elA.style.opacity = nextLayer === "a" ? "1" : "0";
      elB.style.opacity = nextLayer === "b" ? "1" : "0";
    });
    systemRef.current?.setAmbient(effect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  // Fire a one-shot burst whenever the node (burstKey) changes.
  useEffect(() => {
    const { w, h } = sizeRef.current;
    if (!systemRef.current || w === 0 || h === 0) return;
    systemRef.current.burst(effect, w, h);
    systemRef.current.setAmbient(effect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burstKey]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-black">
      <canvas
        ref={bgRefA}
        className="absolute inset-0 h-full w-full will-change-[opacity] transition-opacity duration-700 ease-in-out"
        style={{ opacity: 1, transform: "translate3d(0,0,0)" }}
      />
      <canvas
        ref={bgRefB}
        className="absolute inset-0 h-full w-full will-change-[opacity] transition-opacity duration-700 ease-in-out"
        style={{ opacity: 0, transform: "translate3d(0,0,0)" }}
      />
      <canvas
        ref={particleRef}
        className="absolute inset-0 h-full w-full"
        style={{ transform: "translate3d(0,0,0)" }}
      />
    </div>
  );
}
