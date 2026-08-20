/**
 * EduTrack Client Interface for Python Developed AI Server (http://localhost:5000)
 * Seamlessly connects to your locally developed Python AI server for all curriculum tasks.
 */

export interface PythonAIRequest {
  task?: "chat" | "notes" | "line-by-line" | "quiz" | "summarize" | "theory" | "plan" | "flashcards" | "solve";
  prompt?: string;
  subject?: string;
  chapter?: string;
  language?: string;
  [key: string]: any;
}

export async function queryPythonServer<T = any>(
  payload: PythonAIRequest,
  timeoutMs: number = 1500
): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch("http://localhost:5000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json();
      return data as T;
    }
  } catch (_error) {
    // Python local server is offline or timed out; seamless fallback
  }

  return null;
}
