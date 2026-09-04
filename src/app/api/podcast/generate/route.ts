import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryPythonServer } from "@/lib/python-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Missing topic parameter." }, { status: 400 });
    }

    const prompt = `You are an expert educational podcast scriptwriter.
Generate a conversational podcast script between two hosts for the topic: "${topic}".
The hosts are:
- Alex (Host, curious student)
- Maya (Expert, explains concepts)

Generate exactly 6 dialogue turns total (3 per speaker, alternating).

Return the script as a strictly formatted JSON object matching the following structure:
{
  "dialogues": [
    {
      "speaker": "Alex",
      "role": "Inquisitive Host",
      "text": "The dialogue text.",
      "avatarSeed": "AlexPodcast1"
    },
    {
      "speaker": "Maya",
      "role": "Expert Explainer",
      "text": "The dialogue text.",
      "avatarSeed": "MayaPodcast1"
    }
  ]
}
`;

    // 1. Try local Python AI Server first
    let parsed = null;
    const pythonRes = await queryPythonServer({
      task: "podcast",
      prompt: prompt,
      topic: topic
    });

    if (pythonRes && pythonRes.reply) {
      try {
        let cleanText = pythonRes.reply.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        parsed = JSON.parse(cleanText);
      } catch (err) {
        console.warn("Failed to parse local Python AI podcast response as JSON, falling back to Gemini:", err);
      }
    }

    // 2. Fallback to Gemini
    if (!parsed) {
      const apiKey = process.env.GEMINI_API_KEY || "";
      if (!apiKey) {
        return NextResponse.json({ error: "Gemini API key is missing and local server is offline." }, { status: 500 });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(prompt);
      const resultText = result.response.text();
      let cleanText = resultText.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      parsed = JSON.parse(cleanText);
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Podcast Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate podcast" }, { status: 500 });
  }
}
