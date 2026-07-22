"use client";

import { useEffect, useState } from "react";
import { EndingKey } from "@/lib/story";
import { GameStats, getEndingMeta } from "@/lib/gameEngine";
import GameCanvas from "./GameCanvas";

interface EndingScreenProps {
  ending: EndingKey;
  stats: GameStats;
  onRestart: () => void;
}

const ORDER: EndingKey[] = ["true", "good", "normal", "bad", "secret"];
const LABELS: Record<EndingKey, string> = {
  true: "The World Walker",
  good: "The New Hero",
  normal: "Peaceful Life",
  bad: "Lost in the Void",
  secret: "The Overlord",
};

export default function EndingScreen({ ending, stats, onRestart }: EndingScreenProps) {
  const meta = getEndingMeta(ending);
  const [codex, setCodex] = useState<Record<string, number> | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function save() {
      try {
        await fetch("/api/endings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endingKey: ending,
            finalHp: stats.hp,
            finalMp: stats.mp,
            finalKarma: stats.karma,
            fragments: stats.fragments,
          }),
        });
      } catch {
        // Non-fatal: the game still shows the ending even if the codex save fails.
      } finally {
        if (!cancelled) setSaved(true);
      }
    }
    save();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!saved) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/endings", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setCodex(data.counts ?? null);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [saved]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <GameCanvas scene={meta.scene} burstKey={`ending-${ending}`} effect={meta.effect} />
      <div className="relative z-10 flex h-full w-full flex-col overflow-y-auto px-5 py-[max(2rem,env(safe-area-inset-top))]">
        <div className="mx-auto w-full max-w-md flex-1">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-white/60">{meta.subtitle}</p>
          <h1
            className="mt-2 text-center text-3xl font-black uppercase leading-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.9)]"
            style={{ color: meta.color }}
          >
            {meta.title}
          </h1>

          <div className="mt-4 rounded-2xl border border-white/15 bg-black/75 p-4 backdrop-blur-sm">
            <p className="text-[15px] leading-relaxed text-white/95">{meta.text}</p>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-black/60 p-3 text-center">
            <div>
              <p className="text-[10px] uppercase text-white/50">HP</p>
              <p className="text-sm font-bold text-red-300">{stats.hp}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/50">MP</p>
              <p className="text-sm font-bold text-sky-300">{stats.mp}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/50">Karma</p>
              <p className="text-sm font-bold text-emerald-300">{stats.karma}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/50">Fragmen</p>
              <p className="text-sm font-bold text-fuchsia-300">{stats.fragments}/3</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/60 p-4">
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-white/60">
              Ending Codex Global
            </p>
            <div className="flex flex-col gap-1.5">
              {ORDER.map((key) => {
                const count = codex?.[key] ?? 0;
                const isThis = key === ending;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] ${
                      isThis ? "bg-amber-400/20 text-amber-200" : "bg-white/5 text-white/70"
                    }`}
                  >
                    <span className="font-semibold">{LABELS[key]}</span>
                    <span className="font-bold">{codex ? count : "…"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="sticky bottom-4 mx-auto mt-5 w-full max-w-md shrink-0 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 px-6 py-4 text-base font-black uppercase tracking-wide text-black shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-transform active:scale-95"
        >
          Mainkan Lagi
        </button>
      </div>
    </div>
  );
}
