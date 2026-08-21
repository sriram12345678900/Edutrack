import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { queryPythonServer } from "@/lib/python-ai";

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
    const { getOfflineSummary } = await import("@/lib/offline-curriculum");

    const localLLMText = await queryLocalLLM([
      {
        role: "system",
        content: `You are an expert CBSE NCERT educator. Create a comprehensive Quick Revision Cheat Sheet for "${chapter}" in ${subject}. Return ONLY a JSON object with keys "keyTerms", "equations", "mnemonics", "boardMustKnow".`
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
        if (parsed?.keyTerms && Array.isArray(parsed.keyTerms)) {
          return NextResponse.json(parsed);
        }
      } catch {}
    }

    const forceLocal = process.env.USE_LOCAL_AI === "true";
    const apiKey = process.env.GEMINI_API_KEY_SUMMARY || process.env.GEMINI_API_KEY;

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
            if (parsed?.keyTerms) return NextResponse.json(parsed);
          }
        }
      } catch (e: any) {
        console.warn("Cloud summary generator failed, falling back to local curriculum engine:", e.message);
      }
    }

    // 3. 100% Offline Standalone NCERT Curriculum Generator
    const offlineSummary = getOfflineSummary(subject, chapter, language);
    return NextResponse.json(offlineSummary);
  } catch (error: any) {
    console.error("Summarize API Error:", error);
    const { getOfflineSummary } = await import("@/lib/offline-curriculum");
    return NextResponse.json(getOfflineSummary(subject, chapter, "English"));
  }
}
