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

    const prompt = `You are a world-class CBSE board exam evaluator and senior NCERT textbook editor. Create a highly detailed, side-by-side "NCERT Comprehensive Study & Activity Guide" for the chapter "${chapter}" of the subject "${subject}" in the CBSE curriculum.
    
    You MUST cover ALL core topics, definitions, and every single TEXTBOOK EXPERIMENT / ACTIVITY (e.g. Activity 1.1, Activity 1.2, etc.) in this chapter.
    
    Structure the guide as follows:
    - Cover 5-6 core sections of the chapter.
    - For experiments/activities, include:
      1. Objective / Experiment setup.
      2. Key observations (what color changes, temperature changes, or gases are evolved).
      3. Chemical reaction equation or physical law/formula.
      4. CBSE board exam question focus.
    
    ${langInstruction}
    
    You MUST return ONLY a valid JSON object with absolutely NO other text, NO markdown codeblock wrappers, and NO leading/trailing text. Use this exact structure:
    {
      "lines": [
        {
          "original": "Core NCERT Definition / Core Textbook Segment / Experiment Title (e.g. 'Activity 1.1: Burning of Magnesium Ribbon')",
          "explanation": "Extremely clear, comprehensive conceptual breakdown. If it is an experiment, list the steps, key observations, balanced equations, and conclusions in clean bullet points strictly matching the NCERT textbook.",
          "boardTip": "Board focus: frequently asked questions, expected marks, key terms required to score full marks.",
          "misconception": "Common student misunderstanding or mistake in tests."
        }
      ]
    }`;

    let dataText = "";

    // 1. Try Gemini first
    try {
      const apiKey = process.env.GEMINI_API_KEY_SUMMARY || process.env.GEMINI_API_KEY;
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
      console.warn("Gemini line-by-line generator failed, trying Groq...", geminiError.message || geminiError);

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
          { role: "system", content: "You are a world-class CBSE board exam expert who replies strictly in valid JSON containing Class 6-10 NCERT data only." },
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
      console.error("JSON Parse Error in Line-by-Line:", e, "Raw:", dataText);
      const cleaned = dataText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Line-by-Line API Error:", error);

    // Fallback Mock Data for demo/offline resilience
    const lowercaseChapter = (chapter || "").toLowerCase();
    const isChemReactions = lowercaseChapter.includes("reaction") || lowercaseChapter.includes("equations");

    if (isChemReactions) {
      return NextResponse.json({
        "lines": [
          {
            "original": "Activity 1.1: Burning of Magnesium Ribbon in Air",
            "explanation": "Magnesium ribbon is cleaned with sandpaper to remove the protective layer of basic magnesium carbonate. On burning in a Bunsen flame, it burns with a dazzling white flame to produce a white powder of Magnesium Oxide (MgO). Reaction: 2Mg(s) + O₂(g) → 2MgO(s). This is an exothermic combination reaction.",
            "boardTip": "Board focus: Often asked why magnesium ribbon is cleaned before burning. Answer: to remove the basic magnesium carbonate protective layer.",
            "misconception": "Students think magnesium burns with a yellow flame. It actually burns with a dazzling white flame."
          },
          {
            "original": "Activity 1.2: Reaction of Lead Nitrate with Potassium Iodide",
            "explanation": "When lead nitrate solution is mixed with potassium iodide solution in a test tube, a brilliant yellow precipitate of Lead Iodide (PbI₂) is formed instantly along with soluble Potassium Nitrate. Reaction: Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq). This is a double displacement and precipitation reaction.",
            "boardTip": "Board focus: State the color of the precipitate formed. Answer: Yellow precipitate of Lead Iodide.",
            "misconception": "Thinking the yellow precipitate is potassium nitrate. Potassium nitrate is colorless and remains in solution."
          },
          {
            "original": "Activity 1.3: Reaction of Zinc Granules with Dilute Acid",
            "explanation": "Zinc granules are placed in a conical flask and dilute Hydrochloric Acid or Sulfuric Acid is added. Gas bubbles are evolved, and the conical flask becomes hot. The evolved gas burns with a pop sound, confirming it is Hydrogen gas. Reaction: Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)↑. This is an exothermic single displacement reaction.",
            "boardTip": "Board focus: Describe the test for Hydrogen gas. Answer: Bring a burning candle near the gas; it burns with a pop sound.",
            "misconception": "Assuming the temperature decreases. This is an exothermic reaction, so the container temperature increases."
          },
          {
            "original": "Activity 1.4: Reaction of Calcium Oxide (Quicklime) with Water",
            "explanation": "Water is added slowly to calcium oxide in a beaker. A hissing sound is heard, and the beaker becomes very hot. Calcium oxide reacts vigorously with water to form calcium hydroxide (slaked lime). Reaction: CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat. This is a highly exothermic combination reaction.",
            "boardTip": "Board focus: Slaked lime is used for whitewashing walls. It reacts slowly with CO₂ in air to form a shiny layer of CaCO₃.",
            "misconception": "Thinking quicklime and slaked lime are the same. Quicklime is CaO (solid), and slaked lime is Ca(OH)₂ (aqueous)."
          }
        ]
      });
    }

    return NextResponse.json({
      "lines": [
        {
          "original": `Core Concept of ${chapter || "NCERT Topic"}`,
          "explanation": `This activity outlines the central foundational concept of ${chapter || "this chapter"} according to the Class 10 NCERT Science guidelines. Ensure you understand all definitions and practical observations.`,
          "boardTip": "Board focus: Pay close attention to standard NCERT definitions and core textbook diagrams.",
          "misconception": "Relying on out-of-scope advanced theories instead of sticking to standard NCERT classifications."
        }
      ]
    });
  }
}
