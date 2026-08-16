import { z } from "zod";

export const lessonSchema = z.object({
  lessonTitle: z.string(),
  summary: z.string(),
  vocabulary: z.array(
    z.object({
      word: z.string(),
      phonetic: z.string(),
      definition: z.string(),
      exampleSentence: z.string(),
      iconName: z.string(),
    }),
  ),
  flashcards: z.array(
    z.object({ front: z.string(), back: z.string(), hint: z.string() }),
  ),
  matchingPairs: z.array(z.object({ term: z.string(), definition: z.string() })),
  trueFalseQuestions: z.array(
    z.object({
      statement: z.string(),
      isTrue: z.boolean(),
      explanation: z.string(),
    }),
  ),
  fillInTheBlanks: z.array(
    z.object({
      sentence: z.string(),
      answer: z.string(),
      options: z.array(z.string()),
    }),
  ),
  quiz: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswerIndex: z.number(),
      explanation: z.string(),
    }),
  ),
});

export type Lesson = z.infer<typeof lessonSchema>;
export type VocabularyItem = Lesson["vocabulary"][number];

export const LESSON_JSON_SHAPE = `{
  "lessonTitle": "string",
  "summary": "string",
  "vocabulary": [{ "word": "string", "phonetic": "string (like /ˈwɜːrd/)", "definition": "string (simple, A2 level)", "exampleSentence": "string", "iconName": "string (a lucide-react icon name in kebab-case, e.g. book-open)" }],
  "flashcards": [{ "front": "string", "back": "string", "hint": "string" }],
  "matchingPairs": [{ "term": "string", "definition": "string (short)" }],
  "trueFalseQuestions": [{ "statement": "string", "isTrue": true, "explanation": "string" }],
  "fillInTheBlanks": [{ "sentence": "string containing ___ placeholder", "answer": "string", "options": ["string"] }],
  "quiz": [{ "question": "string", "options": ["string"], "correctAnswerIndex": 0, "explanation": "string" }]
}`;
