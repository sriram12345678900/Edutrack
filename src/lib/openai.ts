import OpenAI from "openai";

export async function getChatResponse(messages: { role: string; content: string }[], languagePreference: string) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log("Calling OpenAI with Fetch...");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are EduTrack AI tutor. Support mixed-language (${languagePreference}).`
          },
          ...messages
        ],
      }),
    });

    const data = await res.json();
    console.log("OpenAI Raw Response:", JSON.stringify(data).substring(0, 200));

    if (!res.ok) {
      throw new Error(`OpenAI Error ${res.status}: ${data.error?.message || "Unknown error"}`);
    }

    return data.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Fetch OpenAI Error:", error.message);
    throw error;
  }
}

export async function generateContent(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content || "";
}

