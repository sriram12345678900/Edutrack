import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { queryPythonServer } from "@/lib/python-ai";
import { getLanguagePromptInstruction } from "@/lib/languages";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { paper, studentAnswers, language = "English" } = await req.json();

    if (!paper || !studentAnswers) {
      return NextResponse.json({ error: "Missing paper or student answers" }, { status: 400 });
    }

    const langInstruction = getLanguagePromptInstruction(language);

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

LANGUAGE & PEDAGOGICAL INSTRUCTION:
${langInstruction}
Provide student-facing feedback, markingSchemeUsed, overallRemarks, weakAreas, and actionPlan in ${language}.

EVALUATION RULES:
1. For Section A Multiple Choice Questions (MCQs), compare the option selected by the student (e.g. (a) or (b)) against the correct option in the marking scheme. Award 1 mark if correct, 0 if incorrect.
2. For descriptive questions (Sections B, C, D, E), award marks step-by-step according to the marking scheme.
3. Be fair, objective, and constructive. Provide details on where they lost marks.

Return the evaluation results strictly as a JSON object matching the following structure:
{
  "totalMarks": ${paper.maxMarks},
  "marksAwarded": 0,
  "percentage": 0,
  "verdict": "<short evaluation verdict, e.g., Excellent / Good / Needs Improvement>",
  "sectionScores": {
    "A": { "max": 0, "awarded": 0 }
  },
  "questionEvaluations": [
    {
      "num": 1,
      "marksMax": 1,
      "marksAwarded": 1,
      "feedback": "<Specific observation in ${language}>",
      "markingSchemeUsed": "<Brief explanation in ${language}>"
    }
  ],
  "overallRemarks": "<Overall summary and tips for improvement in ${language}>",
  "weakAreas": ["<Topics or chapters where the student lost marks>"],
  "actionPlan": "<Actionable steps in ${language}>"
}
`;

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
        console.warn("Failed to parse local Python AI evaluation response as JSON:", err);
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
        console.warn("Gemini evaluation failed, falling back to Groq:", geminiErr?.message || geminiErr);
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
              content: "You are an expert CBSE NCERT exam evaluator. Always return strictly valid JSON matching the schema."
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
        console.warn("Groq evaluation failed:", groqErr?.message || groqErr);
      }
    }

    if (!parsed) {
      return NextResponse.json({ error: "Failed to evaluate exam paper. Please check AI provider keys." }, { status: 500 });
    }

    return NextResponse.json({ evaluation: parsed });
  } catch (error: any) {
    console.error("Exam Eval Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate exam paper" }, { status: 500 });
  }
}
