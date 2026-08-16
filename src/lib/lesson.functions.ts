import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { lessonSchema, LESSON_JSON_SHAPE } from "./lesson-schema";

export const generateLesson = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        source: z.string().min(10).max(20000),
        level: z.enum(["beginner", "elementary", "intermediate"]).default("beginner"),
        apiKey: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const rawKey = data.apiKey ? data.apiKey : process.env["LOVABLE_API_KEY"];
    const key = String(rawKey || "").trim().replace(/^"+|"+$/g, "");
    const isCustomKey = !!data.apiKey && !!key;

    if (!key) throw new Error("AI is not configured. Please enter your Gemini API Key in Settings.");

    const system = `You are an expert ESL curriculum designer. From the learner's material, build ONE gamified English lesson for ${data.level} learners.
Rules:
- Output ONLY valid minified JSON matching this shape, no markdown fences:
${LESSON_JSON_SHAPE}
- Exactly: 8 vocabulary items, 8 flashcards, 6 matchingPairs, 6 trueFalseQuestions, 6 fillInTheBlanks, 6 quiz questions.
- Language must be simple and encouraging. Every fillInTheBlanks sentence must contain "___" and its options must include the answer (4 options).
- quiz options must have 4 entries and correctAnswerIndex between 0 and 3.
- iconName must be a real lucide-react icon name in kebab-case.`;

    let res: Response;

    try {
      if (isCustomKey) {
        // Use native Google Gemini API format
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${key}`;
        res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: data.source.slice(0, 20000) }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        });
      } else {
        // Use Lovable Gateway (OpenAI format)
        const lovableUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
        res = await fetch(lovableUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            stream: true,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: system },
              { role: "user", content: data.source.slice(0, 20000) },
            ],
          }),
        });
      }
    } catch (err: any) {
      throw new Error(`Connection to Gemini failed (${err.message || "Network Error"}). Please check your internet connection or turn on 1.1.1.1 Warp.`);
    }

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429)
        throw new Error("Too many requests right now — please try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits are exhausted. Please add credits to continue.");
      throw new Error(`Lesson generation failed [${res.status}]: ${body.slice(0, 300)}`);
    }

    // Consume the SSE stream server-side so long generations never stall.
    const raw = await res.text();
    let text = "";
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const chunk = JSON.parse(payload);
        if (isCustomKey) {
          text += chunk?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        } else {
          text += chunk?.choices?.[0]?.delta?.content ?? "";
        }
      } catch {
        // ignore partial keepalive lines
      }
    }

    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("The AI returned an unreadable lesson.");

    const parsed = lessonSchema.safeParse(JSON.parse(cleaned.slice(start, end + 1)));
    if (!parsed.success) throw new Error("The generated lesson was incomplete. Try again.");
    return parsed.data;
  });
