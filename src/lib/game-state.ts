import { useCallback, useEffect, useState } from "react";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const BADGES: Badge[] = [
  { id: "first-lesson", name: "First Steps", description: "Generate your first lesson", icon: "sparkles" },
  { id: "flash-master", name: "Flash Master", description: "Review 8 flashcards", icon: "zap" },
  { id: "match-maker", name: "Match Maker", description: "Finish the matching game", icon: "puzzle" },
  { id: "quiz-whiz", name: "Quiz Whiz", description: "Score 5+ on a quiz", icon: "brain" },
  { id: "truth-seeker", name: "Truth Seeker", description: "Complete True / False", icon: "scale" },
  { id: "lucky-one", name: "Lucky One", description: "Spin the wheel 5 times", icon: "gauge" },
  { id: "streak-3", name: "On Fire", description: "Reach a 3-day streak", icon: "flame" },
  { id: "level-5", name: "Rising Star", description: "Reach level 5", icon: "star" },
];

export const QUESTS = [
  { id: "earn-100-xp", label: "Earn 100 XP today", target: 100 },
  { id: "play-3", label: "Play 3 different activities", target: 3 },
  { id: "spin-1", label: "Spin the Lucky Wheel", target: 1 },
] as const;

export type GameState = {
  xp: number;
  xpToday: number;
  lastActiveDay: string;
  streak: number;
  streakFreezes: number;
  badges: string[];
  spins: number;
  activitiesToday: string[];
};

const KEY = "lingoquest.game.v1";

export const xpForLevel = (level: number) => level * 120;

export function levelFromXp(xp: number) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, current: remaining, needed: xpForLevel(level) };
}

const today = () => new Date().toISOString().slice(0, 10);

function freshState(): GameState {
  return {
    xp: 0,
    xpToday: 0,
    lastActiveDay: today(),
    streak: 1,
    streakFreezes: 2,
    badges: [],
    spins: 0,
    activitiesToday: [],
  };
}

function rollDay(state: GameState): GameState {
  const day = today();
  if (state.lastActiveDay === day) return state;
  const diff = Math.round(
    (Date.parse(day) - Date.parse(state.lastActiveDay)) / 86400000,
  );
  let { streak, streakFreezes } = state;
  if (diff === 1) streak += 1;
  else if (diff > 1 && streakFreezes > 0) streakFreezes -= 1;
  else streak = 1;
  return { ...state, lastActiveDay: day, streak, streakFreezes, xpToday: 0, activitiesToday: [] };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(freshState);
  const [hydrated, setHydrated] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      setState(stored ? rollDay({ ...freshState(), ...JSON.parse(stored) }) : freshState());
    } catch {
      setState(freshState());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const awardBadge = useCallback((id: string) => {
    setState((prev) => {
      if (prev.badges.includes(id)) return prev;
      const badge = BADGES.find((b) => b.id === id);
      if (badge) setNewBadge(badge);
      return { ...prev, badges: [...prev.badges, id] };
    });
  }, []);

  const addXp = useCallback((amount: number, activity?: string) => {
    setState((prev) => {
      const before = levelFromXp(prev.xp).level;
      const after = levelFromXp(prev.xp + amount).level;
      if (after > before) setLevelUp(after);
      const activitiesToday =
        activity && !prev.activitiesToday.includes(activity)
          ? [...prev.activitiesToday, activity]
          : prev.activitiesToday;
      return {
        ...prev,
        xp: prev.xp + amount,
        xpToday: prev.xpToday + amount,
        activitiesToday,
      };
    });
  }, []);

  const registerSpin = useCallback(() => {
    setState((prev) => ({ ...prev, spins: prev.spins + 1 }));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (state.streak >= 3) awardBadge("streak-3");
    if (levelFromXp(state.xp).level >= 5) awardBadge("level-5");
    if (state.spins >= 5) awardBadge("lucky-one");
  }, [state.streak, state.xp, state.spins, hydrated, awardBadge]);

  const questProgress = {
    "earn-100-xp": state.xpToday,
    "play-3": state.activitiesToday.length,
    "spin-1": Math.min(state.spins, 1),
  } as Record<string, number>;

  return {
    state,
    hydrated,
    addXp,
    awardBadge,
    registerSpin,
    levelUp,
    clearLevelUp: () => setLevelUp(null),
    newBadge,
    clearNewBadge: () => setNewBadge(null),
    questProgress,
    level: levelFromXp(state.xp),
  };
}
