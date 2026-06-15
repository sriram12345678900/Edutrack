import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getChatResponse(messages: { role: string; content: string }[], languagePreference: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) throw new Error("API Key is missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const lastMessage = messages[messages.length - 1].content;
    const prompt = `System: You are EduTrack AI tutor for Indian Class 6-10 students. Reply in ${languagePreference} naturally. 
    
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
    const key = apiKey || process.env.GEMINI_API_KEY_SUMMARY || process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (e) {
    return "AI Summary is currently unavailable.";
  }
}
