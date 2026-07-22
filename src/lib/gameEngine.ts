// =============================================================================
// Game Engine — pure, dependency-free state transitions for the VN/RPG loop.
// Kept separate from React so it stays cheap to test and cheap to run on
// every choice tap (no heavy allocations, plain objects only).
// =============================================================================
import {
  ENDING_META,
  EndingKey,
  EndingResolver,
  FlagKey,
  START_NODE_ID,
  STORY,
  StoryChoice,
  StoryNode,
} from "./story";

export interface GameFlags {
  alliedRebels: boolean;
  trainedDarkPower: boolean;
  corrupted: boolean;
  doubleAgent: boolean;
}

export interface GameStats {
  hp: number;
  mp: number;
  karma: number;
  fragments: number;
}

export const MAX_HP = 100;
export const MAX_MP = 100;
export const MIN_KARMA = -100;
export const MAX_KARMA = 100;

export interface GameState {
  nodeId: string;
  stats: GameStats;
  flags: GameFlags;
  history: string[]; // node ids visited, used for the "journey log"
  ending: EndingKey | null;
}

export function createInitialState(): GameState {
  return {
    nodeId: START_NODE_ID,
    stats: { hp: 100, mp: 50, karma: 0, fragments: 0 },
    flags: {
      alliedRebels: false,
      trainedDarkPower: false,
      corrupted: false,
      doubleAgent: false,
    },
    history: [START_NODE_ID],
    ending: null,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function applyEffects(stats: GameStats, effects?: StoryChoice["effects"]): GameStats {
  if (!effects) return stats;
  return {
    hp: clamp(stats.hp + (effects.hp ?? 0), 0, MAX_HP),
    mp: clamp(stats.mp + (effects.mp ?? 0), 0, MAX_MP),
    karma: clamp(stats.karma + (effects.karma ?? 0), MIN_KARMA, MAX_KARMA),
    fragments: clamp(stats.fragments + (effects.fragments ?? 0), 0, 3),
  };
}

function applyFlags(flags: GameFlags, setFlags?: FlagKey[]): GameFlags {
  if (!setFlags || setFlags.length === 0) return flags;
  const next = { ...flags };
  for (const key of setFlags) next[key] = true;
  return next;
}

export function getCurrentNode(state: GameState): StoryNode | null {
  return STORY[state.nodeId] ?? null;
}

export function isChoiceAvailable(choice: StoryChoice, stats: GameStats): boolean {
  const c = choice.condition;
  if (!c) return true;
  if (c.minKarma !== undefined && stats.karma < c.minKarma) return false;
  if (c.maxKarma !== undefined && stats.karma > c.maxKarma) return false;
  if (c.minFragments !== undefined && stats.fragments < c.minFragments) return false;
  if (c.minMp !== undefined && stats.mp < c.minMp) return false;
  if (c.minHp !== undefined && stats.hp < c.minHp) return false;
  return true;
}

export function getAvailableChoices(node: StoryNode, stats: GameStats): StoryChoice[] {
  return node.choices.filter((choice) => isChoiceAvailable(choice, stats));
}

function resolveEnding(resolver: EndingResolver, stats: GameStats): EndingKey {
  switch (resolver) {
    case "give_up":
      return "normal";
    case "control_rift":
      if (stats.hp <= 0) return "bad";
      return stats.fragments >= 3 ? "true" : stats.karma >= 0 ? "good" : "bad";
    case "sacrifice":
      if (stats.hp <= 0) return "bad";
      return stats.karma >= 15 ? "good" : "normal";
    case "seize_power":
      if (stats.hp <= 0) return "bad";
      return stats.karma <= -20 ? "secret" : "bad";
    case "fight":
      if (stats.hp <= 0) return "bad";
      return stats.karma >= 10 ? "good" : "bad";
    default:
      return "normal";
  }
}

export interface ApplyChoiceResult {
  state: GameState;
  ending: EndingKey | null;
}

/**
 * Applies a chosen StoryChoice to the current state, producing the next
 * immutable GameState. This is the single source of truth for how RPG stats
 * (HP / MP / Karma / Fragments) evolve and how the 5 endings are unlocked.
 */
export function applyChoice(state: GameState, choice: StoryChoice): ApplyChoiceResult {
  const stats = applyEffects(state.stats, choice.effects);
  const flags = applyFlags(state.flags, choice.setFlags);

  // Global safety net: if HP ever drops to zero, the run is lost regardless
  // of the node graph — this guarantees the Bad Ending is always reachable.
  if (stats.hp <= 0) {
    const nextState: GameState = {
      ...state,
      stats,
      flags,
      ending: "bad",
    };
    return { state: nextState, ending: "bad" };
  }

  if (choice.resolver) {
    const ending = resolveEnding(choice.resolver, stats);
    const nextState: GameState = {
      ...state,
      stats,
      flags,
      ending,
    };
    return { state: nextState, ending };
  }

  const nextNodeId = choice.next ?? state.nodeId;
  const nextState: GameState = {
    ...state,
    nodeId: nextNodeId,
    stats,
    flags,
    history: [...state.history, nextNodeId],
    ending: null,
  };
  return { state: nextState, ending: null };
}

export function getEndingMeta(ending: EndingKey) {
  return ENDING_META[ending];
}
