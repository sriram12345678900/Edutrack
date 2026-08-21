import { GoogleGenerativeAI } from "@google/generative-ai";
import { queryPythonServer } from "./python-ai";

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
    const prompt = `System: You are EduTrack AI tutor for Indian Class 6-10 students following CBSE NCERT curriculum. ${contextLine} Reply in ${languagePreference} naturally and accurately with step-by-step clarity. 
    
    Student Question: ${lastMessage}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini SDK Error:", error.message);
    throw error;
  }
}

export async function generateContent(prompt: string, apiKey?: string) {
  try {
    // 1. Try Python Developed Local AI Server First
    const pythonRes = await queryPythonServer({
      task: "chat",
      prompt
    });
    if (pythonRes && pythonRes.reply) {
      return pythonRes.reply;
    }

    const key = apiKey || process.env.GEMINI_API_KEY_SUMMARY || process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (e) {
    return "AI Summary is currently unavailable.";
  }
}
