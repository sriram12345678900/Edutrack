import { NextResponse } from "next/server";
import { queryLocalAI } from "@/lib/local-ai";

export const dynamic = "force-dynamic";

// Self-Hosted Local AI Engine (100% Offline & Private, 0 External APIs)
// Built specifically for EduTrack CBSE Class 6-10 Curriculum

export async function POST(req: Request) {
  try {
    const { prompt, language = "English", image, bookInfo } = await req.json();
    if (!prompt && !image) {
      return NextResponse.json({ error: "Prompt or image is required" }, { status: 400 });
    }

    const localResult = await queryLocalAI({
      prompt,
      language,
      image,
      bookInfo,
      allowFallbackSynthesis: true
    });

    if (localResult) {
      return NextResponse.json({
        reply: localResult.reply,
        engine: localResult.engine
      });
    }

    return NextResponse.json({ error: "No response generated" }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
