"use client";

import { GameStats } from "@/lib/gameEngine";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  colorClass: string;
  icon: string;
}

function StatBar({ label, value, max, colorClass, icon }: StatBarProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-4 shrink-0 text-center text-[11px] leading-none">{icon}</span>
      <div className="flex-1">
        <div className="mb-0.5 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{label}</span>
          <span className="text-[9px] font-bold text-white/70">{Math.round(value)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/50">
          <div
            className={`h-full origin-left rounded-full ${colorClass} transition-transform duration-500 ease-out`}
            style={{ transform: `scaleX(${pct})`, width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

function karmaLabel(karma: number): { text: string; className: string } {
  if (karma >= 40) return { text: "Suci", className: "text-sky-300" };
  if (karma >= 10) return { text: "Baik", className: "text-emerald-300" };
  if (karma > -10) return { text: "Netral", className: "text-slate-200" };
  if (karma > -40) return { text: "Kelam", className: "text-orange-300" };
  return { text: "Terkorupsi", className: "text-red-400" };
}

export default function StatusHUD({ stats }: { stats: GameStats }) {
  const karma = karmaLabel(stats.karma);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto mx-auto flex max-w-md flex-col gap-1.5 rounded-2xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <StatBar label="HP" value={stats.hp} max={100} colorClass="bg-gradient-to-r from-red-600 to-red-400" icon="❤" />
          <StatBar label="MP" value={stats.mp} max={100} colorClass="bg-gradient-to-r from-sky-600 to-sky-400" icon="✦" />
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">☯</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">Karma</span>
            <span className={`text-[10px] font-extrabold ${karma.className}`}>{karma.text}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">Fragmen</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rotate-45 rounded-[2px] border ${
                    i < stats.fragments ? "border-fuchsia-300 bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.9)]" : "border-white/30 bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
