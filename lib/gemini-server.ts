type GeminiPayload = { systemInstruction: { parts: [{ text: string }] }; contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }>; generationConfig: { temperature?: number; maxOutputTokens: number; responseMimeType?: string; thinkingConfig?: { thinkingLevel: string } } };
type GeminiResult = { ok: true; text: string } | { ok: false; reason: string };

export async function generateGeminiText(apiKey: string, model: string, payload: GeminiPayload, fetcher: typeof fetch = fetch): Promise<GeminiResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify(payload), cache: "no-store", signal: controller.signal });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) return { ok: false, reason: "Gemini rejected the API key. Check that the key is valid and restricted to the Gemini API." };
      if (response.status === 404) return { ok: false, reason: `Gemini model not found: ${model}. For a new project, try GEMINI_MODEL=gemini-3.5-flash-lite.` };
      if (response.status === 429) return { ok: false, reason: "Gemini quota or rate limit reached. Check the Google AI Studio project quota." };
      if (response.status >= 500) return { ok: false, reason: "Gemini is temporarily unavailable. Please try again shortly." };
      return { ok: false, reason: `Gemini rejected the request (HTTP ${response.status}).` };
    }
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) return { ok: false, reason: "Gemini returned an invalid response." };
    const candidates = (data as { candidates?: unknown }).candidates;
    const candidate = Array.isArray(candidates) ? candidates[0] : undefined;
    const parts = candidate && typeof candidate === "object" && candidate !== null && "content" in candidate ? (candidate as { content?: { parts?: unknown } }).content?.parts : undefined;
    const first = Array.isArray(parts) ? parts[0] : undefined;
    const output = first && typeof first === "object" && first !== null && "text" in first ? (first as { text?: unknown }).text : undefined;
    return typeof output === "string" && output.trim() ? { ok: true, text: output.trim().slice(0, 4000) } : { ok: false, reason: "Gemini returned no usable content." };
  } catch (error) { return { ok: false, reason: error instanceof DOMException && error.name === "AbortError" ? "Gemini took too long to respond. Please try again." : "The server could not reach Gemini. Check the server's internet connection and try again." }; }
  finally { clearTimeout(timeout); }
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}
