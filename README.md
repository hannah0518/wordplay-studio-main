# WordPlay Studio

# Role & App Concept

You are an expert full-stack engineer and UI/UX designer. Build a complete, highly interactive, gamified English learning web application (ESL learners from beginner to intermediate levels).

Design vibe: Duolingo + Quizlet + Canva AI + modern EdTech startup (soft pastel color palette, rounded cards, clean typography, micro-interactions, smooth animations).

---

# Core Features & Workflow

### 1. Document Ingestion & AI Generation

- Input area allowing users to paste raw text, upload documents, or provide topic text.

- Analyze the input and automatically generate a complete structured gamified lesson.

- Support uploading new materials to regenerate lessons dynamically.

### 2. Lesson Components

- **Vocabulary Cards:** Word, simple definition, pronunciation guide, illustrative icon/image, example sentence.

- **Interactive Activities:**

  - Flip Flashcards (with audio/TTS if available)

  - Drag-and-drop / Tap Matching Game

  - True / False Challenge

  - Lucky Spin Wheel (Vocabulary / Question picker)

  - Dialogue Fill-in-the-Blanks

  - Multiple Choice Quiz

### 3. Gamification Mechanics

- XP Points system & Sound effects / Confetti on completion.

- Daily Streak Counter & Streak freeze logic.

- Visual Progress Bars & Level-up celebratory modal/animations.

- Unlockable Badges & Daily Quest checklist.

---

# Gemini API Integration Specs (Google AI Studio)

### 1. Model & Endpoint Configuration

- **Model:** `gemini-1.5-flash` (or `gemini-1.5-pro`)

- **Base Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_API_KEY`

- **Streaming Endpoint (SSE):** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=YOUR_GEMINI_API_KEY`

- **Method:** POST

- **Headers:** `Content-Type: application/json`

### 2. Structured Generation (JSON Schema)

Configure the system prompt with `generationConfig: { responseMimeType: "application/json" }` to guarantee structured output matching this schema:

```json

{

  "lessonTitle": "string",

  "summary": "string",

  "vocabulary": [

    {

      "word": "string",

      "phonetic": "string",

      "definition": "string",

      "exampleSentence": "string",

      "iconName": "string"

    }

  ],

  "flashcards": [

    { "front": "string", "back": "string", "hint": "string" }

  ],

  "matchingPairs": [

    { "term": "string", "definition": "string" }

  ],

  "trueFalseQuestions": [

    { "statement": "string", "isTrue": true, "explanation": "string" }

  ],

  "fillInTheBlanks": [

    { "sentence": "string with ___ placeholder", "answer": "string", "options": ["string"] }

  ],

  "quiz": [

    { "question": "string", "options": ["string"], "correctAnswerIndex": 0, "explanation": "string" }

  ]

}

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/047283a3-eeae-471f-830e-f4d78468208d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
