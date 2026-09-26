import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { queryPythonServer } from "@/lib/python-ai";
import { getLanguagePromptInstruction } from "@/lib/languages";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { question, expectedAnswer, studentTranscript, topic, language = "English" } = await req.json();

    if (!question || !studentTranscript) {
      return NextResponse.json({ error: "Missing question or studentTranscript parameter." }, { status: 400 });
    }

    const langInstruction = getLanguagePromptInstruction(language);

    const prompt = `You are a senior academic CBSE examiner evaluating a student's verbal answer for an oral viva on the topic: "${topic}".
Question: "${question}"
Expected Answer/Keywords: "${expectedAnswer}"
Student's Verbal Answer: "${studentTranscript}"

LANGUAGE & EXAMINER TONE:
${langInstruction}
- The "feedback", "strengths", and "missedConcepts" MUST be written in ${language}.
- Be encouraging yet rigorous like a friendly senior CBSE professor.

Evaluate the student's answer and return strictly a JSON object matching this structure:
{
  "score": 8,
  "feedback": "<constructive feedback as the examiner in ${language}>",
  "strengths": ["<strength in ${language}>"],
  "missedConcepts": ["<missing step or formula in ${language}>"]
}`;

    const parseJson = (text: string) => {
      let clean = text.trim();
      if (clean.startsWith('```json')) clean = clean.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      else if (clean.startsWith('```')) clean = clean.replace(/^```\n?/, '').replace(/\n?```$/, '');
      return JSON.parse(clean);
    };

    // 1. Try local Python AI Server first
    let parsed = null;
    const pythonRes = await queryPythonServer({
      task: "evaluate_viva",
      prompt: prompt,
      question: question,
      topic: topic,
      studentTranscript: studentTranscript,
      language: language
    });

    if (pythonRes && pythonRes.reply) {
      try {
        parsed = parseJson(pythonRes.reply);
      } catch (err) {
        console.warn("Failed to parse local Python AI viva evaluation response as JSON:", err);
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
        console.warn("Gemini viva evaluation failed, falling back to Groq:", geminiErr?.message || geminiErr);
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
              content: "You are a senior academic CBSE oral viva examiner. Always return strictly valid JSON."
            },
            {
              role: "user",
              content: `${prompt}\n\nRespond strictly with valid JSON.`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1024,
        });
        const raw = completion.choices[0]?.message?.content || "";
        parsed = parseJson(raw);
      } catch (groqErr: any) {
        console.warn("Groq viva evaluation failed:", groqErr?.message || groqErr);
      }
    }

    if (!parsed) {
      return NextResponse.json({ error: "Failed to evaluate viva answer with available AI engines" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Viva Evaluation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate viva answer" }, { status: 500 });
  }
}
