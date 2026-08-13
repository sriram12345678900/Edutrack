import { NextResponse } from "next/server";
import { getChatResponse } from "@/lib/groq";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { messages, language, bookInfo } = body;

    const lastMsgObj = messages[messages.length - 1];
    const lastMsg = lastMsgObj?.content || "";
    const imageAttachment = lastMsgObj?.attachments?.find((att: any) => att.type?.startsWith("image/"))?.data || body.image;

    const useLocalAI = process.env.USE_LOCAL_AI === "true" || (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY);

    if (useLocalAI) {
      const origin = req.headers.get("origin") || "http://localhost:3000";
      try {
        const localRes = await fetch(`${origin}/api/local-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: lastMsg, language, image: imageAttachment })
        });
        if (localRes.ok) {
          const localData = await localRes.json();
          return NextResponse.json({ reply: localData.reply });
        }
      } catch (e) {
        console.warn("Local AI fallback failed:", e);
      }
    }

    try {
      const reply = await getChatResponse(messages, language || "Hinglish", bookInfo);
      return NextResponse.json({ reply });
    } catch (apiError: any) {
      console.warn("External AI API failed, routing to EduTrack Local Model...");
      const origin = req.headers.get("origin") || "http://localhost:3000";
      try {
        const localRes = await fetch(`${origin}/api/local-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: lastMsg, language, image: imageAttachment })
        });
        if (localRes.ok) {
          const localData = await localRes.json();
          return NextResponse.json({ reply: localData.reply });
        }
      } catch (_e) {}

      return NextResponse.json({ 
        reply: `[EduTrack Local AI]: ${apiError.message || "Offline local model active."}` 
      });
    }
  } catch (error: any) {
    console.error("CHAT_ERROR:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
