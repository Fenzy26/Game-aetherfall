"use client";

import { useEffect, useRef, useState } from "react";

interface DialogueBoxProps {
  speaker: string;
  text: string;
  /** Identity used to restart the typewriter animation on new dialogue. */
  textKey: string;
  onRevealChange?: (fullyRevealed: boolean) => void;
}

const CHARS_PER_SECOND = 45;

/**
 * High-contrast, large-type dialogue box with a GPU-friendly typewriter
 * effect driven by requestAnimationFrame (no per-character setState/DOM
 * thrash — a single string slice per frame).
 */
export default function DialogueBox({ speaker, text, textKey, onRevealChange }: DialogueBoxProps) {
  const [shown, setShown] = useState(text);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    setShown("");
    doneRef.current = false;
    startRef.current = null;
    onRevealChange?.(false);

    function step(ts: number) {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const count = Math.min(text.length, Math.floor(elapsed * CHARS_PER_SECOND));
      setShown(text.slice(0, count));
      if (count >= text.length) {
        doneRef.current = true;
        onRevealChange?.(true);
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textKey]);

  function skip() {
    if (doneRef.current) return;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    setShown(text);
    doneRef.current = true;
    onRevealChange?.(true);
  }

  return (
    <button
      type="button"
      onClick={skip}
      className="block w-full rounded-2xl border border-white/15 bg-black/80 p-4 text-left shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm active:bg-black/85"
    >
      <div className="mb-1.5 inline-block rounded-md bg-amber-400/95 px-2.5 py-0.5 text-[13px] font-extrabold uppercase tracking-wide text-black">
        {speaker}
      </div>
      <p className="min-h-[4.5em] text-[16px] font-medium leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
        {shown}
        {shown.length < text.length && <span className="animate-pulse text-yellow-300">▍</span>}
      </p>
    </button>
  );
}
