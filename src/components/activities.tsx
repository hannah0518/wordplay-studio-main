import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import type { Lesson } from "@/lib/lesson-schema";
import { playCelebrate, playClick, playCorrect, playWrong, speak } from "@/lib/fx";
import { DynamicIcon } from "./dynamic-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type ActivityProps = {
  lesson: Lesson;
  onXp: (amount: number, activity: string) => void;
  onBadge: (id: string) => void;
  onCelebrate: () => void;
};

const shuffle = <T,>(items: T[]) =>
  items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

function ActivityShell({
  title,
  subtitle,
  children,
  progress,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  progress?: number;
}) {
  return (
    <Card className="card-soft animate-pop-in gap-5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-xl">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {progress !== undefined && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            {Math.round(progress)}% done
          </span>
        )}
      </div>
      {progress !== undefined && <Progress value={progress} className="h-2" />}
      {children}
    </Card>
  );
}

/* ---------------- Vocabulary ---------------- */

export function VocabularyCards({ lesson }: { lesson: Lesson }) {
  return (
    <ActivityShell title="Vocabulary" subtitle="Tap the speaker to hear each word.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lesson.vocabulary.map((item) => (
          <div
            key={item.word}
            className="group rounded-2xl border bg-gradient-to-br from-card to-muted/70 p-4 transition-transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                <DynamicIcon name={item.iconName} className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg leading-tight">{item.word}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 rounded-full"
                    aria-label={`Pronounce ${item.word}`}
                    onClick={() => speak(item.word)}
                  >
                    <Volume2 className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{item.phonetic}</p>
              </div>
            </div>
            <p className="mt-3 text-sm">{item.definition}</p>
            <p className="mt-2 border-l-2 border-berry/50 pl-2 text-sm italic text-muted-foreground">
              {item.exampleSentence}
            </p>
          </div>
        ))}
      </div>
    </ActivityShell>
  );
}

/* ---------------- Flashcards ---------------- */

export function Flashcards({ lesson, onXp, onBadge }: ActivityProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState<number[]>([]);
  const card = lesson.flashcards[index]!;

  const next = () => {
    playClick();
    setFlipped(false);
    setIndex((i) => (i + 1) % lesson.flashcards.length);
  };

  const flip = () => {
    playClick();
    setFlipped((f) => !f);
    if (!seen.includes(index)) {
      const updated = [...seen, index];
      setSeen(updated);
      onXp(5, "flashcards");
      if (updated.length >= Math.min(8, lesson.flashcards.length)) onBadge("flash-master");
    }
  };

  return (
    <ActivityShell
      title="Flip Flashcards"
      subtitle="Guess the meaning, then flip the card."
      progress={(seen.length / lesson.flashcards.length) * 100}
    >
      <button
        onClick={flip}
        className="relative mx-auto h-56 w-full max-w-xl [perspective:1200px]"
        aria-label="Flip card"
      >
        <div
          className={cn(
            "relative size-full transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <div className="absolute inset-0 grid place-items-center rounded-3xl bg-gradient-to-br from-primary/20 to-sky/20 p-6 text-center [backface-visibility:hidden]">
            <p className="font-display text-3xl">{card.front}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Lightbulb className="size-4" /> {card.hint}
            </p>
          </div>
          <div className="absolute inset-0 grid place-items-center rounded-3xl bg-gradient-to-br from-berry/20 to-accent p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-lg font-bold">{card.back}</p>
          </div>
        </div>
      </button>
      <div className="flex justify-center gap-3">
        <Button variant="secondary" onClick={() => speak(card.front)}>
          <Volume2 /> Listen
        </Button>
        <Button onClick={next}>
          Next card <ArrowRight />
        </Button>
      </div>
    </ActivityShell>
  );
}

/* ---------------- Matching ---------------- */

export function MatchingGame({ lesson, onXp, onBadge, onCelebrate }: ActivityProps) {
  const [round, setRound] = useState(0);
  const terms = useMemo(() => shuffle(lesson.matchingPairs), [lesson, round]);
  const defs = useMemo(() => shuffle(lesson.matchingPairs), [lesson, round]);
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);

  const choose = (definition: string, term: string) => {
    if (!picked) return;
    if (picked === term) {
      playCorrect();
      const updated = [...matched, term];
      setMatched(updated);
      setPicked(null);
      onXp(10, "matching");
      if (updated.length === lesson.matchingPairs.length) {
        onBadge("match-maker");
        onCelebrate();
        playCelebrate();
      }
    } else {
      playWrong();
      setWrong(definition);
      setTimeout(() => setWrong(null), 500);
    }
  };

  const reset = () => {
    setRound((r) => r + 1);
    setMatched([]);
    setPicked(null);
  };

  return (
    <ActivityShell
      title="Matching Game"
      subtitle="Tap a word, then tap its meaning."
      progress={(matched.length / lesson.matchingPairs.length) * 100}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          {terms.map((pair) => {
            const done = matched.includes(pair.term);
            return (
              <button
                key={pair.term}
                disabled={done}
                onClick={() => {
                  playClick();
                  setPicked(pair.term);
                }}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-left font-bold transition-all",
                  done && "border-success/50 bg-success/20 text-success-foreground opacity-70",
                  !done && picked === pair.term && "border-primary bg-primary/15 scale-[1.02]",
                  !done && picked !== pair.term && "bg-card hover:border-primary/50",
                )}
              >
                {pair.term}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {defs.map((pair) => {
            const done = matched.includes(pair.term);
            return (
              <button
                key={pair.definition}
                disabled={done}
                onClick={() => choose(pair.definition, pair.term)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-left text-sm transition-all",
                  done && "border-success/50 bg-success/20 opacity-70",
                  wrong === pair.definition && "animate-wiggle border-destructive bg-destructive/10",
                  !done && "bg-muted/50 hover:border-sky/60",
                )}
              >
                {pair.definition}
              </button>
            );
          })}
        </div>
      </div>
      <Button variant="secondary" className="self-start" onClick={reset}>
        <RefreshCw /> Shuffle again
      </Button>
    </ActivityShell>
  );
}

/* ---------------- True / False ---------------- */

export function TrueFalseChallenge({ lesson, onXp, onBadge, onCelebrate }: ActivityProps) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const total = lesson.trueFalseQuestions.length;
  const q = lesson.trueFalseQuestions[Math.min(index, total - 1)]!;
  const finished = index >= total;

  const pick = (value: boolean) => {
    setAnswer(value);
    if (value === q.isTrue) {
      playCorrect();
      onXp(10, "true-false");
    } else playWrong();
  };

  const next = () => {
    setAnswer(null);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= total) {
      onBadge("truth-seeker");
      onCelebrate();
      playCelebrate();
    }
  };

  return (
    <ActivityShell
      title="True or False"
      subtitle="Read carefully and decide."
      progress={(Math.min(index, total) / total) * 100}
    >
      {finished ? (
        <div className="space-y-4 py-6 text-center">
          <p className="font-display text-2xl">Challenge complete! 🎉</p>
          <Button
            onClick={() => {
              setIndex(0);
              setAnswer(null);
            }}
          >
            <RotateCcw /> Play again
          </Button>
        </div>
      ) : (
        <>
          <p className="rounded-2xl bg-muted/60 p-5 text-lg font-bold">{q.statement}</p>
          <div className="flex gap-3">
            <Button
              className="h-14 flex-1 bg-success text-success-foreground hover:bg-success/85"
              disabled={answer !== null}
              onClick={() => pick(true)}
            >
              <Check /> True
            </Button>
            <Button
              variant="destructive"
              className="h-14 flex-1"
              disabled={answer !== null}
              onClick={() => pick(false)}
            >
              <X /> False
            </Button>
          </div>
          {answer !== null && (
            <div className="animate-pop-in space-y-3 rounded-2xl border bg-card p-4">
              <p className="font-bold">
                {answer === q.isTrue ? "Correct! +10 XP" : "Not quite."}
              </p>
              <p className="text-sm text-muted-foreground">{q.explanation}</p>
              <Button onClick={next}>
                Continue <ArrowRight />
              </Button>
            </div>
          )}
        </>
      )}
    </ActivityShell>
  );
}

/* ---------------- Lucky Spin Wheel ---------------- */

const WHEEL_COLORS = [
  "var(--color-primary)",
  "var(--color-sky)",
  "var(--color-berry)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-accent)",
];

export function LuckyWheel({
  lesson,
  onXp,
  onSpin,
}: {
  lesson: Lesson;
  onXp: (amount: number, activity: string) => void;
  onSpin: () => void;
}) {
  const slices = lesson.vocabulary.slice(0, 8);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const step = 360 / slices.length;

  const gradient = `conic-gradient(${slices
    .map(
      (_, i) =>
        `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * step}deg ${(i + 1) * step}deg`,
    )
    .join(", ")})`;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    playClick();
    const target = Math.floor(Math.random() * slices.length);
    const turns = 4 + Math.floor(Math.random() * 3);
    const final = turns * 360 + (360 - target * step - step / 2);
    setAngle((a) => a + final);
    onSpin();
    setTimeout(() => {
      setSpinning(false);
      setResult(target);
      onXp(8, "wheel");
      playCorrect();
      speak(slices[target]!.word);
    }, 2600);
  };

  return (
    <ActivityShell title="Lucky Spin" subtitle="Spin to practise a random word.">
      <div className="flex flex-col items-center gap-5">
        <div className="relative size-64">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-2xl">▼</div>
          <div
            className="size-full rounded-full border-8 border-card shadow-soft transition-transform duration-[2500ms] ease-out"
            style={{ backgroundImage: gradient, transform: `rotate(${angle}deg)` }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid size-20 place-items-center rounded-full bg-card font-display text-sm shadow-soft">
              SPIN
            </div>
          </div>
        </div>
        <Button size="lg" onClick={spin} disabled={spinning}>
          {spinning ? "Spinning..." : "Spin the wheel"}
        </Button>
        {result !== null && (
          <div className="animate-pop-in w-full max-w-md rounded-2xl border bg-muted/50 p-4 text-center">
            <p className="font-display text-2xl">{slices[result]!.word}</p>
            <p className="text-xs text-muted-foreground">{slices[result]!.phonetic}</p>
            <p className="mt-2 text-sm">{slices[result]!.definition}</p>
            <p className="mt-1 text-sm italic text-muted-foreground">
              {slices[result]!.exampleSentence}
            </p>
          </div>
        )}
      </div>
    </ActivityShell>
  );
}

/* ---------------- Fill in the blanks ---------------- */

export function FillInTheBlanks({ lesson, onXp, onCelebrate }: ActivityProps) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const total = lesson.fillInTheBlanks.length;
  const item = lesson.fillInTheBlanks[Math.min(index, total - 1)]!;
  const options = useMemo(() => shuffle(item.options), [item]);
  const done = index >= total;

  const pick = (option: string) => {
    setChoice(option);
    if (option === item.answer) {
      playCorrect();
      onXp(10, "fill-blanks");
    } else playWrong();
  };

  const next = () => {
    setChoice(null);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= total) {
      onCelebrate();
      playCelebrate();
    }
  };

  return (
    <ActivityShell
      title="Dialogue Fill-in-the-Blanks"
      subtitle="Choose the word that completes the line."
      progress={(Math.min(index, total) / total) * 100}
    >
      {done ? (
        <div className="space-y-4 py-6 text-center">
          <p className="font-display text-2xl">All blanks filled! ✨</p>
          <Button onClick={() => setIndex(0)}>
            <RotateCcw /> Try again
          </Button>
        </div>
      ) : (
        <>
          <p className="rounded-2xl bg-muted/60 p-5 text-lg leading-relaxed">
            {item.sentence.split("___").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span
                    className={cn(
                      "mx-1 inline-block min-w-24 rounded-lg border-b-2 border-dashed border-primary px-2 text-center font-bold",
                      choice && choice === item.answer && "border-success text-success-foreground",
                      choice && choice !== item.answer && "border-destructive",
                    )}
                  >
                    {choice ?? " "}
                  </span>
                )}
              </span>
            ))}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((option) => (
              <Button
                key={option}
                variant={choice === option ? "default" : "secondary"}
                className="h-12 justify-start"
                disabled={choice !== null}
                onClick={() => pick(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          {choice && (
            <div className="animate-pop-in flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4">
              <p className="font-bold">
                {choice === item.answer
                  ? "Perfect! +10 XP"
                  : `The answer is "${item.answer}".`}
              </p>
              <Button className="ml-auto" onClick={next}>
                Continue <ArrowRight />
              </Button>
            </div>
          )}
        </>
      )}
    </ActivityShell>
  );
}

/* ---------------- Quiz ---------------- */

export function Quiz({ lesson, onXp, onBadge, onCelebrate }: ActivityProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const total = lesson.quiz.length;
  const q = lesson.quiz[Math.min(index, total - 1)]!;
  const done = index >= total;

  const pick = (i: number) => {
    setPicked(i);
    if (i === q.correctAnswerIndex) {
      playCorrect();
      setScore((s) => s + 1);
      onXp(15, "quiz");
    } else playWrong();
  };

  const next = () => {
    setPicked(null);
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= total) {
      if (score >= 5) onBadge("quiz-whiz");
      onCelebrate();
      playCelebrate();
    }
  };

  return (
    <ActivityShell
      title="Multiple Choice Quiz"
      subtitle="Show what you learned."
      progress={(Math.min(index, total) / total) * 100}
    >
      {done ? (
        <div className="space-y-4 py-6 text-center">
          <p className="font-display text-3xl">
            {score}/{total} correct
          </p>
          <p className="text-sm text-muted-foreground">
            {score === total ? "Flawless run!" : "Great effort — try again for a perfect score."}
          </p>
          <Button
            onClick={() => {
              setIndex(0);
              setScore(0);
            }}
          >
            <RotateCcw /> Retake quiz
          </Button>
        </div>
      ) : (
        <>
          <p className="text-lg font-bold">
            {index + 1}. {q.question}
          </p>
          <div className="grid gap-2">
            {q.options.map((option, i) => {
              const isCorrect = i === q.correctAnswerIndex;
              return (
                <button
                  key={option}
                  disabled={picked !== null}
                  onClick={() => pick(i)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition-all",
                    picked === null && "bg-card hover:-translate-y-0.5 hover:border-primary/60",
                    picked !== null && isCorrect && "border-success bg-success/20",
                    picked === i && !isCorrect && "border-destructive bg-destructive/10",
                    picked !== null && !isCorrect && picked !== i && "opacity-60",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="animate-pop-in flex flex-wrap items-center gap-3 rounded-2xl border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">{q.explanation}</p>
              <Button className="ml-auto" onClick={next}>
                Continue <ArrowRight />
              </Button>
            </div>
          )}
        </>
      )}
    </ActivityShell>
  );
}
