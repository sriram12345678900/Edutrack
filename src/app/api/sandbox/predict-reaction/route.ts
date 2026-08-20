import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { solveReaction } from "@/lib/chemistry-reactions-engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reactants, conditions } = body;

    if (!reactants || !Array.isArray(reactants) || reactants.length === 0) {
      return NextResponse.json({ error: "No reactants provided" }, { status: 400 });
    }

    // 1. First run internal dynamic engine
    const localResult = solveReaction(reactants, conditions || {});

    // If local result found a known reaction, return immediately for instant speed
    if (localResult.category !== "no_reaction") {
      return NextResponse.json({ result: localResult, source: "canonical_engine" });
    }

    // 2. Fallback to Gemini AI prediction if API key exists
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_SUMMARY || "";
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a world-class inorganic and organic chemistry laboratory simulator and NCERT/CBSE/AP chemistry expert.
A student in the virtual chemistry sandbox placed the following reactants in a beaker:
Reactants: ${reactants.join(", ")}
Conditions: ${JSON.stringify(conditions || {})}

Analyze what happens chemically when these are mixed under the given conditions.
Respond ONLY with a valid JSON object strictly matching this schema (no markdown fences, no code blocks):
{
  "equation": "Balanced chemical equation with state symbols (s, l, g, aq) e.g. 'A + B -> C + D'",
  "productFormula": "Product formula summary",
  "name": "Concise reaction name",
  "type": "Reaction classification (e.g., Single Displacement, Redox, Complexation, No Reaction)",
  "desc": "Detailed educational explanation of what happens at the molecular level, observation details, color shifts, and safety notes.",
  "finalPH": 7.0,
  "liquidColor": "from-emerald-500/40 to-teal-600/30",
  "visualEffect": "gas" | "precipitate" | "flame" | "smoke" | "color_change" | "boiling" | "neutral",
  "tempChange": "+X.X°C (Exothermic/Endothermic)",
  "gasEvolved": "Gas name or null",
  "splintTest": "pop" | "rekindle" | "extinguish" | "none",
  "limewaterTest": true | false
}`;

        const aiRes = await model.generateContent(prompt);
        const text = (await aiRes.response).text().trim();
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json({
          result: {
            id: `ai_${reactants.join("_")}`,
            reactants,
            ...parsed,
            difficulty: "Advanced",
          },
          source: "ai_predictor",
        });
      } catch (aiErr) {
        console.warn("AI reaction predictor fallback:", aiErr);
      }
    }

    // Return rule engine result
    return NextResponse.json({ result: localResult, source: "canonical_engine" });
  } catch (error: any) {
    console.error("Predict reaction API error:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate reaction" }, { status: 500 });
  }
}
