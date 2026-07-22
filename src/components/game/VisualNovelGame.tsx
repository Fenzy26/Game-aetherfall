"use client";

import { useMemo, useState } from "react";
import {
  applyChoice,
  createInitialState,
  getAvailableChoices,
  getCurrentNode,
  GameState,
} from "@/lib/gameEngine";
import { StoryChoice } from "@/lib/story";
import GameCanvas from "./GameCanvas";
import StatusHUD from "./StatusHUD";
import DialogueBox from "./DialogueBox";
import ChoiceList from "./ChoiceList";
import TitleScreen from "./TitleScreen";
import EndingScreen from "./EndingScreen";

type Phase = "title" | "playing" | "ending";

export default function VisualNovelGame() {
  const [phase, setPhase] = useState<Phase>("title");
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [revealed, setRevealed] = useState(false);

  const node = getCurrentNode(state);
  const availableChoices = useMemo<StoryChoice[]>(() => {
    if (!node) return [];
    return getAvailableChoices(node, state.stats);
  }, [node, state.stats]);

  function startGame() {
    setState(createInitialState());
    setRevealed(false);
    setPhase("playing");
  }

  function choose(choice: StoryChoice) {
    const result = applyChoice(state, choice);
    setState(result.state);
    setRevealed(false);
    if (result.ending) {
      setPhase("ending");
    }
  }

  function restart() {
    setState(createInitialState());
    setRevealed(false);
    setPhase("title");
  }

  if (phase === "title") {
    return <TitleScreen onStart={startGame} />;
  }

  if (phase === "ending" && state.ending) {
    return <EndingScreen ending={state.ending} stats={state.stats} onRestart={restart} />;
  }

  if (!node) {
    return <TitleScreen onStart={startGame} />;
  }

  const burstKey = `${node.id}`;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <GameCanvas scene={node.scene} burstKey={burstKey} effect={node.effect ?? "none"} />
      <StatusHUD stats={state.stats} />
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <DialogueBox
          speaker={node.speaker}
          text={node.text}
          textKey={node.id}
          onRevealChange={setRevealed}
        />
        <ChoiceList choices={availableChoices} visible={revealed} onChoose={choose} />
      </div>
    </div>
  );
}
