import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function POST(req: Request) {
  let subject = "Science";
  let chapter = "NCERT Topic";
  try {
    const body = await req.json();
    subject = body.subject || "Science";
    chapter = body.chapter || "NCERT Topic";
    const language = body.language || "Hinglish";

    const isIshLanguage = (language || "Hinglish").endsWith("ish") && language !== "English";
    const langInstruction = isIshLanguage
      ? `Use ${language || "Hinglish"} for explanations. You MUST strictly use the English alphabet (Roman script). DO NOT use native scripts (Devanagari, Telugu, Tamil, etc.). Keep technical terms in English.`
      : `Use ${language || "English"} for explanations. Keep technical terms in English.`;

    const prompt = `Generate a 5-question multiple choice quiz for the chapter "${chapter}" of the subject "${subject}" in the CBSE curriculum.
    Also include 1 HOTS (Higher Order Thinking Skills) question.
    
    Return the response strictly as a JSON object with absolutely NO other text, NO markdown codeblock wrappers, and NO leading/trailing text. Use this exact structure:
    {
      "questions": [
        { "id": 1, "question": "...", "options": ["...", "...", "...", "..."], "answer": 0, "explanation": "..." }
      ],
      "hots": { "question": "...", "hint": "..." }
    }
    
    In the "questions" array:
    - "options" must have exactly 4 items.
    - "answer" must be the index of the correct option (0, 1, 2, or 3).
    - Keep questions student-friendly and strictly aligned with NCERT guidelines for Class 10.
    - Absolutely DO NOT include any mole concept, molar mass, molecular weight, or stoichiometry mass/mole calculation questions for Class 10 chapters. All questions must focus on CBSE Class 10 concepts (identifying reaction types, balancing, chemical tests, observations, redox agents).
    ${langInstruction}`;

    let dataText = "";

    // 1. Try Gemini first
    try {
      const apiKey = process.env.GEMINI_API_KEY_QUIZ || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No Gemini API key configured.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      dataText = result.response.text() || "";
    } catch (geminiError: any) {
      console.warn("Gemini quiz generator failed, trying Groq...", geminiError.message || geminiError);

      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) {
        throw new Error("No Groq API key configured.");
      }
      const groq = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1"
      });

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a world-class CBSE board exam expert who replies strictly in valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      dataText = completion.choices[0]?.message?.content || "";
    }

    if (!dataText) {
      throw new Error("Failed to retrieve completion from LLMs");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(dataText);
    } catch (e) {
      console.error("JSON Parse Error in Quiz:", e, "Raw:", dataText);
      const cleaned = dataText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Quiz API Error:", error);

    // Fallback Mock Data for demo/offline resilience
    const lowercaseChapter = (chapter || "").toLowerCase();
    const isChemReactions = lowercaseChapter.includes("reaction") || lowercaseChapter.includes("equations");

    if (isChemReactions) {
      return NextResponse.json({
        "questions": [
          {
            "id": 1,
            "question": "What is the color change observed when a clean iron nail is kept immersed in a blue copper sulfate solution for about 30 minutes?",
            "options": [
              "Blue solution turns light green, and a reddish-brown coating forms on the nail",
              "Blue solution remains blue, and a yellow precipitate is formed",
              "Blue solution turns completely colorless, and white fumes are evolved",
              "Blue solution turns pink, and iron nail starts dissolving completely"
            ],
            "answer": 0,
            "explanation": "This is a single displacement reaction. Iron is more reactive than copper and displaces it from copper sulfate solution, forming green ferrous sulfate solution and depositing red-brown copper on the nail."
          },
          {
            "id": 2,
            "question": "Which of the following represents a balanced thermal decomposition reaction?",
            "options": [
              "2Pb(NO₃)₂ (s) → 2PbO (s) + 4NO₂ (g) + O₂ (g)",
              "CaO (s) + H₂O (l) → Ca(OH)₂ (aq) + Heat",
              "Zn (s) + CuSO₄ (aq) → ZnSO₄ (aq) + Cu (s)",
              "2H₂ (g) + O₂ (g) → 2H₂O (l)"
            ],
            "answer": 0,
            "explanation": "Lead Nitrate on heating decomposes into lead oxide (yellow solid), nitrogen dioxide (brown fumes), and oxygen. This is a thermal decomposition reaction."
          },
          {
            "id": 3,
            "question": "Why is nitrogen gas flushed into packets of potato chips?",
            "options": [
              "To prevent oxidation of fats and oils (rancidity)",
              "To increase the weight and size of the packet",
              "To make the chips taste saltier and crispier",
              "To speed up the decomposition of organic materials"
            ],
            "answer": 0,
            "explanation": "Nitrogen is an inert gas. It displaces oxygen in the packet, preventing the oxidation of fats and oils in the chips and preventing rancidity."
          },
          {
            "id": 4,
            "question": "Identify the substance oxidised in the following redox reaction: CuO (s) + H₂ (g) → Cu (s) + H₂O (l)",
            "options": [
              "H₂",
              "CuO",
              "Cu",
              "H₂O"
            ],
            "answer": 0,
            "explanation": "Hydrogen (H₂) gains oxygen to form H₂O, meaning it undergoes oxidation. CuO loses oxygen to form Cu, meaning it undergoes reduction."
          },
          {
            "id": 5,
            "question": "What happens when dilute hydrochloric acid is added to iron filings?",
            "options": [
              "Hydrogen gas and iron chloride are produced",
              "Chlorine gas and iron hydroxide are produced",
              "No chemical reaction takes place",
              "Iron salt and water are produced with heat release"
            ],
            "answer": 0,
            "explanation": "Iron reacts with hydrochloric acid to produce iron(II) chloride and hydrogen gas: Fe(s) + 2HCl(aq) → FeCl₂(aq) + H₂(g)↑."
          }
        ],
        "hots": {
          "question": "A shiny brown element 'X' on heating in air becomes black in color. Name the element 'X' and the black colored compound formed.",
          "hint": "Element 'X' is a copper-colored metal used in electrical wires, and the black compound is its oxide."
        }
      });
    }

    return NextResponse.json({
      "questions": [
        {
          "id": 1,
          "question": `Which of the following is a primary subtopic covered in the study of ${chapter}?`,
          "options": [
            "Standard Syllabus Core Concept",
            "Out of scope college thesis concept",
            "Unrelated syllabus theme option B",
            "Alternative unrelated theme option C"
          ],
          "answer": 0,
          "explanation": `This chapter covers the basic fundamentals of ${chapter} aligned with Class 10 CBSE guidelines.`
        }
      ],
      "hots": {
        "question": `Describe the practical application of ${chapter} in CBSE experiments.`,
        "hint": "Refer to the introduction and activity guides in the textbook section."
      }
    });
  }
}
