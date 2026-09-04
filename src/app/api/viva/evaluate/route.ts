import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryPythonServer } from "@/lib/python-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { question, expectedAnswer, studentTranscript, topic } = await req.json();

    if (!question || !studentTranscript) {
      return NextResponse.json({ error: "Missing question or studentTranscript parameter." }, { status: 400 });
    }

    const prompt = `You are a senior academic examiner evaluating a student's verbal answer for a viva exam on the topic: "${topic}".
Question: "${question}"
Expected Answer/Keywords: "${expectedAnswer}"
Student's Answer: "${studentTranscript}"

Evaluate the student's answer and return a strictly formatted JSON object matching this structure:
{
  "score": <number between 0-10>,
  "feedback": "<string: brief, constructive feedback acting as the examiner>",
  "strengths": ["<string>", ...],
  "missedConcepts": ["<string>", ...]
}`;

    // 1. Try local Python AI Server first
    let parsed = null;
    const pythonRes = await queryPythonServer({
      task: "evaluate_viva",
      prompt: prompt,
      question: question,
      topic: topic,
      studentTranscript: studentTranscript
    });

    if (pythonRes && pythonRes.reply) {
      try {
        let cleanText = pythonRes.reply.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        parsed = JSON.parse(cleanText);
      } catch (err) {
        console.warn("Failed to parse local Python AI viva evaluation response as JSON, falling back to Gemini:", err);
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
    console.error("Viva Evaluation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate viva answer" }, { status: 500 });
  }
}
