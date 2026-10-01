import type { ChatMessage, LearnerContext, LessonContext } from "./tutor-chat";
import type { AdaptiveRoadmap, Attempt } from "./learning";

export type TutorMode = "explanation" | "hint" | "question" | "insight" | "recommendation";
export type TutorQuestion = { question: string; choices: string[]; answer: number; explanation: string; topic: string; difficulty: string; misconceptionTags?: string[] };
export type TutorResponse = { available: boolean; fallback?: boolean; reason?: string; text?: string; question?: TutorQuestion };

export async function requestTutor(mode: TutorMode, context: Record<string, unknown>): Promise<TutorResponse> {
  try {
    const response = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, context }) });
    const data = await response.json();
    return data as TutorResponse;
  } catch { return { available: false, fallback: true, reason: "Tutor service unavailable." }; }
}

export async function requestTutorChat(messages: ChatMessage[], lessonContext?: LessonContext, learnerContext?: LearnerContext): Promise<TutorResponse> {
  try {
    const response = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "chat", context: { messages, lessonContext, learnerContext } }) });
    const data = await response.json();
    return data as TutorResponse;
  } catch { return { available: false, fallback: true, reason: "Tutor service unavailable." }; }
}

export async function requestRoadmapRecommendation(attempts: Attempt[]): Promise<{ available: boolean; fallback?: boolean; reason?: string; roadmap?: AdaptiveRoadmap }> {
  try {
    const response = await fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "roadmap", context: { attempts } }) });
    const data = await response.json();
    return data as { available: boolean; fallback?: boolean; reason?: string; roadmap?: AdaptiveRoadmap };
  } catch { return { available: false, fallback: true, reason: "Gemini roadmap service unavailable." }; }
}
