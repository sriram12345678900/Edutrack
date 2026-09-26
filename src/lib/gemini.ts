import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryPythonServer } from "./python-ai";
import { getLanguagePromptInstruction } from "./languages";

export async function getChatResponse(messages: { role: string; content: string }[], languagePreference: string, bookInfo: string = "") {
  try {
    const lastMessage = messages[messages.length - 1]?.content || "";

    // 1. Try Python Developed Local AI Server First (http://localhost:5000)
    const pythonRes = await queryPythonServer({
      task: "chat",
      prompt: lastMessage,
      language: languagePreference,
      chapter: bookInfo
    });
    if (pythonRes && pythonRes.reply) {
      return pythonRes.reply;
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) throw new Error("API Key is missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const contextLine = bookInfo ? `The student is studying: ${bookInfo}. Base your answers directly on this NCERT curriculum and chapter.` : "";
    const langInstruction = getLanguagePromptInstruction(languagePreference);
    const prompt = `System: You are EduTrack AI tutor for Indian Class 6-10 students following CBSE NCERT curriculum.
${contextLine}
${langInstruction}

IMPORTANT RULES & FORMATTING:
1. Whenever writing chemical formulas or mathematical equations, strictly use proper Unicode subscript and superscript characters (e.g., H₂O, CO₂, x², 2H₂O₂ → 2H₂O + O₂).
2. Structure answers step-by-step with clear numbered points or bullet points.
3. For Math problems, show: Step 1 (Given), Step 2 (Formula/Identity), Step 3 (Calculation), and Final Answer with units.
4. For Science & Social Science, include key NCERT terms in **bold**.

Student Question: ${lastMessage}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini SDK Error:", error.message);
    throw error;
  }
}

export async function generateContent(prompt: string, apiKey?: string, languagePreference?: string) {
  try {
    const fullPrompt = languagePreference
      ? `${prompt}\n\n${getLanguagePromptInstruction(languagePreference)}`
      : prompt;

    // 1. Try Python Developed Local AI Server First
    const pythonRes = await queryPythonServer({
      task: "chat",
      prompt: fullPrompt,
      language: languagePreference
    });
    if (pythonRes && pythonRes.reply) {
      return pythonRes.reply;
    }

    const key = apiKey || process.env.GEMINI_API_KEY_SUMMARY || process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (e) {
    return "AI Summary is currently unavailable.";
  }
}
