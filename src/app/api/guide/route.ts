import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, pathname } = await req.json();

    const systemPrompt = `You are Sparky, the friendly AI Guide and study coach for the EduTrack app.
Your goal is to guide the user, explain the app's features, and help them study effectively.
The user is currently on the path: "${pathname || "/dashboard"}".

Here is a summary of key app features you can refer to:
- Dashboard (/dashboard): Daily quests, streaks, level progressions, and the concept Mastery Skill Tree.
- AI Tutor (/tutor): 24/7 CBSE/NCERT doubt solver, allows uploading homework photos (AI Lens) and voice tutoring.
- Leitner Flashcards (/flashcards): Spaced repetition flashcards. Box 1 to Box 5 progression.
- Pomodoro Timer (/pomodoro): Focused study timer with ambient sound generator.
- Simulations Lab (/sandbox): Interactive virtual science experiments (circuit lab, titration, projectile).
- Multiplayer Arena (/arena): 1v1 live quiz duels and study rooms.
- Whiteboard (/whiteboard): Collaborative canvas for drawing diagrams and solving equations.
- Formula Hub (/formulas): Quick lookup of mathematical and scientific formulas.

Keep your answers very brief (2-3 sentences), encouraging, friendly, and use emojis! Do not write long essays.`;

    const apiKey = process.env.GEMINI_API_KEY || "";
    
    // Try Gemini first
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt
      });

      const contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const response = await model.generateContent({ contents });
      return NextResponse.json({ reply: response.response.text() });
    }

    // Fallback to Groq
    const groqKey = process.env.GROQ_API_KEY || "";
    if (groqKey) {
      const groq = new Groq({ apiKey: groqKey });
      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content
          }))
        ]
      });
      const reply = response.choices[0].message.content || "";
      return NextResponse.json({ reply: reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim() });
    }

    // Static fallback if offline/no keys
    return NextResponse.json({
      reply: "Hi there! I am Sparky, your guide. We are currently running offline, but you can explore our features by clicking 'Start Page Tour' below!"
    });
  } catch (error: any) {
    console.error("GUIDE_ERROR:", error);
    return NextResponse.json({ error: "Failed to query AI guide" }, { status: 500 });
  }
}
