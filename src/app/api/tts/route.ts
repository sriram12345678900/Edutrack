import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, voiceId = "voiceai-tts-v1-latest" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.VOICE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Voice.ai API Key. Please restart your server." }, { status: 500 });
    }

    const payload = {
      text: text,
      model: voiceId,
      language: 'en'
    };

    const response = await fetch('https://dev.voice.ai/api/v1/tts/speech', {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Voice.ai TTS Error:", errText);
      return NextResponse.json({ error: "Failed to generate audio (Check Voice.ai quota)" }, { status: response.status });
    }

    // Voice.ai returns the raw MP3 audio buffer directly!
    const arrayBuffer = await response.arrayBuffer();
    const finalBuffer = Buffer.from(arrayBuffer);

    return new NextResponse(finalBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": finalBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error("Voice.ai TTS Exception:", error);
    return NextResponse.json({ error: error.message || "Failed to generate TTS" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ error: "GET method not supported. Use POST." }, { status: 405 });
}
