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

export function getLanguagePromptInstruction(languagePreference: string = "English"): string {
  const config = getLanguageConfig(languagePreference);

  if (config.code === "English") {
    return "Respond strictly in clear, friendly, and simple English.";
  }

  if (config.category === "bilingual" || config.code.endsWith("ish")) {
    const baseName = config.code.replace(/ish$/i, "");
    return `LANGUAGE INSTRUCTION: Respond in conversational ${config.code} (a student-friendly mix of ${config.englishName || baseName} and English).
- SCRIPT: You MUST strictly write in the English/Roman alphabet (Latin script). NEVER use native Indic scripts.
- CONVERSATIONAL TONE: Use casual conversational phrasing written in English letters.
- TERMINOLOGY: Always keep scientific terms, mathematical identities, formula names, and NCERT keywords in proper English.`;
  }

  return `LANGUAGE INSTRUCTION: Respond in fluent ${config.code} (${config.nativeName}) using its authentic native script.
- SCRIPT: Write the explanations in authentic ${config.nativeName} script.
- TERMINOLOGY: Keep technical, chemical, and mathematical terms, SI units, and key NCERT formulas clearly understandable and standard, pairing them with English/Unicode notation where helpful for student clarity.`;
}
