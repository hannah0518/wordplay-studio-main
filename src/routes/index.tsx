import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { BookOpenCheck, Loader2, Sparkles, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generateLesson } from "@/lib/lesson.functions";
import type { Lesson } from "@/lib/lesson-schema";
import { useGameState } from "@/lib/game-state";
import { playCelebrate } from "@/lib/fx";
import { GameHud } from "@/components/game-hud";
import { Confetti } from "@/components/confetti";
import { BadgeModal, LevelUpModal } from "@/components/celebration-modals";
import {
  Flashcards,
  FillInTheBlanks,
  LuckyWheel,
  MatchingGame,
  Quiz,
  TrueFalseChallenge,
  VocabularyCards,
} from "@/components/activities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsDialog } from "@/components/settings-dialog";
import { AuthDialog } from "@/components/auth-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LogOut, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LingoQuest — Turn Any Text into a Gamified English Lesson" },
      {
        name: "description",
        content:
          "Paste text or upload a file and LingoQuest builds vocabulary cards, flashcards, quizzes, and games with XP, streaks, and badges for ESL learners.",
      },
      { property: "og:title", content: "LingoQuest — Gamified English Lessons from Any Text" },
      {
        property: "og:description",
        content:
          "AI-generated ESL lessons with flashcards, matching games, quizzes, a lucky spin wheel, XP, streaks and badges.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const SAMPLE = `Ordering food at a restaurant. Useful phrases: a table for two, menu, starter, main course, dessert, bill, waiter, reservation. A polite customer asks: "Could I see the menu, please?" The waiter recommends the soup of the day.`;

const LEVELS = ["beginner", "elementary", "intermediate"] as const;

function Home() {
  const game = useGameState();
  const { user, signOut } = useAuth();
  const [source, setSource] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("beginner");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [apiKey] = useLocalStorage("gemini-api-key", "");
  const fileRef = useRef<HTMLInputElement>(null);

  const generate = useServerFn(generateLesson);
  const mutation = useMutation({
    mutationFn: (input: { source: string; level: typeof level; apiKey?: string }) => generate({ data: input }),
    onSuccess: (data) => {
      setLesson(data);
      game.addXp(20, "generate");
      game.awardBadge("first-lesson");
      setConfetti((c) => c + 1);
      playCelebrate();
      toast.success("Your lesson is ready!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const celebrate = () => setConfetti((c) => c + 1);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 400_000) {
      toast.error("That file is a bit large — try a shorter excerpt.");
      return;
    }
    const text = await file.text();
    const clean = text.replace(/\u0000/g, "").trim();
    if (clean.length < 20) {
      toast.error("Couldn't read text from that file. Paste the text instead.");
      return;
    }
    setSource(clean.slice(0, 20000));
    toast.success(`Loaded ${file.name}`);
  };

  const submit = () => {
    if (source.trim().length < 10) {
      toast.error("Add a topic or paste some text first.");
      return;
    }
    mutation.mutate({ source: source.trim(), level, apiKey });
  };

  const activityProps = {
    onXp: game.addXp,
    onBadge: game.awardBadge,
    onCelebrate: celebrate,
  };

  return (
    <div className="bg-mesh min-h-screen">
      <Confetti fire={confetti} />
      <LevelUpModal level={game.levelUp} onClose={game.clearLevelUp} />
      <BadgeModal badge={game.newBadge} onClose={game.clearNewBadge} />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpenCheck className="size-5" />
          </div>
          <span className="font-display text-xl">LingoQuest</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-card/80 border rounded-full pl-3 pr-1 py-1 text-xs">
              <UserIcon className="size-3.5 text-emerald-500" />
              <span className="font-medium max-w-[140px] truncate">{user.email}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={signOut}
                title="Đăng xuất"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          ) : (
            <AuthDialog />
          )}
          <SettingsDialog />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-20">
        <section className="text-center">
          <h1 className="text-balance font-display text-4xl leading-tight sm:text-5xl">
            Turn any text into a <span className="text-gradient">gamified English lesson</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Paste a paragraph, a topic, or upload your material. You get vocabulary cards,
            flashcards, games and quizzes — plus XP, streaks and badges.
          </p>
        </section>

        <GameHud state={game.state} level={game.level} questProgress={game.questProgress} />

        <Card className="card-soft gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl">
              <Wand2 className="size-5 text-primary" /> Build a lesson
            </h2>
            <div className="flex gap-1 rounded-full bg-muted p-1">
              {LEVELS.map((option) => (
                <button
                  key={option}
                  onClick={() => setLevel(option)}
                  className={
                    "rounded-full px-3 py-1 text-xs font-bold capitalize transition-colors " +
                    (level === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Paste an article, dialogue, or type a topic like 'at the airport'..."
            className="min-h-40 rounded-2xl text-base"
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={submit} disabled={mutation.isPending} size="lg">
              {mutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> Generating lesson...
                </>
              ) : (
                <>
                  <Sparkles /> {lesson ? "Regenerate lesson" : "Generate lesson"}
                </>
              )}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => fileRef.current?.click()}>
              <Upload /> Upload material
            </Button>
            <Button variant="ghost" size="lg" onClick={() => setSource(SAMPLE)}>
              Try a sample
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.json,text/plain"
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Text files work best (.txt, .md). For PDFs or Word docs, copy the text and paste it
            above.
          </p>
        </Card>

        {mutation.isPending && (
          <Card className="card-soft animate-pop-in items-center gap-3 p-10 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <p className="font-display text-lg">Designing your activities...</p>
            <p className="text-sm text-muted-foreground">
              Writing vocabulary, games, and quiz questions.
            </p>
          </Card>
        )}

        {lesson && (
          <section className="space-y-5">
            <Card className="card-soft animate-pop-in gap-2 bg-gradient-to-br from-primary/15 to-sky/15 p-6">
              <h2 className="text-2xl">{lesson.lessonTitle}</h2>
              <p className="text-sm text-muted-foreground">{lesson.summary}</p>
            </Card>

            <Tabs defaultValue="vocab">
              <TabsList className="h-auto w-full flex-wrap justify-start rounded-2xl p-1.5">
                <TabsTrigger value="vocab">Vocabulary</TabsTrigger>
                <TabsTrigger value="flash">Flashcards</TabsTrigger>
                <TabsTrigger value="match">Matching</TabsTrigger>
                <TabsTrigger value="tf">True / False</TabsTrigger>
                <TabsTrigger value="wheel">Lucky Spin</TabsTrigger>
                <TabsTrigger value="blanks">Fill Blanks</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
              </TabsList>

              <TabsContent value="vocab" className="mt-4">
                <VocabularyCards lesson={lesson} />
              </TabsContent>
              <TabsContent value="flash" className="mt-4">
                <Flashcards lesson={lesson} {...activityProps} />
              </TabsContent>
              <TabsContent value="match" className="mt-4">
                <MatchingGame lesson={lesson} {...activityProps} />
              </TabsContent>
              <TabsContent value="tf" className="mt-4">
                <TrueFalseChallenge lesson={lesson} {...activityProps} />
              </TabsContent>
              <TabsContent value="wheel" className="mt-4">
                <LuckyWheel lesson={lesson} onXp={game.addXp} onSpin={game.registerSpin} />
              </TabsContent>
              <TabsContent value="blanks" className="mt-4">
                <FillInTheBlanks lesson={lesson} {...activityProps} />
              </TabsContent>
              <TabsContent value="quiz" className="mt-4">
                <Quiz lesson={lesson} {...activityProps} />
              </TabsContent>
            </Tabs>
          </section>
        )}
      </main>
    </div>
  );
}
