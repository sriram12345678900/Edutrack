import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { subject, grade, chapter } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a Senior CBSE Examination Paper Setter and NCERT Curriculum Specialist creating an NEP 2020 Competency-Based Case Study for Class ${grade || 10} ${subject || "Science"}, Chapter: "${chapter || "Chemical Reactions"}".

CBSE Format Guidelines:
1. Provide a realistic real-world paragraph scenario (150-200 words) drawn from modern science, technology, environment, or daily Indian life.
2. Formulate 3 distinct competency questions:
   - Question 1: Concept MCQ (1 Mark)
   - Question 2: Two-tier Assertion & Reason Question (1 Mark) with standard CBSE options:
     (A) Both Assertion and Reason are true and Reason is the correct explanation.
     (B) Both Assertion and Reason are true but Reason is NOT the correct explanation.
     (C) Assertion is true, Reason is false.
     (D) Assertion is false, Reason is true.
   - Question 3: Calculation or High-Order Thinking Problem (2 Marks).

Strictly output valid JSON matching this schema:
{
  "id": "cs-generated-${Date.now()}",
  "title": "Short title",
  "subject": "${subject}",
  "grade": "${grade || "Class 10"}",
  "chapter": "${chapter}",
  "realWorldContext": "Context description",
  "scenarioText": "Detailed case study story paragraph",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "type": "mcq",
      "options": ["(A) ...", "(B) ...", "(C) ...", "(D) ..."],
      "correctOptionIndex": 0,
      "officialAnswer": "Direct answer string",
      "stepExplanation": "Step by step marking scheme",
      "marks": 1
    },
    {
      "id": 2,
      "question": "Assertion and Reason on ...",
      "type": "assertion_reason",
      "assertion": "Statement of assertion",
      "reason": "Statement of reasoning",
      "options": [
        "(A) Both Assertion and Reason are true, and Reason is the correct explanation of Assertion.",
        "(B) Both Assertion and Reason are true, but Reason is NOT the correct explanation of Assertion.",
        "(C) Assertion is true, but Reason is false.",
        "(D) Assertion is false, but Reason is true."
      ],
      "correctOptionIndex": 0,
      "officialAnswer": "(A) Both Assertion and Reason are true...",
      "stepExplanation": "Why R justifies A",
      "marks": 1
    },
    {
      "id": 3,
      "question": "Problem question",
      "type": "mcq",
      "options": ["(A) ...", "(B) ...", "(C) ...", "(D) ..."],
      "correctOptionIndex": 0,
      "officialAnswer": "Answer",
      "stepExplanation": "Calculations and formula",
      "marks": 2
    }
  ]
}

Ensure the output contains ONLY the raw JSON without markdown code fences or backticks.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("```json")) text = text.replace(/^```json/, "").replace(/```$/, "").trim();
    else if (text.startsWith("```")) text = text.replace(/^```/, "").replace(/```$/, "").trim();

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Competency API Error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to generate case study" }, { status: 500 });
  }
}
