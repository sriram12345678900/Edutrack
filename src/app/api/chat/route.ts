import { NextResponse } from "next/server";
import { getChatResponse } from "@/lib/groq";

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
      console.warn("External AI API failed, routing to EduTrack Local Model...", apiError);
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
