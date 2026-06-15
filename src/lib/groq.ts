import Groq from "groq-sdk";

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
  role: string;
  content: string;
  attachments?: {
    type: string;
    data: string;
    name: string;
  }[];
}

export async function getChatResponse(messages: ChatMessage[], languagePreference: string, bookInfo: string = "") {
  const isIshLanguage = languagePreference.endsWith("ish") && languagePreference !== "English";
  
  const languageInstruction = isIshLanguage
    ? `Respond in ${languagePreference}. You MUST strictly use the English alphabet (Roman script) to write words. DO NOT use native scripts (like Devanagari, Telugu, Tamil, etc.). Example: 'Science chala interesting subject. Dintlo manam atoms gurinchi chaduvutham.' Keep technical terms in English.`
    : languagePreference === "English"
    ? "Respond strictly in clear, simple English."
    : `Respond in ${languagePreference} language. Keep technical/mathematical/scientific terms in English but explain everything else in ${languagePreference}.`;

  const systemContent = `You are EduTrack AI, a friendly personal tutor for Indian students in Class 6-10 following NCERT/CBSE curriculum.
${bookInfo ? `\n\n--- CURRENT BOOK INFO ---\nThe student is currently studying: **${bookInfo}**.\nBase your answers entirely on this subject and chapter.\n--- END BOOK INFO ---\n` : ""}
${languageInstruction}
IMPORTANT: Whenever you write chemical formulas, equations, or mathematical exponents, you MUST strictly use proper Unicode subscript and superscript characters (e.g., H₂, O₂, CO₂, x², 2H₂O₂ → 2H₂O + O₂). DO NOT use plain text like "H2O" or LaTeX formatting.
Use simple analogies, examples, and step-by-step explanations. Be encouraging and concise.`;

  const geminiKey = process.env.GEMINI_API_KEY || "";

  // 1. Try Gemini first if we have an API key configured
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: systemContent
      });
      
      const formattedMessages = messages.map(m => {
        const parts: any[] = [];
        if (m.content) parts.push({ text: m.content });
        if (!m.content && m.attachments?.length) parts.push({ text: "Here are some files." });
        
        if (m.attachments) {
          m.attachments.forEach(att => {
            if (att.type.startsWith("image/")) {
              const base64Data = att.data.split(",")[1];
              parts.push({
                inlineData: {
                  mimeType: att.type,
                  data: base64Data
                }
              });
            } else {
              parts.push({ text: `\n\n[Attached Text File: ${att.name}]\n${att.data}` });
            }
          });
        }
        
        return {
          role: m.role === "user" ? "user" : "model",
          parts
        };
      });
      
      const response = await model.generateContent({ contents: formattedMessages });
      const text = response.response.text();
      if (text) return text;
    } catch (geminiErr: any) {
      console.warn("Gemini chat response failed, falling back to Groq:", geminiErr.message || geminiErr);
    }
  }

  // 2. Fallback to Groq if Gemini fails or is not configured
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error("No Groq API key configured.");
  }
  const groq = new Groq({
    apiKey: groqKey,
  });

  const hasImage = messages.some(m => m.attachments?.some(att => att.type.startsWith("image/")));
  const modelToUse = hasImage ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile";

  const formattedMessages = messages.map(m => {
    const containsImage = m.attachments?.some(att => att.type.startsWith("image/"));
    
    if (m.role === "user" && containsImage) {
      const contentParts: any[] = [];
      let textInjections = "";
      
      m.attachments?.forEach(att => {
        if (!att.type.startsWith("image/")) {
          textInjections += `\n\n[Attached File: ${att.name}]\n--- FILE CONTENT ---\n${att.data}\n--- END FILE CONTENT ---`;
        }
      });
      
      contentParts.push({
        type: "text",
        text: `${textInjections}\n\n${m.content || "Please analyze the attached image."}`
      });

      m.attachments?.forEach(att => {
        if (att.type.startsWith("image/")) {
          const imageUrl = att.data.startsWith("data:") 
            ? att.data 
            : `data:${att.type};base64,${att.data}`;
          contentParts.push({
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          });
        }
      });

      return {
        role: "user" as const,
        content: contentParts
      };
    } else {
      let textInjections = "";
      if (m.attachments) {
        m.attachments.forEach(att => {
          if (!att.type.startsWith("image/")) {
            textInjections += `\n\n[Attached File: ${att.name}]\n--- FILE CONTENT ---\n${att.data}\n--- END FILE CONTENT ---`;
          }
        });
      }
      return {
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: `${textInjections}\n\n${m.content}`
      };
    }
  });

  const response = await groq.chat.completions.create({
    model: modelToUse,
    messages: [
      {
        role: "system",
        content: systemContent
      },
      ...formattedMessages
    ],
    max_tokens: 1024,
  });

  return response.choices[0].message.content || "";
}

export async function generateContent(prompt: string) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      throw new Error("No Groq API key configured.");
    }
    const groq = new Groq({
      apiKey: groqKey,
    });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });

    return response.choices[0].message.content || "";
  } catch (e) {
    return "AI content is currently unavailable.";
  }
}
