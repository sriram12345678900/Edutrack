import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryPythonServer } from "@/lib/python-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { subject, chapter } = await req.json();

    if (!subject || !chapter) {
      return NextResponse.json({ error: "Missing subject or chapter parameter." }, { status: 400 });
    }

    const prompt = `You are an expert CBSE board educator.
Generate a Class 10 multiple-choice study quiz of exactly 5 questions for the subject: "${subject}" and chapter: "${chapter}".

Return the quiz as a strictly formatted JSON object matching the following structure:
{
  "questions": [
    {
      "question": "The question text. Keep it concise and clean.",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "The exact string representing the correct answer, which must match one of the items in options exactly."
    }
  ]
}
`;

    // 1. Try local Python AI Server first
    let parsed = null;
    const pythonRes = await queryPythonServer({
      task: "quiz",
      prompt: prompt,
      subject: subject,
      chapter: chapter
    });

    if (pythonRes && pythonRes.reply) {
      try {
        let cleanText = pythonRes.reply.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        parsed = JSON.parse(cleanText);
      } catch (err) {
        console.warn("Failed to parse local Python AI quiz response as JSON, falling back to Gemini:", err);
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
    console.error("Groups Quiz Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate study circle quiz" }, { status: 500 });
  }
}
