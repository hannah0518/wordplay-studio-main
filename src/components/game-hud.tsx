import { Flame, Snowflake, Star, Trophy, Zap, CheckCircle2, Circle } from "lucide-react";
import { BADGES, QUESTS, type GameState } from "@/lib/game-state";
import { DynamicIcon } from "./dynamic-icon";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Props = {
  state: GameState;
  level: { level: number; current: number; needed: number };
  questProgress: Record<string, number>;
};

export function GameHud({ state, level, questProgress }: Props) {
  const pct = Math.round((level.current / level.needed) * 100);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="card-soft animate-pop-in gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg">Level {level.level}</span>
          <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
            <Zap className="size-4" /> {state.xp} XP
          </span>
        </div>
        <Progress value={pct} className="h-3" />
        <p className="text-xs text-muted-foreground">
          {level.needed - level.current} XP to level {level.level + 1}
        </p>
      </Card>

      <Card className="card-soft animate-pop-in gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-warning/25 text-warning-foreground">
            <Flame className="size-6" />
          </div>
          <div>
            <p className="font-display text-lg leading-tight">{state.streak}-day streak</p>
            <p className="text-xs text-muted-foreground">+{state.xpToday} XP today</p>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Snowflake className="size-3.5 text-sky" /> {state.streakFreezes} streak freeze
          {state.streakFreezes === 1 ? "" : "s"} left
        </p>
      </Card>

      <Card className="card-soft animate-pop-in gap-3 p-5">
        <p className="flex items-center gap-2 font-display text-lg">
          <Trophy className="size-5 text-primary" /> Daily quests
        </p>
        <ul className="space-y-1.5">
          {QUESTS.map((q) => {
            const done = (questProgress[q.id] ?? 0) >= q.target;
            return (
              <li key={q.id} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className={cn(done && "text-muted-foreground line-through")}>
                  {q.label}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {Math.min(questProgress[q.id] ?? 0, q.target)}/{q.target}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="card-soft col-span-full gap-3 p-5">
        <p className="flex items-center gap-2 font-display text-lg">
          <Star className="size-5 text-berry" /> Badges
          <span className="text-sm font-normal text-muted-foreground">
            {state.badges.length}/{BADGES.length}
          </span>
        </p>
        <div className="flex flex-wrap gap-3">
          {BADGES.map((b) => {
            const unlocked = state.badges.includes(b.id);
            return (
              <div
                key={b.id}
                title={b.description}
                className={cn(
                  "flex min-w-36 flex-1 items-center gap-2 rounded-2xl border p-3 transition-transform hover:-translate-y-0.5",
                  unlocked
                    ? "border-primary/40 bg-primary/10"
                    : "border-dashed bg-muted/60 opacity-60",
                )}
              >
                <DynamicIcon
                  name={b.icon}
                  className={cn("size-5", unlocked ? "text-primary" : "text-muted-foreground")}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{b.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
