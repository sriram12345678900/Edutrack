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

    // 1. Prioritize EduTrack / User's Local AI Engine First (Offline Knowledge, Vision OCR, Fine-tuned Dataset, Local Python Server)
    const localMatch = await queryLocalAI({
      prompt: lastMsg,
      language: language || "Hinglish",
      image: imageAttachment,
      bookInfo,
      allowFallbackSynthesis: false
    });

    if (localMatch && localMatch.matched) {
      return NextResponse.json({ reply: localMatch.reply });
    }

    // If strictly forced to local AI via environment
    if (process.env.USE_LOCAL_AI === "true" || (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY)) {
      const localSynthesized = await queryLocalAI({
        prompt: lastMsg,
        language: language || "Hinglish",
        image: imageAttachment,
        bookInfo,
        allowFallbackSynthesis: true
      });
      return NextResponse.json({ reply: localSynthesized?.reply || "EduTrack Offline AI active." });
    }

    // 2. Fallback to Cloud LLMs (Gemini / Groq) for open-ended un-indexed questions
    try {
      const reply = await getChatResponse(messages, language || "Hinglish", bookInfo);
      return NextResponse.json({ reply });
    } catch (apiError: any) {
      console.warn("External AI API failed, falling back to EduTrack Local Model...", apiError.message || apiError);
      
      const localFallback = await queryLocalAI({
        prompt: lastMsg,
        language: language || "Hinglish",
        image: imageAttachment,
        bookInfo,
        allowFallbackSynthesis: true
      });

      return NextResponse.json({ 
        reply: localFallback?.reply || `[EduTrack Local AI]: ${apiError.message || "Offline local model active."}` 
      });
    }
  } catch (error: any) {
    console.error("CHAT_ERROR:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
