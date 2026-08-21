import { NextResponse } from "next/server";
import { getChatResponse } from "@/lib/groq";
import { queryLocalAI } from "@/lib/local-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { messages, language, bookInfo, image } = body;

    if (!messages || !Array.isArray(messages)) {
      messages = [];
    }

    // If an image is provided at the top level (e.g. from Lens) and not in last message attachments, attach it
    if (image && typeof image === "string") {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg) {
        if (!lastMsg.attachments) lastMsg.attachments = [];
        const hasImg = lastMsg.attachments.some((a: any) => a.type?.startsWith("image") || (typeof a.data === "string" && a.data.startsWith("data:image/")));
        if (!hasImg) {
          lastMsg.attachments.push({
            type: image.startsWith("data:image/jpeg") ? "image/jpeg" : "image/png",
            data: image,
            name: "Uploaded_Image.png"
          });
        }
      } else {
        messages.push({
          role: "user",
          content: "Please solve and explain the question in this image step-by-step.",
          attachments: [{
            type: image.startsWith("data:image/jpeg") ? "image/jpeg" : "image/png",
            data: image,
            name: "Uploaded_Image.png"
          }]
        });
      }
    }

    const lastMsgObj = messages[messages.length - 1];
    const lastMsg = lastMsgObj?.content || "";
    const imageAttachment = lastMsgObj?.attachments?.find((att: any) => att.type?.startsWith("image") || (typeof att.data === "string" && att.data.startsWith("data:image/")))?.data || image;

    const hasOnlineKeys = Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
    const forceLocal = process.env.USE_LOCAL_AI === "true";

    // 1. Try Local LLM (Ollama / LM Studio / Python Server) First
    const { queryLocalLLM } = await import("@/lib/local-llm");
    const localLLMResponse = await queryLocalLLM([
      {
        role: "system",
        content: `You are EduTrack AI, an expert personal tutor for Indian CBSE Class 6-10 students.${bookInfo ? `\nThe student is currently studying: ${bookInfo}. Base your answers directly on this NCERT curriculum and chapter.` : ""}\nReply in ${language || "English"} with clear step-by-step points, proper mathematical identities or chemical formulas, and key NCERT terms.`
      },
      ...messages.map((m: any) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content || ""
      }))
    ], { timeoutMs: 15000 });

    if (localLLMResponse && localLLMResponse.trim()) {
      return NextResponse.json({ reply: localLLMResponse.trim() });
    }

    // 2. Primary Online Cloud LLM (Gemini 2.5 Flash / Groq) if configured and not in forced local mode
    if (hasOnlineKeys && !forceLocal) {
      try {
        const reply = await getChatResponse(messages, language || "Hinglish", bookInfo || "");
        if (reply && reply.trim()) {
          return NextResponse.json({ reply });
        }
      } catch (apiError: any) {
        console.warn("External AI API failed, falling back to EduTrack Local Model...", apiError.message || apiError);
      }
    }

    // 3. Offline / Built-in Local Fallback Engine (Vision OCR, Curated Knowledge Base)
    const localMatch = await queryLocalAI({
      prompt: lastMsg,
      language: language || "Hinglish",
      image: imageAttachment,
      bookInfo,
      allowFallbackSynthesis: true
    });

    if (localMatch && localMatch.reply) {
      return NextResponse.json({ reply: localMatch.reply });
    }

    return NextResponse.json({ 
      reply: "I am ready to help you with your studies! Please ask any question related to this chapter." 
    });
  } catch (error: any) {
    console.error("CHAT_ERROR:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
