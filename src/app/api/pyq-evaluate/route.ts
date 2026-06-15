import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { question, maxMarks, officialAnswer, imageBase64, textAnswer } = await req.json();

    if (!question || (!imageBase64 && !textAnswer)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a strict but fair Board Exam evaluator.
The student was asked the following question (worth ${maxMarks} marks):
"${question}"

${officialAnswer ? `The OFFICIAL ANSWER KEY is:\n"${officialAnswer}"\n\nUse this official answer as the baseline truth to grade the student's answer.` : ''}

${textAnswer 
  ? `The student provided the following text answer: "${textAnswer}"` 
  : `The attached image is the student's handwritten answer. Read the handwriting carefully.`
}

Evaluate the answer based on:
1. Correctness of the final answer or concepts (compare against the official answer if provided).
2. Steps and methodology shown (if it's a math/science problem).
3. Clarity and completeness of the explanation.

Provide your evaluation in strictly valid JSON format with the following keys:
{
  "marksGained": <number>, // A number between 0 and ${maxMarks}
  "errors": "<string>", // A detailed explanation of what they got wrong, or steps they missed. If perfect, say 'None'.
  "improvements": "<string>", // Actionable advice on how to structure the answer better for full marks.
  "feedback": "<string>" // General encouraging feedback.
}

Ensure the response is ONLY valid JSON, without any markdown formatting like \`\`\`json.`;

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
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        temperature: 0.2, // Low temperature for consistent grading
      }
    });

    const resultText = response.text;
    
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    // Try to parse JSON. Sometimes the AI still includes markdown block despite prompt.
    let jsonStr = resultText.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }

    const parsedData = JSON.parse(jsonStr);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("PYQ Evaluation Exception:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate answer" }, { status: 500 });
  }
}
