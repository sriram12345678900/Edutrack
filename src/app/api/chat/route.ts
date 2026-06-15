import { NextResponse } from "next/server";
import { getChatResponse } from "@/lib/groq";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { messages, language, bookInfo } = body;
    
    messages = messages.map((msg: any) => msg);

    try {
      const reply = await getChatResponse(messages, language || "Hinglish", bookInfo);
      return NextResponse.json({ reply });
    } catch (apiError: any) {
      console.error("AI API Error:", apiError.message, apiError);
      return NextResponse.json({ 
        reply: `Oops! An error occurred: ${apiError.message || "Unknown error"}. Please check your API key or image size.` 
      });
    }
  } catch (error: any) {
    console.error("CHAT_ERROR:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}

