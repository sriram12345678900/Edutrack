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

    const prompt = `Create "Interactive Notes" for the chapter "${chapter}" of ${subject}.

${langInstruction}

Return ONLY a valid JSON object with NO other text. Use this exact structure:
{
  "topics": [
    {
      "heading": "Topic heading here",
      "content": "Simple explanation here (2-3 sentences)",
      "flashcard": {
        "front": "Key term or question",
        "back": "Definition, answer, or mnemonic"
      }
    }
  ]
}

Generate exactly 4 topics covering the key concepts of this chapter.`;

    let dataText = "";

    // 1. Try Gemini first
    try {
      const apiKey = process.env.GEMINI_API_KEY_NOTES || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No Gemini API key configured.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      const result = await model.generateContent(prompt);
      dataText = result.response.text() || "";
    } catch (geminiError: any) {
      console.warn("Gemini notes generator failed, trying Groq...", geminiError.message || geminiError);

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
      console.error("JSON Parse Error in Notes:", e, "Raw:", dataText);
      const cleaned = dataText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Notes API Error:", error);

    // Fallback Mock Data for demo/offline resilience
    const lowercaseChapter = (chapter || "").toLowerCase();
    const isChemReactions = lowercaseChapter.includes("reaction") || lowercaseChapter.includes("equations");

    if (isChemReactions) {
      return NextResponse.json({
        "topics": [
          {
            "heading": "Chemical Equations",
            "content": "A chemical equation represents a chemical reaction using symbols and chemical formulae of reactants and products. It must be balanced to obey the Law of Conservation of Mass.",
            "flashcard": {
              "front": "Why must chemical equations be balanced?",
              "back": "To satisfy the Law of Conservation of Mass, which states that mass/atoms can neither be created nor destroyed in a chemical reaction."
            }
          },
          {
            "heading": "Types of Chemical Reactions",
            "content": "Chemical reactions are categorized into combination (two reactants form one product), decomposition (one reactant breaks into multiple products), displacement (more active metal replaces less active metal), and double displacement.",
            "flashcard": {
              "front": "What happens in a double displacement reaction?",
              "back": "Two ionic compounds exchange their ions in aqueous solution to form two new compounds, often producing a precipitate."
            }
          },
          {
            "heading": "Oxidation and Reduction (Redox)",
            "content": "Oxidation is the gain of oxygen or loss of hydrogen, whereas reduction is the loss of oxygen or gain of hydrogen. Both occur simultaneously in a Redox reaction.",
            "flashcard": {
              "front": "Define oxidation and reduction in terms of oxygen.",
              "back": "Oxidation is the gain of oxygen; reduction is the loss of oxygen."
            }
          },
          {
            "heading": "Corrosion and Rancidity",
            "content": "Corrosion is the gradual destruction of metals by moisture and air (e.g. rusting of iron). Rancidity is the oxidation of fats and oils in food, causing a change in smell and taste.",
            "flashcard": {
              "front": "How is rancidity prevented in potato chips packets?",
              "back": "The packets are flushed with Nitrogen gas, which is inert and prevents oxidation of fats/oils."
            }
          }
        ]
      });
    }

    return NextResponse.json({
      "topics": [
        {
          "heading": `Introduction to ${chapter}`,
          "content": `This section introduces the core concepts and fundamental definitions of ${chapter} within the Class 10 CBSE syllabus.`,
          "flashcard": {
            "front": `What is the primary definition of ${chapter}?`,
            "back": `Refer to the NCERT textbook guidelines for ${chapter} concepts.`
          }
        },
        {
          "heading": "Key Principles",
          "content": "Every scientific topic is governed by core principles that explain experimental observations and practical applications.",
          "flashcard": {
            "front": "What is the key principle of this topic?",
            "back": "Stick to CBSE board-approved models and standard definitions."
          }
        },
        {
          "heading": "Practical Experiments",
          "content": "NCERT focuses heavily on practical activities and direct observations to reinforce theoretical knowledge.",
          "flashcard": {
            "front": "Why are practical activities important?",
            "back": "They illustrate chemical/physical properties and are heavily queried in board exams."
          }
        },
        {
          "heading": "Board Examination Focus",
          "content": "Board questions frequently target standard definitions, labeled diagrams, and basic applications of these concepts.",
          "flashcard": {
            "front": "How should I prepare for board questions on this?",
            "back": "Focus on solved NCERT exemplars and textbook exercises."
          }
        }
      ]
    });
  }
}
