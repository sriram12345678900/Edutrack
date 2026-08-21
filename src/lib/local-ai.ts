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
  const { prompt = "", language = "English", image, bookInfo, allowFallbackSynthesis = false } = query;
  
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
    const knowledgeReply = findOfflineKnowledge(cleanPrompt, bookInfo);
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
    language,
    chapter: bookInfo
  });
  if (pythonData && pythonData.reply) {
    return {
      reply: pythonData.reply,
      engine: pythonData.engine || "Local Python PyTorch Model (localhost:5000)",
      matched: true
    };
  }

  // Check if prompt is inquiring about the current chapter/book
  if (/^(chapter\s*name|what\s+is\s+the\s+chapter|which\s+chapter|chapter\s+title|book\s+name|current\s+chapter)/i.test(cleanPrompt.trim()) && bookInfo) {
    return {
      reply: `You are currently studying **${bookInfo}**.\n\nHow can I assist you with this chapter? Would you like me to explain key formulas, solve an exercise problem, or summarize the main concepts?`,
      engine: "EduTrack NCERT Assistant",
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
      "please", "tell", "give", "solve", "help", "name", "list", "show", "write",
      "find", "calculate", "chapter", "book", "subject", "topic", "class", "grade",
      "cbse", "ncert", "pyq", "practice", "extra", "following", "consider", "given",
      "identify", "reaction", "type", "difference", "example", "notes", "summary",
      "key", "concepts", "concept", "textbook", "page", "reading", "study", "studying",
      "meaning", "mean", "can", "you"
    ]);

    const keywords = lowerPrompt
      .replace(/[^\w\s]/gi, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !stopWords.has(w));

    // Only search dataset if there are distinct meaningful keywords
    if (keywords.length >= 2) {
      let bestMatchScore = 0;
      let matchReply: string | null = null;

      const isMathContext = bookInfo ? /math|ganita|algebra|geometry|calculus|trigonometry/i.test(bookInfo) : false;
      const isScienceContext = bookInfo ? /science|chemistry|physics|biology/i.test(bookInfo) : false;

      for (const sample of samples) {
        const qText = (sample.input_text || "").toLowerCase();
        const ansText = (sample.output_text || "").toLowerCase();

        // Subject guard: don't match chemistry/biology if user is in math context
        if (isMathContext && (qText.includes("reaction") || qText.includes("compound") || qText.includes("photosynthesis") || qText.includes("respiration") || qText.includes("acid") || qText.includes("oxidation"))) {
          continue;
        }
        if (isScienceContext && (qText.includes("polynomial") || qText.includes("quadratic") || qText.includes("triangle") || qText.includes("arithmetic progression"))) {
          continue;
        }

        let score = 0;
        let matchedKws = 0;
        for (const kw of keywords) {
          if (qText.includes(kw)) {
            score += 3;
            matchedKws++;
          } else if (ansText.includes(kw)) {
            score += 1;
          }
        }

        // Require at least 2 distinct keywords matched in the question text
        if (matchedKws >= 2 && score > bestMatchScore && score >= 6) {
          bestMatchScore = score;
          matchReply = sample.output_text || null;
        }
      }

      if (matchReply && bestMatchScore >= 6) {
        return {
          reply: matchReply,
          engine: "EduTrack Grounded Dataset Engine (Offline)",
          matched: true
        };
      }
    }
  }

  // 5. Fallback Synthesizer if explicitly requested
  if (allowFallbackSynthesis && cleanPrompt) {
    const displayTopic = cleanPrompt.replace(/^([a-z\s]+:)/i, "").trim() || (bookInfo ? bookInfo : "Concept Inquiry");
    const formattedTopic = displayTopic
      .split(" ")
      .slice(0, 8)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const contextPrefix = bookInfo ? `For **${bookInfo}**:` : "";

    const dynamicFallback = `### **${formattedTopic} - EduTrack NCERT Concept Breakdown**

${contextPrefix}

**1. Core Concept Overview:**
In the CBSE Class 6-10 curriculum, **${formattedTopic}** is an essential topic. Understanding standard definitions, identities/formulas, and step-by-step reasoning ensures solid mastery for assessments.

**2. Key Principles & Explanation:**
- **Definition & Rules:** Ensure all problem steps, properties, and units are clearly expressed.
- **Formulas & Notations:** Standard NCERT mathematical identities and scientific notations apply directly here.

**3. Study & Problem Solving Tips:**
1. State given values and definitions using standard NCERT terminology.
2. For numerical/math problems, write each step sequentially: **Given → Formula / Property → Calculation → Final Answer**.
3. Re-check calculations and verify units.

*(EduTrack Assistant active. Ask any specific question or problem from this chapter to get a detailed step-by-step solution!)*`;

    return {
      reply: dynamicFallback,
      engine: "EduTrack Dynamic Offline Engine",
      matched: false
    };
  }

  return null;
}
