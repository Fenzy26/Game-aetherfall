"use client";

import { StoryChoice } from "@/lib/story";

interface ChoiceListProps {
  choices: StoryChoice[];
  visible: boolean;
  onChoose: (choice: StoryChoice) => void;
}

const EFFECT_ICON: Record<string, string> = {
  hp: "❤",
  mp: "✦",
  karma: "☯",
  fragments: "◆",
};

function EffectHint({ choice }: { choice: StoryChoice }) {
  const e = choice.effects;
  if (!e) return null;
  const parts: string[] = [];
  if (e.hp) parts.push(`${EFFECT_ICON.hp}${e.hp > 0 ? "+" : ""}${e.hp}`);
  if (e.mp) parts.push(`${EFFECT_ICON.mp}${e.mp > 0 ? "+" : ""}${e.mp}`);
  if (e.karma) parts.push(`${EFFECT_ICON.karma}${e.karma > 0 ? "+" : ""}${e.karma}`);
  if (e.fragments) parts.push(`${EFFECT_ICON.fragments}+${e.fragments}`);
  if (parts.length === 0) return null;
  return <span className="ml-2 shrink-0 text-[11px] font-bold text-white/60">{parts.join(" ")}</span>;
}

/**
 * Touch-friendly choice buttons (min 48px tall tap targets) with a staggered
 * GPU-accelerated entrance animation (transform + opacity only).
 */
export default function ChoiceList({ choices, visible, onChoose }: ChoiceListProps) {
  if (!visible) return null;
  return (
    <div className="flex flex-col gap-2 pt-2">
      {choices.map((choice, i) => (
        <button
          key={choice.id}
          onClick={() => onChoose(choice)}
          className="choice-enter flex min-h-[52px] items-center justify-between rounded-xl border border-amber-300/40 bg-gradient-to-b from-white/15 to-white/5 px-4 py-3 text-left text-[15px] font-semibold text-white shadow-lg backdrop-blur-sm transition-transform active:scale-[0.97] active:from-amber-400/25"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">{choice.text}</span>
          <EffectHint choice={choice} />
        </button>
      ))}
    </div>
  );
}
