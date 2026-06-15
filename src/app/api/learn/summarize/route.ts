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

    const prompt = `You are a world-class CBSE board exam expert. Create an extremely comprehensive but ultra-dense, bite-sized "Complete Quick Revision Cheat Sheet" for the NCERT chapter "${chapter}" of the subject "${subject}".
    
    You MUST systematically cover ALL sub-topics, classifications, definitions, and types of concepts within this chapter (for example, if this is Chemical Reactions, you MUST cover combination, decomposition, displacement, double displacement, redox, oxidation, reduction, corrosion, and rancidity).
    
    Keep each item compact, precise, and highly dense.
    
    ${langInstruction}
    
    You MUST return ONLY a valid JSON object with absolutely NO other text, NO markdown codeblock wrappers, and NO leading/trailing text. Use this exact structure:
    {
      "keyTerms": [
        { "term": "Name of Definition/Type (e.g. 'Combination Reaction')", "definition": "High-density board-exam definition with key conditions and requirements (1-2 sentences) strictly within NCERT scope." }
      ],
      "equations": [
        { "name": "Name of Reaction / Equation / Law (e.g. 'Photosynthesis')", "formula": "Formula, reaction equation, or math form...", "description": "Quick board-exam detail or application tip." }
      ],
      "mnemonics": [
        { "concept": "What this trick helps you remember...", "trick": "The mnemonic phrase or visual revision trick." }
      ],
      "boardMustKnow": [
        "Core board fact strictly matching NCERT scope..."
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
      console.warn("Gemini summarizer failed, trying Groq...", geminiError.message || geminiError);

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
          { role: "system", content: "You are a world-class CBSE board exam expert who replies strictly in valid JSON containing Class 6-10 NCERT curriculum data only." },
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
      console.error("JSON Parse Error in Summary:", e, "Raw:", dataText);
      const cleaned = dataText.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Summarize API Error:", error);

    // Fallback Mock Data for demo/offline resilience
    const lowercaseChapter = (chapter || "").toLowerCase();
    const isChemReactions = lowercaseChapter.includes("reaction") || lowercaseChapter.includes("equations");

    if (isChemReactions) {
      return NextResponse.json({
        "keyTerms": [
          { "term": "Chemical Reaction", "definition": "A process in which one or more substances are converted into one or more new substances with entirely different chemical properties." },
          { "term": "Balanced Chemical Equation", "definition": "A chemical equation in which the total number of atoms of each element is equal on both the reactant and product sides, conforming to the Law of Conservation of Mass." },
          { "term": "Combination Reaction", "definition": "A chemical reaction in which two or more reactants combine to form a single new product. Example: CaO + H₂O → Ca(OH)₂." },
          { "term": "Decomposition Reaction", "definition": "A chemical reaction in which a single reactant breaks down into two or more simpler products under the action of heat, light, or electricity." },
          { "term": "Redox Reaction", "definition": "A chemical reaction in which both oxidation (gain of oxygen/loss of electrons) and reduction (loss of oxygen/gain of electrons) take place simultaneously." }
        ],
        "equations": [
          { "name": "Rusting of Iron", "formula": "4Fe + 3O₂ + 2xH₂O → 2Fe₂O₃·xH₂O", "description": "Slow oxidation of iron metal in the presence of air and moisture, forming a reddish-brown hydrated ferric oxide." },
          { "name": "Electrolysis of Water", "formula": "2H₂O (l) → 2H₂ (g) + O₂ (g)", "description": "Electrolytic decomposition of water yielding Hydrogen gas at the cathode and Oxygen gas at the anode in a 2:1 volume ratio." },
          { "name": "Precipitation of Barium Sulfate", "formula": "Na₂SO₄ (aq) + BaCl₂ (aq) → BaSO₄ (s)↓ + 2NaCl (aq)", "description": "Double displacement reaction forming a white precipitate of Barium Sulfate." }
        ],
        "mnemonics": [
          { "concept": "Redox Reactions (Oxidation/Reduction)", "trick": "OIL RIG: Oxidation Is Loss (of electrons), Reduction Is Gain (of electrons)." },
          { "concept": "Reactivity Series", "trick": "Please Stop Calling Me A Cute Zebra, I Like Her Call Smart Goat (Potassium, Sodium, Calcium, Magnesium, Aluminium, Carbon, Zinc, Iron, Lead, Hydrogen, Copper, Silver, Gold)." }
        ],
        "boardMustKnow": [
          "Silver chloride turns grey in sunlight due to photolytic decomposition into Silver metal and Chlorine gas.",
          "Nitrogen gas is flushed in potato chip bags to prevent rancidity by displacing oxygen and stopping oxidation.",
          "Whitewashed walls get a shiny finish after 2-3 days due to the slow formation of Calcium Carbonate (CaCO₃) from reaction with atmospheric CO₂."
        ]
      });
    }

    return NextResponse.json({
      "keyTerms": [
        { "term": `Core Concept of ${chapter}`, "definition": `High-density summary definition of the core topics of the chapter ${chapter} under CBSE guidelines.` }
      ],
      "equations": [
        { "name": "Standard Relationship", "formula": "Input ──> Output + Output", "description": "Formula mapping the chemical or physical logic of this chapter." }
      ],
      "mnemonics": [
        { "concept": "Key Recall Guide", "trick": "Use active spacing recall cards to memorize all subtopics in this chapter." }
      ],
      "boardMustKnow": [
        `Prepare standard board exam questions based on the textbook sections of ${chapter}.`,
        "Stick strictly to NCERT guidelines for full marks."
      ]
    });
  }
}
