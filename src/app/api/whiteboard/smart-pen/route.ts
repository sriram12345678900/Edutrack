import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    
    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this hand-drawn image. Identify the object drawn. It can be a single letter (uppercase or lowercase), a symbol (like @, !, %, etc.), a number, a short text string, or a basic shape (circle, rectangle, square, line). Respond in JSON format exactly like this:\n\nFor a letter/symbol/text:\n{\"type\": \"text\", \"value\": \"A\"}\n\nFor a circle:\n{\"type\": \"circle\"}\n\nFor a rectangle/square:\n{\"type\": \"rect\"}\n\nFor a line:\n{\"type\": \"line\"}\n\nKeep it extremely concise. Only return valid JSON." },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    const result = JSON.parse(text || "{}");
    return Response.json(result);
  } catch (e: any) {
    console.error("Smart pen error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
