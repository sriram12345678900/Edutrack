import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { queryPythonServer } from "@/lib/python-ai";
import { getLanguagePromptInstruction } from "@/lib/languages";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { classLevel, subject, maxMarks, chapters, board, difficulty, language = "English" } = await req.json();

    const boardName = board || "CBSE";
    const difficultyLevel = difficulty || "Medium";

    // Calculate duration based on marks
    const durationHours = maxMarks >= 80 ? 3 : maxMarks >= 40 ? 1.5 : 1;

    const chaptersInstruction = chapters && chapters.length > 0
      ? `The questions generated MUST be strictly restricted to the following chapters: ${chapters.join(", ")}.`
      : "The questions should cover all standard chapters of the subject.";

    const langInstruction = getLanguagePromptInstruction(language);

    const prompt = `You are an expert ${boardName} Board Examiner and senior curriculum developer.
Create an official ${boardName} Board Pattern exam paper for Class ${classLevel} (Grade X/10) for the subject: "${subject}" at ${difficultyLevel} difficulty level.
The paper must have a maximum marks of exactly ${maxMarks} and a duration of ${durationHours} hours.

${chaptersInstruction}

LANGUAGE & SCRIPT INSTRUCTION:
${langInstruction}
${language !== "English" ? `CRITICAL BILINGUAL CBSE FORMAT:
- If Hindi or a regional language is chosen, provide each question text in standard bilingual board format (English text first, followed by the authentic translation).
- For bilingual blends like Hinglish, write naturally in Roman/Latin script.
- Keep all mathematical equations, chemical formulas ($F = ma$, $\\text{H}_2\\text{O}$), and SI units invariant and clear.` : ""}

Adhere strictly to the official ${boardName} Blueprint style guidelines:
- The paper must consist of sections (e.g. Sections A, B, C, D, E).
- Section A: Objective Type / MCQs carrying exactly 1 mark each. Each MCQ must have exactly 4 options.
- Section B: Very Short Answer (VSA) type questions carrying exactly 2 marks each.
- Section C: Short Answer (SA) type questions carrying exactly 3 marks each.
- Section D: Long Answer (LA) type questions carrying exactly 5 marks each.
- Section E: Source-based/Case-based/Passage-based units of assessment carrying exactly 4 marks each.

CRITICAL REQUIREMENT:
The total sum of marks of all generated questions MUST equal exactly ${maxMarks} marks. Adjust the number of questions in each section (A, B, C, D, E) to meet this criteria perfectly.

Return the exam paper strictly as a JSON object matching the following structure:
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

    // Helper to safely extract JSON
    const parseJson = (text: string) => {
      let clean = text.trim();
      if (clean.startsWith('```json')) clean = clean.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      else if (clean.startsWith('```')) clean = clean.replace(/^```\n?/, '').replace(/\n?```$/, '');
      return JSON.parse(clean);
    };

    // 1. Try local Python AI Server first
    let parsed = null;
    const pythonRes = await queryPythonServer({
      task: "solve",
      prompt: prompt,
      language: language
    });

    if (pythonRes && pythonRes.reply) {
      try {
        parsed = parseJson(pythonRes.reply);
      } catch (err) {
        console.warn("Failed to parse local Python AI response as JSON:", err);
      }
    }

    // 2. Try Gemini
    const geminiKey = process.env.GEMINI_API_KEY || "";
    if (!parsed && geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        parsed = parseJson(result.response.text());
      } catch (geminiErr: any) {
        console.warn("Gemini exam generation failed, falling back to Groq:", geminiErr?.message || geminiErr);
      }
    }

    // 3. Fallback to Groq
    const groqKey = process.env.GROQ_API_KEY || "";
    if (!parsed && groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are an expert CBSE NCERT exam setter. Always return strictly valid JSON matching the schema."
            },
            {
              role: "user",
              content: `${prompt}\n\nRespond strictly with valid JSON.`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 4096,
        });
        const raw = completion.choices[0]?.message?.content || "";
        parsed = parseJson(raw);
      } catch (groqErr: any) {
        console.warn("Groq exam generation failed:", groqErr?.message || groqErr);
      }
    }

    if (!parsed || !parsed.questions) {
      return NextResponse.json({ error: "Failed to generate exam paper. Please check AI provider keys." }, { status: 500 });
    }

    return NextResponse.json({ paper: parsed });
  } catch (error: any) {
    console.error("Exam Gen Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate exam paper" }, { status: 500 });
  }
}
