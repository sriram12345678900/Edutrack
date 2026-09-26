import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { queryPythonServer } from "@/lib/python-ai";
import { getLanguagePromptInstruction, getLanguageConfig } from "@/lib/languages";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { topic, language = "English" } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Missing topic parameter." }, { status: 400 });
    }

    const langConfig = getLanguageConfig(language);
    const langInstruction = getLanguagePromptInstruction(language);

    const prompt = `You are an expert educational podcast scriptwriter for Indian students.
Generate an engaging, lively conversational podcast script between two hosts for the topic: "${topic}".
The hosts are:
- Alex (Curious student host asking intuitive questions)
- Maya (Expert senior tutor explaining concepts step-by-step with real-life Indian analogies)

TARGET LANGUAGE & SCRIPT:
${langInstruction}

PODCAST RULES:
- Generate exactly 6 dialogue turns total (3 per speaker, alternating starting with Alex).
- Keep dialogues natural, friendly, and relatable (like a study session over chai).
- Preserve all mathematical and chemical equations ($F = ma$, $\\text{H}_2\\text{O}$) in universal notation.

Return the script strictly as a JSON object matching the following structure:
{
  "dialogues": [
    {
      "speaker": "Alex",
      "role": "Inquisitive Host",
      "text": "The dialogue text in ${language}.",
      "avatarSeed": "AlexPodcast"
    },
    {
      "speaker": "Maya",
      "role": "Expert Explainer",
      "text": "The dialogue text in ${language}.",
      "avatarSeed": "MayaPodcast"
    }
  ]
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
      task: "podcast",
      prompt: prompt,
      topic: topic,
      language: language
    });

    if (pythonRes && pythonRes.reply) {
      try {
        parsed = parseJson(pythonRes.reply);
      } catch (err) {
        console.warn("Failed to parse local Python AI podcast response as JSON:", err);
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
        console.warn("Gemini podcast generation failed, falling back to Groq:", geminiErr?.message || geminiErr);
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
              content: "You are an expert educational podcast scriptwriter. Always return strictly valid JSON."
            },
            {
              role: "user",
              content: `${prompt}\n\nRespond strictly with valid JSON.`
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 2048,
        });
        const raw = completion.choices[0]?.message?.content || "";
        parsed = parseJson(raw);
      } catch (groqErr: any) {
        console.warn("Groq podcast generation failed:", groqErr?.message || groqErr);
      }
    }

    if (!parsed || !parsed.dialogues) {
      return NextResponse.json({ error: "Failed to generate podcast dialogues." }, { status: 500 });
    }

    return NextResponse.json({ ...parsed, language, speechCode: langConfig.speechCode });
  } catch (error: any) {
    console.error("Podcast Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate podcast" }, { status: 500 });
  }
}
