import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryPythonServer } from "@/lib/python-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { paper, studentAnswers } = await req.json();

    if (!paper || !studentAnswers) {
      return NextResponse.json({ error: "Missing paper or student answers" }, { status: 400 });
    }

    const prompt = `You are an expert ${paper.board || "CBSE"} Board Exam Evaluator with 15+ years of experience.
Grade the student's exam sheet.

EXAM DETAILS:
Title: ${paper.title}
Subject: ${paper.subject}
Grade: ${paper.grade}
Max Marks: ${paper.maxMarks}

QUESTIONS AND STUDENT ANSWERS:
${paper.questions.map((q: any) => {
  const studentAns = studentAnswers[q.num] || "No Answer Submitted";
  return `---
Question ${q.num} [Section ${q.section}, ${q.marks} Mark(s)]:
Question Text: ${q.text}
${q.options ? `Options:\n${q.options.join("\n")}` : ""}
Official Marking Scheme:
${q.markingScheme}

Student's Answer:
"${studentAns}"
`;
}).join("\n")}

EVALUATION RULES:
1. For Section A Multiple Choice Questions (MCQs), compare the option selected by the student (e.g. (a) or (b)) against the correct option in the marking scheme. Award 1 mark if correct, 0 if incorrect.
2. For descriptive questions (Sections B, C, D, E), award marks step-by-step according to the marking scheme.
3. Be fair, objective, and constructive. Provide details on where they lost marks.

Return the evaluation results as a strictly formatted JSON object matching the following structure:
{
  "totalMarks": ${paper.maxMarks},
  "marksAwarded": <number>, // The total sum of marks awarded across all questions
  "percentage": <number>, // (marksAwarded / totalMarks) * 100
  "verdict": "<short evaluation verdict, e.g., Excellent / Good / Needs Improvement>",
  "sectionScores": {
    // For each section present in the exam paper (e.g., A, B, C, D, E), list the max marks and awarded marks
    "A": { "max": <number>, "awarded": <number> }
  },
  "questionEvaluations": [
    {
      "num": <number>,
      "marksMax": <number>,
      "marksAwarded": <number>,
      "feedback": "<Specific observation on the student's answer, highlighting correct parts or missing points>",
      "markingSchemeUsed": "<Brief explanation of how the score was calculated based on the marking scheme>"
    }
  ],
  "overallRemarks": "<Overall summary of the student's performance, layout structure, and tips for improvement>",
  "weakAreas": ["<Topics or chapters where the student lost marks>"],
  "actionPlan": "<Actionable steps for the student to practice and improve their score>"
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
        console.warn("Failed to parse local Python AI evaluation response as JSON, falling back to Gemini:", err);
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

    return NextResponse.json({ evaluation: parsed });
  } catch (error: any) {
    console.error("Exam Eval Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate exam paper" }, { status: 500 });
  }
}
