export interface HFMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface HFOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

const DEFAULT_MODELS = [
  "meta-llama/Llama-3.3-70B-Instruct",
  "Qwen/Qwen2.5-72B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
  "microsoft/Phi-3.5-mini-instruct",
];

/**
 * Safely parse JSON from raw LLM output, extracting from markdown code blocks if necessary.
 */
export function extractJsonFromText<T = any>(text: string): T | null {
  try {
    let clean = text.trim();
    if (clean.includes("```json")) {
      const match = clean.match(/```json\s*([\s\S]*?)\s*```/);
      if (match && match[1]) clean = match[1].trim();
    } else if (clean.includes("```")) {
      const match = clean.match(/```\s*([\s\S]*?)\s*```/);
      if (match && match[1]) clean = match[1].trim();
    }

    // Find opening '{' or '[' and closing '}' or ']'
    const firstBrace = clean.indexOf("{");
    const firstBracket = clean.indexOf("[");
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = clean.lastIndexOf("}");
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = clean.lastIndexOf("]");
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      clean = clean.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(clean);
  } catch (err) {
    return null;
  }
}

/**
 * Query Hugging Face Serverless Inference API using OpenAI-compatible chat completion format.
 */
export async function queryHuggingFace(
  messages: HFMessage[],
  options: HFOptions = {}
): Promise<string | null> {
  const apiKey =
    process.env.HUGGINGFACE_API_KEY ||
    process.env.HF_API_KEY ||
    process.env.HF_TOKEN ||
    "";

  if (!apiKey) {
    console.warn("Hugging Face API key is not configured.");
    return null;
  }

  const modelsToTry = options.model
    ? [options.model, ...DEFAULT_MODELS.filter((m) => m !== options.model)]
    : DEFAULT_MODELS;

  const timeoutMs = options.timeoutMs || 25000;

  for (const model of modelsToTry) {
    const endpoints = [
      `https://router.huggingface.co/hf-inference/v1/chat/completions`,
      `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`,
      `https://api-inference.huggingface.co/v1/chat/completions`,
    ];

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: options.temperature ?? 0.4,
            max_tokens: options.max_tokens ?? 2048,
            ...(options.jsonMode
              ? { response_format: { type: "json_object" } }
              : {}),
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.warn(`HF endpoint ${endpoint} for ${model} returned ${res.status}:`, errText.slice(0, 150));
          continue; // Try next endpoint / model
        }

        const data = await res.json();
        const content =
          data?.choices?.[0]?.message?.content ||
          data?.generated_text ||
          null;

        if (content && typeof content === "string") {
          return content;
        }
      } catch (err: any) {
        console.warn(`HF attempt failed for ${model} on ${endpoint}:`, err.message || err);
      }
    }
  }

  return null;
}
