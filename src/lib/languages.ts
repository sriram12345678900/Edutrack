export interface LanguageConfig {
  code: string;
  label: string;
  englishName: string;
  nativeName: string;
  category: "bilingual" | "regional" | "standard";
  speechCode: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  // ── Standard ──
  {
    code: "English",
    label: "English",
    englishName: "English",
    nativeName: "English",
    category: "standard",
    speechCode: "en-IN",
    description: "Standard formal English explanation"
  },

  // ── Conversational Bilingual Blends (English / Roman Script) ──
  {
    code: "Hinglish",
    label: "Hinglish (Hindi + Eng)",
    englishName: "Hindi-English",
    nativeName: "हिंग्लिश",
    category: "bilingual",
    speechCode: "hi-IN",
    description: "Conversational Hindi written in English/Latin script with technical terms in English"
  },
  {
    code: "Telgish",
    label: "Telgish (Telugu + Eng)",
    englishName: "Telugu-English",
    nativeName: "తెల్గిష్",
    category: "bilingual",
    speechCode: "te-IN",
    description: "Conversational Telugu written in English/Latin script with technical terms in English"
  },
  {
    code: "Tanglish",
    label: "Tanglish (Tamil + Eng)",
    englishName: "Tamil-English",
    nativeName: "தமிங்கிலம்",
    category: "bilingual",
    speechCode: "ta-IN",
    description: "Conversational Tamil written in English/Latin script with technical terms in English"
  },
  {
    code: "Kanglish",
    label: "Kanglish (Kannada + Eng)",
    englishName: "Kannada-English",
    nativeName: "ಕನ್ನಡ-ಇಂಗ್ಲಿಷ್",
    category: "bilingual",
    speechCode: "kn-IN",
    description: "Conversational Kannada written in English/Latin script with technical terms in English"
  },
  {
    code: "Manglish",
    label: "Manglish (Malayalam + Eng)",
    englishName: "Malayalam-English",
    nativeName: "മംഗ്ലീഷ്",
    category: "bilingual",
    speechCode: "ml-IN",
    description: "Conversational Malayalam written in English/Latin script with technical terms in English"
  },
  {
    code: "Marathish",
    label: "Marathish (Marathi + Eng)",
    englishName: "Marathi-English",
    nativeName: "मराठी-इंग्लिश",
    category: "bilingual",
    speechCode: "mr-IN",
    description: "Conversational Marathi written in English/Latin script with technical terms in English"
  },
  {
    code: "Benglish",
    label: "Benglish (Bengali + Eng)",
    englishName: "Bengali-English",
    nativeName: "বাংলিশ",
    category: "bilingual",
    speechCode: "bn-IN",
    description: "Conversational Bengali written in English/Latin script with technical terms in English"
  },
  {
    code: "Gujlish",
    label: "Gujlish (Gujarati + Eng)",
    englishName: "Gujarati-English",
    nativeName: "ગુજલિશ",
    category: "bilingual",
    speechCode: "gu-IN",
    description: "Conversational Gujarati written in English/Latin script with technical terms in English"
  },
  {
    code: "Punglish",
    label: "Punglish (Punjabi + Eng)",
    englishName: "Punjabi-English",
    nativeName: "ਪੰਗਲਿਸ਼",
    category: "bilingual",
    speechCode: "pa-IN",
    description: "Conversational Punjabi written in English/Latin script with technical terms in English"
  },
  {
    code: "Urdish",
    label: "Urdish (Urdu + Eng)",
    englishName: "Urdu-English",
    nativeName: "اردش",
    category: "bilingual",
    speechCode: "ur-IN",
    description: "Conversational Urdu written in English/Latin script with technical terms in English"
  },

  // ── Regional Languages (Native Scripts) ──
  {
    code: "Hindi",
    label: "Hindi (हिंदी)",
    englishName: "Hindi",
    nativeName: "हिंदी",
    category: "regional",
    speechCode: "hi-IN",
    description: "Fluent Hindi in Devanagari script with standard NCERT terminology"
  },
  {
    code: "Telugu",
    label: "Telugu (తెలుగు)",
    englishName: "Telugu",
    nativeName: "తెలుగు",
    category: "regional",
    speechCode: "te-IN",
    description: "Fluent Telugu script with standard NCERT scientific and mathematical terms"
  },
  {
    code: "Tamil",
    label: "Tamil (தமிழ்)",
    englishName: "Tamil",
    nativeName: "தமிழ்",
    category: "regional",
    speechCode: "ta-IN",
    description: "Fluent Tamil script with standard NCERT scientific and mathematical terms"
  },
  {
    code: "Kannada",
    label: "Kannada (ಕನ್ನಡ)",
    englishName: "Kannada",
    nativeName: "ಕನ್ನಡ",
    category: "regional",
    speechCode: "kn-IN",
    description: "Fluent Kannada script with standard NCERT scientific and mathematical terms"
  },
  {
    code: "Malayalam",
    label: "Malayalam (മലയാളം)",
    englishName: "Malayalam",
    nativeName: "മലയാളം",
    category: "regional",
    speechCode: "ml-IN",
    description: "Fluent Malayalam script with standard NCERT scientific and mathematical terms"
  },
  {
    code: "Marathi",
    label: "Marathi (मराठी)",
    englishName: "Marathi",
    nativeName: "मराठी",
    category: "regional",
    speechCode: "mr-IN",
    description: "Fluent Marathi script with standard NCERT scientific and mathematical terms"
  },
  {
    code: "Bengali",
    label: "Bengali (বাংলা)",
    englishName: "Bengali",
    nativeName: "বাংলা",
    category: "regional",
    speechCode: "bn-IN",
    description: "Fluent Bengali script with standard NCERT scientific and mathematical terms"
  },
  {
    code: "Gujarati",
    label: "Gujarati (ગુજરાતી)",
    englishName: "Gujarati",
    nativeName: "ગુજરાતી",
    category: "regional",
    speechCode: "gu-IN",
    description: "Fluent Gujarati script with standard NCERT scientific and mathematical terms"
  },
  {
    code: "Punjabi",
    label: "Punjabi (ਪੰਜਾਬੀ)",
    englishName: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    category: "regional",
    speechCode: "pa-IN",
    description: "Fluent Punjabi in Gurmukhi script with standard NCERT scientific terms"
  },
  {
    code: "Odia",
    label: "Odia (ଓଡ଼ିଆ)",
    englishName: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    category: "regional",
    speechCode: "or-IN",
    description: "Fluent Odia script with standard NCERT scientific terms"
  },
  {
    code: "Assamese",
    label: "Assamese (অসমীয়া)",
    englishName: "Assamese",
    nativeName: "অসমীয়া",
    category: "regional",
    speechCode: "as-IN",
    description: "Fluent Assamese script with standard NCERT scientific terms"
  },
  {
    code: "Urdu",
    label: "Urdu (اردو)",
    englishName: "Urdu",
    nativeName: "اردو",
    category: "regional",
    speechCode: "ur-IN",
    description: "Fluent Urdu script with standard NCERT scientific and mathematical terms"
  },
  {
    code: "Sanskrit",
    label: "Sanskrit (संस्कृतम्)",
    englishName: "Sanskrit",
    nativeName: "संस्कृतम्",
    category: "regional",
    speechCode: "sa-IN",
    description: "Sanskrit language with Devanagari script for CBSE Sanskrit curriculum"
  }
];

export function getLanguageConfig(code?: string): LanguageConfig {
  if (!code) return SUPPORTED_LANGUAGES[0];
  const normalized = code.trim().toLowerCase();
  const found = SUPPORTED_LANGUAGES.find(
    l => l.code.toLowerCase() === normalized || l.englishName.toLowerCase() === normalized
  );
  return found || SUPPORTED_LANGUAGES[0];
}

export function getSpeechLanguageCode(languageName?: string): string {
  if (!languageName) return "en-IN";
  const config = getLanguageConfig(languageName);
  return config.speechCode || "en-IN";
}

export function isBilingualLanguage(languageName?: string): boolean {
  const config = getLanguageConfig(languageName);
  return config.category === "bilingual" || Boolean(languageName?.endsWith("ish") && languageName !== "English");
}

export function getLanguageMnemonicHeader(languagePreference: string = "English"): string {
  const config = getLanguageConfig(languagePreference);
  const code = config.code.toLowerCase();

  if (code === "hinglish") return "💡 Yaad Rakhne Ka Tarika:";
  if (code === "hindi") return "💡 याद रखने का आसान तरीका:";
  if (code === "telugu" || code === "telgish") return "💡 గుర్తుంచుకోవడానికి సులభమైన ట్రిక్:";
  if (code === "tamil" || code === "tanglish") return "💡 நினைவில் வைக்க எளிய வழி:";
  if (code === "kannada" || code === "kanglish") return "💡 ನೆನಪಿಡುವ ಸುಲಭ ತಂತ್ರ:";
  if (code === "bengali" || code === "benglish") return "💡 মনে রাখার সহজ কৌশল:";
  if (code === "marathi" || code === "marathish") return "💡 लक्षात ठेवण्याची सोपी युक्ती:";
  if (code === "gujarati" || code === "gujlish") return "💡 યાદ રાખવાની સરળ ટ્રીક:";
  if (code === "malayalam" || code === "manglish") return "💡 ഓർമ്മിക്കാൻ എളുപ്പവഴി:";
  if (code === "punjabi" || code === "punglish") return "💡 ਯਾਦ ਰੱਖਣ ਦਾ ਤਰੀਕਾ:";
  return "💡 Memory Trick & Key Takeaway:";
}

export function getLanguagePromptInstruction(languagePreference: string = "English"): string {
  const config = getLanguageConfig(languagePreference);

  if (config.code === "English") {
    return `LANGUAGE INSTRUCTION: Respond in clear, engaging, and simple English tailored for Indian CBSE students.
- Keep technical terms in **bold**.
- Explain complex concepts using intuitive real-world examples (e.g., sports, technology, daily life).
- Maintain rigorous mathematical and chemical equation accuracy.`;
  }

  if (config.category === "bilingual" || config.code.endsWith("ish")) {
    const baseName = config.code.replace(/ish$/i, "");
    return `CRITICAL LANGUAGE INSTRUCTION: Respond in natural, conversational ${config.code} (a student-friendly Indian blend of ${config.englishName || baseName} and English).
- SCRIPT: You MUST strictly write in the English/Roman alphabet (Latin script). NEVER output native Indic scripts (e.g. do not output Devanagari or Telugu characters).
- TONE: Warm, encouraging, and highly relatable—like a passionate senior CBSE topper or favorite teacher explaining over a study session. Use conversational phrasing written in English letters (e.g. "Dhyan se dekho", "Iska simple matlab ye hai", "Board exam me ye step miss mat karna").
- FORMULA & MATH NOTATION PROTECTION: All mathematical variables, equations, identities, and chemical formulas MUST remain in standard universal Unicode/LaTeX notation (e.g., $F = ma$, $2\\text{H}_2 + \\text{O}_2 \\rightarrow 2\\text{H}_2\\text{O}$, $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$). NEVER awkwardly romanize or translate formulas.
- KEYWORDS: Always keep standard NCERT subject keywords in English (e.g. "Photosynthesis", "Refractive Index", "Quadratic Equation", "Mitochondria").
- ANALOGIES: Use vivid Indian real-life examples (e.g., cricket bowling, pressure cookers, bicycle chains, metro train inertia, tea boiling) to make concepts click instantly.`;
  }

  return `CRITICAL LANGUAGE INSTRUCTION: Respond in fluent ${config.code} (${config.nativeName}) using its authentic native script.
- SCRIPT: Write the core narrative explanations and conceptual steps in authentic ${config.nativeName} script with grammatical fluency.
- BILINGUAL KEYWORD PAIRING: Whenever introducing a key scientific, mathematical, or social science term, ALWAYS mention the English NCERT term in parentheses right next to it (e.g. "${config.code === "Hindi" ? "प्रकाश संश्लेषण (Photosynthesis)" : "Concept (English Keyword)"}"). This ensures students understand both native concepts and their board exam English terminology.
- FORMULA & MATH NOTATION PROTECTION: Chemical symbols (e.g. $\\text{H}_2\\text{O}$, $\\text{Fe}_3\\text{O}_4$), mathematical equations ($a^2 + b^2 = c^2$, $\\sin^2\\theta + \\cos^2\\theta = 1$), and SI units (e.g. $\\text{m/s}^2$, $\\text{Joule}$, $\\Omega$) MUST strictly remain in standard alphanumeric/Unicode notation. DO NOT translate formula variables into native words.
- TONE: Highly supportive, motivating, and pedagogically clear. Break complex multi-step derivations into digestible numbered points.`;
}

export function formatBilingualPrompt(topic: string, languagePreference: string = "English"): string {
  const config = getLanguageConfig(languagePreference);
  const langInstruction = getLanguagePromptInstruction(languagePreference);
  return `TOPIC: "${topic}"\nTARGET LANGUAGE: ${config.label} (${config.code})\n\n${langInstruction}`;
}
