/**
 * EduTrack Universal Local LLM & Offline AI Connector
 * 
 * Seamlessly connects to:
 * 1. Ollama (http://localhost:11434/v1 or http://localhost:11434/api/chat)
 * 2. LM Studio / vLLM / LocalAI / llama.cpp (http://localhost:1234/v1 or LOCAL_LLM_URL)
 * 3. Python PyTorch AI Server (http://localhost:5000)
 * 
 * 100% Free, Private, and Self-Sufficient with Zero External Cloud API Dependencies.
 */

export interface LocalChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LocalLLMOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

export interface LocalLLMStatus {
  available: boolean;
  provider: "ollama" | "lmstudio" | "python" | "custom" | "offline_only";
  endpoint: string;
  modelName: string;
}

// Configurable Endpoints via Environment
const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";
const LM_STUDIO_BASE = process.env.LM_STUDIO_URL || "http://localhost:1234";
const PYTHON_BASE = process.env.PYTHON_AI_URL || "http://localhost:5000";
const CUSTOM_LOCAL_URL = process.env.LOCAL_LLM_URL;
const DEFAULT_MODEL = process.env.LOCAL_LLM_MODEL || "llama3.2:3b";

/**
 * Checks which local AI provider is currently running on the user's system
 */
export async function detectLocalLLM(timeoutMs = 1000): Promise<LocalLLMStatus> {
  // 1. Custom configured endpoint
  if (CUSTOM_LOCAL_URL) {
    try {
      const res = await fetch(`${CUSTOM_LOCAL_URL}/models`, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        return {
          available: true,
          provider: "custom",
          endpoint: CUSTOM_LOCAL_URL,
          modelName: DEFAULT_MODEL,
        };
      }
    } catch {}
  }

  // 2. Check Ollama at localhost:11434
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.ok) {
      const data = await res.json();
      const models = data?.models || [];
      const modelName = models.length > 0 ? models[0].name : DEFAULT_MODEL;
      return {
        available: true,
        provider: "ollama",
        endpoint: OLLAMA_BASE,
        modelName,
      };
    }
  } catch {}

  // 3. Check LM Studio at localhost:1234
  try {
    const res = await fetch(`${LM_STUDIO_BASE}/v1/models`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.ok) {
      const data = await res.json();
      const modelName = data?.data?.[0]?.id || "local-model";
      return {
        available: true,
        provider: "lmstudio",
        endpoint: LM_STUDIO_BASE,
        modelName,
      };
    }
  } catch {}

  // 4. Check Python PyTorch Server at localhost:5000
  try {
    const res = await fetch(`${PYTHON_BASE}`, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.ok) {
      return {
        available: true,
        provider: "python",
        endpoint: PYTHON_BASE,
        modelName: "EduTrack Python PyTorch Server",
      };
    }
  } catch {}

  return {
    available: false,
    provider: "offline_only",
    endpoint: "",
    modelName: "EduTrack Built-in Offline Curriculum Engine",
  };
}

/**
 * Generate chat completion from locally running model
 */
export async function queryLocalLLM(
  messages: LocalChatMessage[],
  options: LocalLLMOptions = {}
): Promise<string | null> {
  const timeout = options.timeoutMs || 25000;
  const status = await detectLocalLLM(1200);

  if (!status.available) {
    return null;
  }

  const modelToUse = options.model || status.modelName || DEFAULT_MODEL;

  // 1. Ollama Native API
  if (status.provider === "ollama") {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${status.endpoint}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelToUse,
          messages,
          stream: false,
          format: options.jsonMode ? "json" : undefined,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.max_tokens ?? 1500,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        return data?.message?.content || null;
      }
    } catch (e: any) {
      console.warn("Ollama native query error:", e.message);
    }
  }

  // 2. OpenAI Compatible Local Endpoints (Ollama /v1, LM Studio /v1, vLLM, LocalAI)
  if (status.provider === "lmstudio" || status.provider === "custom" || status.provider === "ollama") {
    try {
      const endpointBase = status.endpoint.endsWith("/v1") ? status.endpoint : `${status.endpoint}/v1`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${endpointBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer local-key",
        },
        body: JSON.stringify({
          model: modelToUse,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1500,
          response_format: options.jsonMode ? { type: "json_object" } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch (e: any) {
      console.warn("Local OpenAI compatible endpoint error:", e.message);
    }
  }

  // 3. Python Local PyTorch Server
  if (status.provider === "python") {
    try {
      const userPrompt = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
      const systemPrompt = messages.find((m) => m.role === "system")?.content || "";

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${status.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "chat",
          prompt: userPrompt,
          systemPrompt,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        return data?.reply || null;
      }
    } catch (e: any) {
      console.warn("Python local server error:", e.message);
    }
  }

  return null;
}
