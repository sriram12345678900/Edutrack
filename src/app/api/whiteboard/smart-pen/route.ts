import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const base64Data = image.includes(",") ? image.split(",")[1] : image;
        const mimeType = image.includes(";") ? (image.split(";")[0].split(":")[1] || "image/png") : "image/png";

        const response = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { 
                  text: "Analyze this hand-drawn image. Identify the object drawn. It can be a single letter (uppercase or lowercase), a symbol (like @, !, %, etc.), a number, a short text string, or a basic shape (circle, rectangle, square, line). Respond in JSON format exactly like this:\n\nFor a letter/symbol/text:\n{\"type\": \"text\", \"value\": \"A\"}\n\nFor a circle:\n{\"type\": \"circle\"}\n\nFor a rectangle/square:\n{\"type\": \"rect\"}\n\nFor a line:\n{\"type\": \"line\"}\n\nKeep it extremely concise. Return ONLY valid JSON." 
                },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                  }
                }
              ]
            }
          ]
        });

        const text = response.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return NextResponse.json(result);
        }
      } catch (geminiErr) {
        console.warn("Smart pen Gemini API failed, using local shape fallback.");
      }
    }

    // Fallback response for local recognition engine
    return NextResponse.json({ type: "unknown" });
  } catch (e: any) {
    console.error("Smart pen error:", e);
    return NextResponse.json({ type: "unknown" }, { status: 200 });
  }
}
