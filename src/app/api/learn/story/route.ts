import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLanguagePromptInstruction } from "@/lib/languages";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { subject, chapter, className, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({
        story: `Once upon a time in a vibrant school laboratory, two students encountered the mysterious properties of ${chapter}. Every discovery revealed the fundamental laws governing ${subject} in Class ${className || 10}. (Set GEMINI_API_KEY for dynamic narrative generation).`
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `System: You are an award-winning science fiction and narrative author specializing in translating Indian CBSE Class ${className || 10} academic curricula into thrilling, unforgettable stories.
Subject: ${subject}
Chapter: ${chapter}
${getLanguagePromptInstruction(language || "English")}

TASK:
Rewrite the core concepts, scientific formulas/laws, and key definitions of the NCERT chapter "${chapter}" as an engaging narrative story.
- Introduce dynamic characters (e.g. young curious inventors or explorers encountering the concept in an unexpected quest).
- Weave real NCERT chemical formulas, mathematical laws, or historical events naturally into character dialogues and plots.
- Keep the explanation conceptually 100% accurate so the student learns all board exam definitions effortlessly.
- Conclude with a punchy 3-bullet moral recapping the top NCERT takeaways.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ story: text });
  } catch (error: any) {
    console.error("Story Explainer API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate story explanation." },
      { status: 500 }
    );
  }
}
