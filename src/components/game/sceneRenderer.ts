// =============================================================================
// Procedural background renderer — pure Canvas 2D, no external images.
// Each scene is drawn ONCE into an offscreen-style cache canvas whenever the
// scene changes (never per-frame), which is what keeps the mobile render loop
// at a steady 60 FPS: per-frame work is limited to the particle layer only.
// =============================================================================
import { SceneKey } from "@/lib/story";

interface SceneTheme {
  sky: [string, string, string]; // gradient stops top -> bottom
  glow: string;
  ground: string;
  accent: string;
  mode: "castle" | "vortex" | "city" | "hall" | "tunnel" | "lab" | "data" | "temple" | "core" | "void";
}

const THEMES: Record<SceneKey, SceneTheme> = {
  eldrath_battle: { sky: ["#1a0f2e", "#3a1c4a", "#0c0714"], glow: "#a855f7", ground: "#150a1f", accent: "#e2b6ff", mode: "castle" },
  portal_rift: { sky: ["#0b0620", "#3b0d63", "#000010"], glow: "#c084fc", ground: "#05030d", accent: "#f0abfc", mode: "vortex" },
  neo_veyron_city: { sky: ["#050b1e", "#0f2247", "#020510"], glow: "#38bdf8", ground: "#040814", accent: "#22d3ee", mode: "city" },
  council_hall: { sky: ["#1a1408", "#3a2a0d", "#0d0a04"], glow: "#facc15", ground: "#120d05", accent: "#fde68a", mode: "hall" },
  rebel_hideout: { sky: ["#170a05", "#3a1a08", "#0a0503"], glow: "#fb923c", ground: "#0d0704", accent: "#fdba74", mode: "tunnel" },
  council_lab: { sky: ["#031018", "#0a2a3a", "#010a10"], glow: "#22d3ee", ground: "#020c12", accent: "#67e8f9", mode: "lab" },
  spy_data: { sky: ["#010e08", "#063018", "#000905"], glow: "#22c55e", ground: "#010c07", accent: "#86efac", mode: "data" },
  ancient_temple: { sky: ["#0a0f1a", "#152238", "#05070c"], glow: "#5eead4", ground: "#060a10", accent: "#99f6e4", mode: "temple" },
  rift_core: { sky: ["#0a0418", "#2a0a4a", "#04010c"], glow: "#e879f9", ground: "#07020f", accent: "#f0abfc", mode: "core" },
  ending_true: { sky: ["#031326", "#0a3a5c", "#010914"], glow: "#7dd3fc", ground: "#020a14", accent: "#bae6fd", mode: "core" },
  ending_good: { sky: ["#1c1404", "#4a3505", "#0d0902"], glow: "#facc15", ground: "#120d04", accent: "#fde68a", mode: "hall" },
  ending_normal: { sky: ["#04160f", "#0c3a26", "#02100a"], glow: "#34d399", ground: "#02140d", accent: "#a7f3d0", mode: "city" },
  ending_bad: { sky: ["#050608", "#14161c", "#020304"], glow: "#64748b", ground: "#030405", accent: "#94a3b8", mode: "void" },
  ending_secret: { sky: ["#1a0303", "#420a0a", "#0a0101"], glow: "#ef4444", ground: "#100202", accent: "#fca5a5", mode: "core" },
};

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function renderScene(ctx: CanvasRenderingContext2D, w: number, h: number, scene: SceneKey) {
  const theme = THEMES[scene] ?? THEMES.neo_veyron_city;
  const rand = seededRandom(scene.length * 97 + w);

  ctx.clearRect(0, 0, w, h);

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, theme.sky[0]);
  sky.addColorStop(0.55, theme.sky[1]);
  sky.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Ambient glow behind horizon
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, w * 0.7);
  glow.addColorStop(0, theme.glow + "55");
  glow.addColorStop(1, theme.glow + "00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Starfield / floating motes (deterministic per scene, drawn once)
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 60; i++) {
    const x = rand() * w;
    const y = rand() * h * 0.6;
    const r = rand() * 1.4 + 0.2;
    ctx.globalAlpha = rand() * 0.6 + 0.15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const groundY = h * 0.72;

  switch (theme.mode) {
    case "castle": {
      // jagged silhouette of a ruined castle
      ctx.fillStyle = theme.ground;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, groundY + 40);
      let x = 0;
      const towerBase = groundY + 40;
      const widths = [40, 20, 60, 30, 80, 25, 50, 20, 70];
      for (const wtower of widths) {
        const th = rand() * 90 + 30;
        ctx.lineTo(x, towerBase - th);
        ctx.lineTo(x + wtower * 0.4, towerBase - th - 18);
        ctx.lineTo(x + wtower, towerBase - th);
        x += wtower;
      }
      ctx.lineTo(x, h);
      ctx.closePath();
      ctx.fill();
      // lightning crack
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(w * 0.65, 0);
      ctx.lineTo(w * 0.6, h * 0.18);
      ctx.lineTo(w * 0.68, h * 0.24);
      ctx.lineTo(w * 0.58, h * 0.4);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case "vortex": {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.strokeStyle = theme.accent;
        ctx.globalAlpha = 0.12 + i * 0.02;
        ctx.lineWidth = 3;
        ctx.arc(0, 0, 30 + i * 24, i * 0.4, i * 0.4 + Math.PI * 1.4);
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      break;
    }
    case "city": {
      ctx.fillStyle = theme.ground;
      let x = 0;
      while (x < w) {
        const bw = rand() * 50 + 30;
        const bh = rand() * (h * 0.35) + 60;
        ctx.fillRect(x, groundY - bh + 40, bw, bh + 200);
        // windows
        ctx.fillStyle = theme.accent;
        ctx.globalAlpha = 0.5;
        for (let wy = groundY - bh + 55; wy < groundY + 30; wy += 14) {
          for (let wx = x + 6; wx < x + bw - 6; wx += 12) {
            if (rand() > 0.55) ctx.fillRect(wx, wy, 4, 6);
          }
        }
        ctx.fillStyle = theme.ground;
        ctx.globalAlpha = 1;
        x += bw + rand() * 10 + 4;
      }
      break;
    }
    case "hall": {
      ctx.fillStyle = theme.ground;
      ctx.fillRect(0, groundY, w, h - groundY);
      for (let i = 0; i < 6; i++) {
        const px = (w / 6) * i + 30;
        ctx.fillStyle = theme.ground;
        ctx.fillRect(px, groundY - 220, 18, 220);
        const glowPillar = ctx.createLinearGradient(px, groundY - 220, px, groundY);
        glowPillar.addColorStop(0, theme.accent + "aa");
        glowPillar.addColorStop(1, theme.accent + "00");
        ctx.fillStyle = glowPillar;
        ctx.fillRect(px + 2, groundY - 220, 4, 220);
      }
      break;
    }
    case "tunnel": {
      ctx.fillStyle = theme.ground;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.quadraticCurveTo(w * 0.5, groundY - 60, w, h);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        const r = 10 + i * 4;
        ctx.strokeStyle = theme.accent;
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(w / 2, groundY + 40, r * 6, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "lab": {
      ctx.strokeStyle = theme.accent;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * (h / 10));
        ctx.lineTo(w, i * (h / 10) + 20);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = theme.ground;
      ctx.fillRect(0, groundY + 20, w, h - groundY);
      break;
    }
    case "data": {
      ctx.fillStyle = theme.accent;
      for (let i = 0; i < 40; i++) {
        const x = rand() * w;
        const len = rand() * 60 + 20;
        ctx.globalAlpha = rand() * 0.4 + 0.1;
        ctx.fillRect(x, rand() * h, 2, len);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "temple": {
      ctx.fillStyle = theme.ground;
      for (let i = 0; i < 7; i++) {
        const px = (w / 7) * i + 20;
        const ph = rand() * 100 + 120;
        ctx.fillRect(px, groundY - ph, 16, ph + 60);
      }
      break;
    }
    case "core": {
      const core = ctx.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.35);
      core.addColorStop(0, theme.accent + "ff");
      core.addColorStop(0.4, theme.glow + "88");
      core.addColorStop(1, theme.glow + "00");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = 0.5 - i * 0.1;
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((i * Math.PI) / 4);
        ctx.translate(-w / 2, -h / 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "void": {
      ctx.fillStyle = theme.ground;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = theme.accent;
        ctx.globalAlpha = rand() * 0.1;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, rand() * 80 + 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
  }

  // subtle vignette for legibility of text overlay
  const vignette = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.2, w / 2, h * 0.55, h * 0.95);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}
