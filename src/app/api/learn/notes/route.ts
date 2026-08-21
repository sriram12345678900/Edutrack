import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { queryPythonServer } from "@/lib/python-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let subject = "Science";
  let chapter = "NCERT Topic";
  try {
    const body = await req.json();
    subject = body.subject || "Science";
    chapter = body.chapter || "NCERT Topic";
    const language = body.language || "Hinglish";
    const prompt = `Provide the response in ${language} language.`;

    // 1. Try Local LLM (Ollama / LM Studio / Python Server) First
    const { queryLocalLLM } = await import("@/lib/local-llm");
    const { getOfflineNotes } = await import("@/lib/offline-curriculum");

    const localLLMText = await queryLocalLLM([
      {
        role: "system",
        content: `You are an expert CBSE NCERT educator. Create 4 structured interactive notes topics for "${chapter}" in ${subject}. Return ONLY a JSON object with key "topics" containing array of objects with "heading", "content", and "flashcard" { "front", "back" }.`
      },
      {
        role: "user",
        content: prompt
      }
    ], { jsonMode: true, timeoutMs: 12000 });

    if (localLLMText) {
      try {
        const cleaned = localLLMText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed?.topics && Array.isArray(parsed.topics) && parsed.topics.length > 0) {
          return NextResponse.json(parsed);
        }
      } catch {}
    }

    const forceLocal = process.env.USE_LOCAL_AI === "true";
    const apiKey = process.env.GEMINI_API_KEY_NOTES || process.env.GEMINI_API_KEY;

    // 2. Try Cloud LLM (Gemini / Groq) if available and not in pure local mode
    if (!forceLocal && (apiKey || process.env.GROQ_API_KEY)) {
      try {
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
          });
          const result = await model.generateContent(prompt);
          const raw = result.response.text() || "";
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.topics) return NextResponse.json(parsed);
          }
        }
      } catch (e: any) {
        console.warn("Cloud notes generator failed, falling back to local curriculum engine:", e.message);
      }
    }

    // 3. 100% Offline Standalone NCERT Curriculum Generator
    const offlineNotes = getOfflineNotes(subject, chapter, language);
    return NextResponse.json(offlineNotes);
  } catch (error: any) {
    console.error("Notes API Error:", error);
    const { getOfflineNotes } = await import("@/lib/offline-curriculum");
    return NextResponse.json(getOfflineNotes(subject, chapter, "English"));
  }
}
