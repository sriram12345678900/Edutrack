import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryPythonServer } from "@/lib/python-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { classLevel, subject, maxMarks, chapters, board, difficulty } = await req.json();

    const boardName = board || "CBSE";
    const difficultyLevel = difficulty || "Medium";

    // Calculate duration based on marks
    const durationHours = maxMarks >= 80 ? 3 : maxMarks >= 40 ? 1.5 : 1;

    const chaptersInstruction = chapters && chapters.length > 0
      ? `The questions generated MUST be strictly restricted to the following chapters: ${chapters.join(", ")}.`
      : "The questions should cover all standard chapters of the subject.";

    const prompt = `You are an expert ${boardName} Board Examiner and senior curriculum developer.
Create an official ${boardName} Board Pattern exam paper for Class ${classLevel} (Grade X/10) for the subject: "${subject}" at ${difficultyLevel} difficulty level.
The paper must have a maximum marks of exactly ${maxMarks} and a duration of ${durationHours} hours.

${chaptersInstruction}

Adhere strictly to the official ${boardName} Blueprint style guidelines:
- The paper must consist of sections (e.g. Sections A, B, C, D, E).
- Section A: Objective Type / MCQs carrying exactly 1 mark each. Each MCQ must have exactly 4 options.
- Section B: Very Short Answer (VSA) type questions carrying exactly 2 marks each.
- Section C: Short Answer (SA) type questions carrying exactly 3 marks each.
- Section D: Long Answer (LA) type questions carrying exactly 5 marks each.
- Section E: Source-based/Case-based/Passage-based units of assessment carrying exactly 4 marks each.

CRITICAL REQUIREMENT:
The total sum of marks of all generated questions MUST equal exactly ${maxMarks} marks. Adjust the number of questions in each section (A, B, C, D, E) to meet this criteria perfectly.

Return the exam paper as a strictly formatted JSON object matching the following structure:
{
  "title": "${boardName} Class X Board Examination Practice Paper (${subject} - Official Pattern)",
  "subject": "${subject}",
  "grade": "Class 10",
  "board": "${boardName} Board Blueprint",
  "durationHours": ${durationHours},
  "maxMarks": ${maxMarks},
  "generalInstructions": [
    "Write the general instructions outlining the sections, marks per section, and total questions in the paper."
  ],
  "questions": [
    {
      "num": 1,
      "section": "A",
      "marks": 1,
      "text": "The text of the question",
      "options": ["(a) Option A", "(b) Option B", "(c) Option C", "(d) Option D"],
      "markingScheme": "Detailed step-by-step marking criteria indicating where marks are awarded."
    }
  ]
}
`;

    // 1. Try local Python AI Server first
    let parsed = null;
    const pythonRes = await queryPythonServer({
      task: "solve",
      prompt: prompt
    });

    if (pythonRes && pythonRes.reply) {
      try {
        let cleanText = pythonRes.reply.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        parsed = JSON.parse(cleanText);
      } catch (err) {
        console.warn("Failed to parse local Python AI response as JSON, falling back to Gemini:", err);
      }
    }

    // 2. Fallback to Gemini if local AI didn't work/return valid JSON
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

    return NextResponse.json({ paper: parsed });
  } catch (error: any) {
    console.error("Exam Gen Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate exam paper" }, { status: 500 });
  }
}
