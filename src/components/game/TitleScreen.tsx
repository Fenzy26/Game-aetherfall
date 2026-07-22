"use client";

import GameCanvas from "./GameCanvas";

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <GameCanvas scene="portal_rift" burstKey="title" effect="portal" />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-6 py-[max(2rem,env(safe-area-inset-top))] text-center">
        <div className="mt-6 flex flex-col items-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-fuchsia-300">Isekai Visual Novel · RPG</p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-[1.05] text-white [text-shadow:0_2px_18px_rgba(192,132,252,0.7)] sm:text-5xl">
            Aetherfall
          </h1>
          <h2 className="mt-1 text-lg font-bold text-amber-300 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
            Sang Penjelajah Dunia
          </h2>
        </div>

        <div className="mx-auto max-w-md rounded-2xl border border-white/15 bg-black/70 p-5 backdrop-blur-sm">
          <p className="text-[15px] leading-relaxed text-white/90">
            Kau adalah <span className="font-bold text-amber-300">Ser Kaelen Draven</span>, pengembara pedang legendaris
            dari dunia Eldrath. Sebuah Anomali Dimensi menyeretmu ke <span className="font-bold text-sky-300">Neo-Veyron</span>,
            dunia asing berteknologi sihir yang tengah di ambang keruntuhan.
          </p>
          <p className="mt-3 text-[13px] font-semibold text-white/60">
            Setiap pilihanmu membentuk HP, Mana, dan Karma — dan menuntun ke salah satu dari{" "}
            <span className="text-amber-300">5 akhir cerita</span> berbeda.
          </p>
        </div>

        <div className="mb-4 flex w-full max-w-sm flex-col items-center gap-3">
          <button
            onClick={onStart}
            className="w-full rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 px-6 py-4 text-lg font-black uppercase tracking-wide text-black shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-transform active:scale-95"
          >
            Mulai Petualangan
          </button>
          <p className="text-[11px] text-white/50">Ketuk dialog untuk mempercepat teks · Ketuk pilihan untuk melanjutkan</p>
        </div>
      </div>
    </div>
  );
}
