export async function generateContent(prompt: string, useCase: "summary" | "notes" = "summary") {
  try {
    const apiKey = useCase === "notes" 
      ? process.env.OPENROUTER_API_KEY_NOTES 
      : process.env.OPENROUTER_API_KEY_SUMMARY;
    
    if (!apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://edutrack-delta-drab.vercel.app", // Optional, for OpenRouter rankings
        "X-Title": "EduTrack", // Optional, for OpenRouter rankings
      },
      body: JSON.stringify({
        model: useCase === "notes" 
          ? "mistralai/mistral-7b-instruct"  // Better JSON adherence for structured output
          : "meta-llama/llama-3.1-8b-instruct", // Fast & good for markdown summaries
        messages: useCase === "notes" 
          ? [
              { role: "system", content: "You are a JSON API. You MUST respond with ONLY valid JSON. No explanations, no markdown, no text before or after the JSON. Output raw JSON only." },
              { role: "user", content: prompt }
            ]
          : [{ role: "user", content: prompt }],
        max_tokens: 1500,
      }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(`OpenRouter Error: ${data.error?.message || "Unknown error"}`);
    }

    return data.choices[0].message.content || "";
  } catch (error: any) {
    console.error("OpenRouter Error:", error.message);
    return "AI content is currently unavailable via OpenRouter.";
  }
}
