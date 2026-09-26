import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';
import Groq from "groq-sdk";
import { queryPythonServer } from "@/lib/python-ai";
import { getLanguagePromptInstruction } from "@/lib/languages";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { question, maxMarks, officialAnswer, imageBase64, textAnswer, language = "English" } = await req.json();

    if (!question || (!imageBase64 && !textAnswer)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const langInstruction = getLanguagePromptInstruction(language);

    // 1. Try Python Developed Local AI Server First (http://localhost:5000)
    const pythonEval = await queryPythonServer({
      task: "solve",
      prompt: `Evaluate this answer for question: ${question}. Student answer: ${textAnswer || "handwritten image"}. Max marks: ${maxMarks}. Official answer: ${officialAnswer || "NCERT standard"}. Language: ${language}`,
      language: language
    });

    if (pythonEval && typeof pythonEval.marksGained === "number") {
      return NextResponse.json(pythonEval);
    }

    const prompt = `You are a strict but fair CBSE Board Exam evaluator.
The student was asked the following question (worth ${maxMarks} marks):
"${question}"

${officialAnswer ? `The OFFICIAL ANSWER KEY is:\n"${officialAnswer}"\n\nUse this official answer as the baseline truth to grade the student's answer.` : ''}

${textAnswer 
  ? `The student provided the following text answer: "${textAnswer}"` 
  : `The attached image is the student's handwritten answer. Read the handwriting carefully.`
}

LANGUAGE & FEEDBACK INSTRUCTION:
${langInstruction}
Write the "errors", "improvements", and "feedback" in ${language}.

Evaluate the answer based on:
1. Correctness of the final answer or concepts (compare against the official answer if provided).
2. Steps and methodology shown (if it's a math/science problem).
3. Clarity and completeness of the explanation.

Provide your evaluation in strictly valid JSON format with the following keys:
{
  "marksGained": 0, // A number between 0 and ${maxMarks}
  "errors": "<string in ${language}>", // Detailed explanation of what they got wrong or steps missed. If perfect, say 'None'.
  "improvements": "<string in ${language}>", // Actionable advice on how to structure the answer better for full marks.
  "feedback": "<string in ${language}>" // General encouraging feedback.
}

Ensure the response is ONLY valid JSON.`;

    // 2. Try Gemini
    const apiKey = process.env.GEMINI_API_KEY_EVALUATE || process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        let contents: any[] = [
          {
            role: 'user',
            parts: [
              { text: prompt }
            ],
          }
        ];

        if (imageBase64) {
          const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
          contents[0].parts.push({
            inlineData: {
              data: base64Data,
              mimeType: imageBase64.match(/data:(.*?);/)?.[1] || "image/jpeg"
            }
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            temperature: 0.2,
          }
        });

        const resultText = response.text;
        if (resultText) {
          let jsonStr = resultText.trim();
          if (jsonStr.startsWith("```json")) jsonStr = jsonStr.substring(7);
          if (jsonStr.endsWith("```")) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
          return NextResponse.json(JSON.parse(jsonStr));
        }
      } catch (gemErr) {
        console.warn("Gemini PYQ evaluation failed, attempting Groq fallback:", gemErr);
      }
    }

    // 3. Fallback to Groq for text answers
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && textAnswer) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a strict but fair CBSE Board Exam evaluator. Always return strictly valid JSON."
            },
            {
              role: "user",
              content: `${prompt}\n\nRespond strictly with JSON format: {"marksGained": 0, "errors": "...", "improvements": "...", "feedback": "..."}`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1024,
        });

        const raw = completion.choices[0]?.message?.content || "";
        return NextResponse.json(JSON.parse(raw));
      } catch (groqErr) {
        console.warn("Groq PYQ evaluation failed:", groqErr);
      }
    }

    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 500 });
  } catch (error: any) {
    console.error("PYQ Evaluation Exception:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate answer" }, { status: 500 });
  }
}
