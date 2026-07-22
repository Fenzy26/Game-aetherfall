// =============================================================================
// Lightweight object-pooled particle system for Canvas 2D.
// Design goals for mobile 60 FPS:
//  - Zero per-frame allocations: a fixed-size pool of particle objects is
//    reused forever (garbage-collector friendly).
//  - Cheap math only (no trig-heavy per-particle work besides what's needed).
//  - Caller controls dt via requestAnimationFrame so motion is frame-rate
//    independent even if a phone briefly drops frames.
// =============================================================================
import { ParticleEffect } from "@/lib/story";

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: "circle" | "spark" | "line";
  rotation: number;
  vrot: number;
}

const MAX_PARTICLES = 160;

function makePool(): Particle[] {
  const pool: Particle[] = [];
  for (let i = 0; i < MAX_PARTICLES; i++) {
    pool.push({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 1,
      color: "#ffffff",
      shape: "circle",
      rotation: 0,
      vrot: 0,
    });
  }
  return pool;
}

export class ParticleSystem {
  private pool: Particle[] = makePool();
  private cursor = 0;
  ambientEffect: ParticleEffect = "none";
  private ambientTimer = 0;

  private acquire(): Particle | null {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const idx = (this.cursor + i) % MAX_PARTICLES;
      if (!this.pool[idx].active) {
        this.cursor = (idx + 1) % MAX_PARTICLES;
        return this.pool[idx];
      }
    }
    return null;
  }

  setAmbient(effect: ParticleEffect) {
    this.ambientEffect = effect;
  }

  /** Spawns an instant visual burst tied to a story beat (portal, slash, etc). */
  burst(effect: ParticleEffect, w: number, h: number) {
    const cx = w / 2;
    const cy = h * 0.5;
    switch (effect) {
      case "portal":
        for (let i = 0; i < 70; i++) this.spawnSwirl(cx, cy, "#c084fc", "#f0abfc");
        break;
      case "magic_sparks":
        for (let i = 0; i < 40; i++) this.spawnSpark(cx, cy, "#7dd3fc");
        break;
      case "sword_slash":
        for (let i = 0; i < 30; i++) this.spawnLine(cx, cy, "#f8fafc");
        break;
      case "ember_drift":
        for (let i = 0; i < 35; i++) this.spawnFloat(w, h, "#fb923c");
        break;
      case "void_wisps":
        for (let i = 0; i < 40; i++) this.spawnSwirl(cx, cy, "#64748b", "#94a3b8");
        break;
      case "holy_light":
        for (let i = 0; i < 45; i++) this.spawnFloat(w, h, "#fde68a", -1);
        break;
      case "corruption":
        for (let i = 0; i < 45; i++) this.spawnSwirl(cx, cy, "#ef4444", "#7f1d1d");
        break;
      default:
        break;
    }
  }

  private spawnSwirl(cx: number, cy: number, colorA: string, colorB: string) {
    const p = this.acquire();
    if (!p) return;
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 30;
    p.active = true;
    p.x = cx + Math.cos(angle) * radius;
    p.y = cy + Math.sin(angle) * radius;
    const speed = 40 + Math.random() * 80;
    p.vx = Math.cos(angle) * speed * -1;
    p.vy = Math.sin(angle) * speed * -1 - 20;
    p.maxLife = 0.9 + Math.random() * 0.6;
    p.life = p.maxLife;
    p.size = 1.5 + Math.random() * 2.5;
    p.color = Math.random() > 0.5 ? colorA : colorB;
    p.shape = "circle";
    p.rotation = 0;
    p.vrot = 0;
  }

  private spawnSpark(cx: number, cy: number, color: string) {
    const p = this.acquire();
    if (!p) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    p.active = true;
    p.x = cx;
    p.y = cy;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.maxLife = 0.5 + Math.random() * 0.5;
    p.life = p.maxLife;
    p.size = 1 + Math.random() * 2;
    p.color = color;
    p.shape = "spark";
    p.rotation = angle;
    p.vrot = 0;
  }

  private spawnLine(cx: number, cy: number, color: string) {
    const p = this.acquire();
    if (!p) return;
    const angle = (Math.random() - 0.5) * 1.2 - Math.PI / 4;
    const speed = 200 + Math.random() * 200;
    p.active = true;
    p.x = cx + (Math.random() - 0.5) * 60;
    p.y = cy + (Math.random() - 0.5) * 60;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.maxLife = 0.25 + Math.random() * 0.2;
    p.life = p.maxLife;
    p.size = 10 + Math.random() * 20;
    p.color = color;
    p.shape = "line";
    p.rotation = angle;
    p.vrot = 0;
  }

  private spawnFloat(w: number, h: number, color: string, dir: 1 | -1 = 1) {
    const p = this.acquire();
    if (!p) return;
    p.active = true;
    p.x = Math.random() * w;
    p.y = dir === 1 ? h + 10 : -10;
    p.vx = (Math.random() - 0.5) * 20;
    p.vy = dir === 1 ? -(20 + Math.random() * 30) : 20 + Math.random() * 30;
    p.maxLife = 2.5 + Math.random() * 2;
    p.life = p.maxLife;
    p.size = 1.5 + Math.random() * 2.5;
    p.color = color;
    p.shape = "circle";
    p.rotation = 0;
    p.vrot = 0;
  }

  /** Low-frequency ambient spawns so every scene feels alive, kept cheap. */
  private updateAmbient(dt: number, w: number, h: number) {
    if (this.ambientEffect === "none") return;
    this.ambientTimer -= dt;
    if (this.ambientTimer > 0) return;
    this.ambientTimer = 0.12;
    switch (this.ambientEffect) {
      case "ember_drift":
        this.spawnFloat(w, h, "#fb923c");
        break;
      case "holy_light":
        this.spawnFloat(w, h, "#fde68a", -1);
        break;
      case "void_wisps":
        this.spawnFloat(w, h, "#94a3b8", -1);
        break;
      case "magic_sparks":
        this.spawnFloat(w, h, "#7dd3fc", -1);
        break;
      case "corruption":
        this.spawnFloat(w, h, "#ef4444");
        break;
      case "portal":
        this.spawnFloat(w, h, "#c084fc", -1);
        break;
      default:
        break;
    }
  }

  update(dt: number, w: number, h: number) {
    this.updateAmbient(dt, w, h);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 12 * dt; // gentle gravity/drift
      p.rotation += p.vrot * dt;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "spark") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "line") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-p.size / 2, 0);
        ctx.lineTo(p.size / 2, 0);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    for (let i = 0; i < MAX_PARTICLES; i++) this.pool[i].active = false;
  }
}
