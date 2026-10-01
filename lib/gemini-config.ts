export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
export const THINKING_LEVELS = ["minimal", "low", "medium", "high"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

export type ThinkingConfig = { thinkingLevel: Uppercase<ThinkingLevel> };
export type TutorGenerationConfig = { temperature?: number; maxOutputTokens: number; responseMimeType?: string; thinkingConfig?: ThinkingConfig };

export function resolveGeminiModel(value = process.env.GEMINI_MODEL) {
  return value?.trim() || DEFAULT_GEMINI_MODEL;
}

export function normalizeThinkingLevel(value = process.env.GEMINI_THINKING_LEVEL): ThinkingLevel | undefined {
  const normalized = value?.trim().toLowerCase();
  return THINKING_LEVELS.includes(normalized as ThinkingLevel) ? normalized as ThinkingLevel : undefined;
}

export function isGemini3Model(model: string) {
  return /^gemini-3(?:\.\d+)?-/.test(model);
}

export function thinkingConfigForModel(model: string, requestedLevel = process.env.GEMINI_THINKING_LEVEL): { thinkingConfig?: ThinkingConfig; omittedReason?: string } {
  const level = normalizeThinkingLevel(requestedLevel);
  if (!level) return { omittedReason: requestedLevel ? "GEMINI_THINKING_LEVEL is not a supported value." : "Thinking configuration is not set." };
  if (!isGemini3Model(model)) return { omittedReason: "This model uses a different thinking configuration; GEMINI_THINKING_LEVEL was omitted safely." };
  return { thinkingConfig: { thinkingLevel: level.toUpperCase() as Uppercase<ThinkingLevel> } };
}

export function buildGenerationConfig(model: string, maxOutputTokens: number, responseMimeType?: string): TutorGenerationConfig {
  const config: TutorGenerationConfig = { maxOutputTokens };
  if (!isGemini3Model(model)) config.temperature = 0.4;
  if (responseMimeType) config.responseMimeType = responseMimeType;
  const thinking = thinkingConfigForModel(model);
  if (thinking.thinkingConfig) config.thinkingConfig = thinking.thinkingConfig;
  return config;
}
