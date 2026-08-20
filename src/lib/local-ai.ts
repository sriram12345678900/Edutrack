import fs from "fs";
import path from "path";
import { findOfflineKnowledge } from "./offline-knowledge";
import { analyzeHomeworkImage } from "./vision-engine";
import { queryPythonServer } from "./python-ai";

export interface LocalAIQuery {
  prompt?: string;
  language?: string;
  image?: string;
  bookInfo?: string;
  allowFallbackSynthesis?: boolean;
}

export interface LocalAIResponse {
  reply: string;
  engine: string;
  matched: boolean;
}

interface DatasetSample {
  messages?: { role: string; content: string }[];
  input_text?: string;
  output_text?: string;
}

// In-memory cache for local training dataset
let cachedDataset: DatasetSample[] | null = null;

function loadLocalDataset(): DatasetSample[] {
  if (cachedDataset) return cachedDataset;
  try {
    const datasetPath = path.join(process.cwd(), "public", "training", "edutrack_gemini_dataset.json");
    if (fs.existsSync(datasetPath)) {
      const raw = fs.readFileSync(datasetPath, "utf-8");
      cachedDataset = JSON.parse(raw);
      return cachedDataset || [];
    }
  } catch (e) {
    console.error("Error loading local dataset:", e);
  }
  return [];
}

/**
 * Searches EduTrack's offline knowledge bases, image engine, fine-tuned datasets, and local Python server.
 * Returns a response if a confident match is found, or when allowFallbackSynthesis is true.
 */
export async function queryLocalAI(query: LocalAIQuery): Promise<LocalAIResponse | null> {
  const { prompt = "", language = "English", image, allowFallbackSynthesis = false } = query;
  
  if (!prompt && !image) {
    return null;
  }

  const cleanPrompt = prompt.replace(/\[SYSTEM:[\s\S]*?\]/gi, "").trim();
  const lowerPrompt = cleanPrompt.toLowerCase();

  // 1. If an image is provided, run EduTrack Vision & Optical Image Reader Engine
  if (image && typeof image === "string") {
    try {
      const visionResult = analyzeHomeworkImage(image, cleanPrompt);
      const replyText = `### **EduTrack Lens & AI Vision Analysis**\n\n` +
        `**Subject:** ${visionResult.subject} (${visionResult.chapter})\n` +
        `**Extracted Content:** *"${visionResult.extractedText}"*\n\n` +
        `#### Step-by-Step Solution & Concept Breakdown:\n` +
        visionResult.stepByStepSolution.join("\n\n") +
        (visionResult.keyFormulas.length > 0 ? `\n\n**Key NCERT Formulas:**\n` + visionResult.keyFormulas.map(f => `• ${f}`).join("\n") : "");

      return {
        reply: replyText,
        engine: "EduTrack Vision & Image Reading Engine",
        matched: true
      };
    } catch (err) {
      console.warn("Local vision analysis error:", err);
    }
  }

  // 2. Check local prebuilt NCERT Knowledge Engine first (Instant, High-Confidence)
  if (cleanPrompt) {
    const knowledgeReply = findOfflineKnowledge(cleanPrompt);
    if (knowledgeReply) {
      return {
        reply: knowledgeReply,
        engine: "EduTrack NCERT Knowledge Engine (Offline)",
        matched: true
      };
    }
  }

  // 3. Check local Python inference server at http://localhost:5000
  const pythonData = await queryPythonServer({
    task: "chat",
    prompt: cleanPrompt,
    language
  });
  if (pythonData && pythonData.reply) {
    return {
      reply: pythonData.reply,
      engine: pythonData.engine || "Local Python PyTorch Model (localhost:5000)",
      matched: true
    };
  }

  // 4. Search Local Grounded Dataset (edutrack_gemini_dataset.json)
  const samples = loadLocalDataset();
  if (samples.length > 0 && cleanPrompt) {
    const stopWords = new Set([
      "what", "when", "where", "which", "who", "whom", "whose", "why", "how", 
      "define", "explain", "describe", "state", "the", "a", "an", "is", "are", 
      "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", 
      "did", "for", "with", "about", "against", "between", "into", "through", 
      "during", "before", "after", "above", "below", "to", "from", "up", "down", 
      "in", "out", "on", "off", "over", "under", "again", "further", "then", "once",
      "please", "tell", "give", "solve", "help"
    ]);
    const keywords = lowerPrompt
      .replace(/[^\w\s]/gi, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !stopWords.has(w));

    let bestMatchScore = 0;
    let matchReply: string | null = null;
    const requiredMinScore = keywords.length <= 2 ? 1 : 2;

    for (const sample of samples) {
      const qText = (sample.input_text || "").toLowerCase();
      const ansText = (sample.output_text || "").toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (qText.includes(kw)) score += 2;
        else if (ansText.includes(kw)) score += 1;
      }
      if (score > bestMatchScore && score >= requiredMinScore) {
        bestMatchScore = score;
        matchReply = sample.output_text || null;
      }
    }

    if (matchReply && bestMatchScore >= 2) {
      return {
        reply: matchReply,
        engine: "EduTrack Grounded Dataset Engine (Offline)",
        matched: true
      };
    }
  }

  // 5. Fallback Synthesizer if explicitly requested
  if (allowFallbackSynthesis && cleanPrompt) {
    const displayTopic = cleanPrompt.replace(/^([a-z\s]+:)/i, "").trim() || "Concept Inquiry";
    const formattedTopic = displayTopic
      .split(" ")
      .slice(0, 8)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const dynamicFallback = `### **${formattedTopic} - EduTrack NCERT Concept Breakdown**

**1. Core Concept Overview:**
In the CBSE Class 6-10 curriculum, **${formattedTopic}** is a vital topic. It is evaluated based on conceptual clarity, precise definitions, balanced chemical/mathematical equations, and step-by-step reasoning.

**2. Key Principles & Explanation:**
- **Definition:** **${formattedTopic}** refers to the key scientific or mathematical phenomenon where fundamental rules apply.
- **Formulas & Notations:** When expressing chemical reactions or mathematical terms, always use proper subscript/superscript notation (e.g., $\\text{H}_2\\text{O}$, $\\text{CO}_2$, $\\text{Ca(OH)}_2$, $x^2$, $a^2 + b^2 = c^2$).
- **NCERT Rule:** Ensure units are explicitly mentioned in SI standards (e.g., Joules for Energy, Volts for Potential Difference, Meters/second for Velocity).

**3. CBSE Board Exam Tips:**
1. State definitions using precise NCERT keywords.
2. Draw neat, labeled diagrams wherever applicable (e.g., ray diagrams, cell structures, circuit diagrams).
3. For numerical problems, follow the 4-step format: **Given $\\rightarrow$ Formula $\\rightarrow$ Calculation $\\rightarrow$ Final Answer with SI Units**.

*(Note: Response generated by EduTrack Self-Hosted Engine).*`;

    return {
      reply: dynamicFallback,
      engine: "EduTrack Dynamic Offline Engine",
      matched: false
    };
  }

  return null;
}
