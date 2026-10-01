import { curriculum } from "./data.ts";
import type { Level, Question, Topic } from "./data.ts";

export type Attempt = { questionId: string; topicId: string; topic: string; correct: boolean; difficulty: Question["difficulty"]; timestamp: string; source?: "diagnostic" | "practice"; hintUsed?: boolean; retry?: boolean };
export type TopicEvidence = { topicId: string; attempts: number; correct: number; accuracy: number; recentAccuracy: number; status: "Not assessed" | "Learning" | "Needs review" | "Developing" | "Understanding demonstrated"; reason: string };
export type RoadmapStatus = TopicEvidence["status"] | "Ready to learn" | "In progress" | "Locked" | "Recommended next";
export type AdaptiveTopic = Omit<Topic, "status"> & TopicEvidence & { levelNumber: number; prerequisiteIds: string[]; locked: boolean; roadmapStatus: RoadmapStatus; roadmapReason: string };
export type AdaptiveRoadmap = { topics: Record<string, AdaptiveTopic>; recommendedNext?: string; recommendedSequence: string[]; recommendations: Array<{ topicId: string; title: string; reason: string; action: string }> };

// These are explicit learning dependencies, not score-based guesses. Topics without an entry have no prerequisite.
export const topicPrerequisites: Record<string, string[]> = {
  "ai-systems": ["what-is-ai"], "responsible-basics": ["ai-systems"],
  data: ["what-is-ai"], statistics: ["data"], vectors: ["data"], splits: ["data"],
  "ml-core": ["data", "statistics"], "ml-methods": ["ml-core"], "model-quality": ["ml-core"], "ml-tools": ["model-quality", "data"],
  "neural-networks": ["ml-core"], "training-deep": ["neural-networks"], architectures: ["neural-networks"], adaptation: ["architectures"],
  "nlp-basics": ["ml-core"], "nlp-tasks": ["nlp-basics"], "language-models": ["nlp-basics"],
  "vision-data": ["ml-core"], "vision-tasks": ["vision-data"],
  "genai-core": ["ml-core"], "genai-eval": ["genai-core"], diffusion: ["genai-core"],
  "llm-core": ["language-models"], "llm-training": ["llm-core"], "llm-inference": ["llm-core"],
  "prompting-core": ["llm-core"], "prompting-advanced": ["prompting-core"], "prompt-eval": ["prompting-core"],
  embeddings: ["vectors"], retrieval: ["embeddings"], rag: ["retrieval", "llm-core"],
  "agent-core": ["llm-inference", "prompting-core"], "agent-reliability": ["agent-core"],
  "adaptation-strategy": ["prompting-advanced", "retrieval"], "fine-tuning": ["adaptation-strategy"],
  serving: ["ml-core"], monitoring: ["serving"], "mlops-security": ["serving", "responsible-basics"],
  fairness: ["responsible-basics"], "safety-privacy": ["responsible-basics"], provenance: ["responsible-basics"],
  "project-analysis": ["ml-core", "responsible-basics"], "project-rag": ["rag", "prompt-eval"], "project-agent": ["agent-reliability"],
  capstone: ["project-analysis", "project-rag", "project-agent"],
};

export function selectQuestions(bank: Question[], count: number, seen: string[] = [], seed = Date.now()): Question[] {
  const shuffled = [...bank].sort((a, b) => hash(`${a.id}-${seed}`) - hash(`${b.id}-${seed}`));
  const unseen = shuffled.filter((q) => !seen.includes(q.id));
  return [...unseen, ...shuffled.filter((q) => seen.includes(q.id))].slice(0, Math.min(count, bank.length));
}

function hash(value: string) { let h = 0; for (let i = 0; i < value.length; i++) h = (h << 5) - h + value.charCodeAt(i) | 0; return Math.abs(h); }

export function evidenceFor(topicId: string, attempts: Attempt[]): TopicEvidence {
  const rows = attempts.filter((a) => a.topicId === topicId);
  const correct = rows.filter((a) => a.correct).length;
  const accuracy = rows.length ? Math.round((correct / rows.length) * 100) : 0;
  const recent = rows.slice(-3);
  const recentAccuracy = recent.length ? Math.round((recent.filter((a) => a.correct).length / recent.length) * 100) : 0;
  let status: TopicEvidence["status"] = "Not assessed";
  let reason = "No practice evidence yet.";
  if (rows.length) {
    if (rows.length >= 3 && accuracy >= 80) { status = "Understanding demonstrated"; reason = `${correct} of ${rows.length} recorded attempts were correct.`; }
    else if (accuracy < 50) { status = "Needs review"; reason = `${correct} of ${rows.length} attempts were correct; revisit the concept and try a simpler example.`; }
    else if (rows.length >= 2 && accuracy >= 65) { status = "Developing"; reason = `Performance is promising across ${rows.length} attempts; another context will confirm it.`; }
    else { status = "Learning"; reason = `${rows.length} attempt${rows.length === 1 ? "" : "s"} recorded; more evidence is needed.`; }
  }
  return { topicId, attempts: rows.length, correct, accuracy, recentAccuracy, status, reason };
}

function statusPriority(status: TopicEvidence["status"]) {
  return status === "Needs review" ? 0 : status === "Learning" ? 1 : status === "Not assessed" ? 2 : status === "Developing" ? 3 : 4;
}

function adaptivePriority(topic: AdaptiveTopic) {
  // A clean first-pass diagnostic signal can unlock forward movement without treating one answer as mastery.
  if (topic.status === "Learning" && topic.attempts === 1 && topic.accuracy === 100) return 2;
  if (topic.status === "Developing" && topic.attempts >= 2 && topic.recentAccuracy < 50) return 1;
  return statusPriority(topic.status);
}

function prerequisiteBlockers(prerequisiteIds: string[], evidence: Record<string, TopicEvidence>) {
  return prerequisiteIds.map((id) => evidence[id]).filter((item) => item && (item.status === "Needs review" || item.status === "Not assessed"));
}

function earliestIncompleteLevel(levels: Level[], evidence: Record<string, TopicEvidence>) {
  return levels.find((level) => level.topics.some((topic) => evidence[topic.id]?.status !== "Understanding demonstrated"))?.number;
}

export function diagnosticPlacementLevel(levels: Level[], attempts: Attempt[]) {
  const diagnostic = attempts.filter((attempt) => attempt.source === "diagnostic");
  let completedLevel = 0;
  for (const level of levels) {
    const complete = level.topics.every((topic) => {
      const rows = diagnostic.filter((attempt) => attempt.topicId === topic.id);
      return rows.length > 0 && rows.every((attempt) => attempt.correct);
    });
    if (!complete) break;
    completedLevel = level.number;
  }
  return completedLevel;
}

function recommendationReason(topic: AdaptiveTopic) {
  if (topic.status === "Needs review") return `Recommended because your practice accuracy is ${topic.accuracy}% (${topic.correct} of ${topic.attempts} attempts). Review this before advancing.`;
  if (topic.status === "Learning") return `Recommended because you have ${topic.attempts} recorded attempt${topic.attempts === 1 ? "" : "s"} at ${topic.accuracy}% accuracy; another context will make the evidence more consistent.`;
  if (topic.status === "Not assessed") return topic.prerequisiteIds.length ? "Ready to learn because its prerequisites do not currently need review." : "Ready to learn because this topic has no prerequisite and no evidence has been recorded yet.";
  if (topic.status === "Developing" && topic.recentAccuracy < 50) return `Recommended because recent performance is ${topic.recentAccuracy}% across the latest attempts, even though lifetime accuracy is ${topic.accuracy}%. Review before moving on.`;
  if (topic.status === "Developing") return `Ready to continue because ${topic.correct} of ${topic.attempts} attempts were correct, but more varied evidence can strengthen the signal.`;
  return `Understanding demonstrated from ${topic.correct} of ${topic.attempts} recorded attempts.`;
}

export function getAdaptiveRoadmap(levels: Level[], attempts: Attempt[]): AdaptiveRoadmap {
  const allTopics = levels.flatMap((level) => level.topics.map((topic) => ({ topic, levelNumber: level.number })));
  const evidence = Object.fromEntries(allTopics.map(({ topic }) => [topic.id, evidenceFor(topic.id, attempts)]));
  const topics: Record<string, AdaptiveTopic> = {};
  for (const { topic, levelNumber } of allTopics) {
    const prerequisiteIds = topicPrerequisites[topic.id] || [];
    const blockers = prerequisiteBlockers(prerequisiteIds, evidence);
    const locked = blockers.length > 0;
    const base = evidence[topic.id];
    const roadmapStatus: RoadmapStatus = locked ? "Locked" : base.status === "Learning" ? "In progress" : base.status;
    const blocker = blockers[0];
    const roadmapReason = blocker ? blocker.status === "Needs review" ? `Locked until prerequisite ${blocker.topicId} is reviewed; its current accuracy is ${blocker.accuracy}%.` : `Locked until there is enough evidence for prerequisite ${blocker.topicId}.` : recommendationReason({ ...topic, ...base, levelNumber, prerequisiteIds, locked, roadmapStatus, roadmapReason: "" });
    topics[topic.id] = { ...topic, ...base, levelNumber, prerequisiteIds, locked, roadmapStatus, roadmapReason };
  }
  const currentLevel = earliestIncompleteLevel(levels, evidence);
  const available = Object.values(topics).filter((topic) => {
    if (topic.locked || topic.status === "Understanding demonstrated") return false;
    // Keep the learner on the earliest incomplete curriculum level. A clean diagnostic can inform status,
    // but one answer does not complete a level or authorize a jump to a later level.
    if (currentLevel !== undefined && topic.levelNumber !== currentLevel) return false;
    return true;
  });
  const ordered = available.sort((a, b) => adaptivePriority(a) - adaptivePriority(b) || a.levelNumber - b.levelNumber || a.title.localeCompare(b.title));
  const recommendedNext = ordered[0]?.topicId;
  if (recommendedNext) topics[recommendedNext].roadmapStatus = "Recommended next";
  const recommendations = ordered.slice(0, 3).map((topic) => ({ topicId: topic.topicId, title: topic.title, reason: topic.roadmapReason, action: topic.status === "Needs review" || (topic.status === "Developing" && topic.recentAccuracy < 50) ? "Review concept" : topic.status === "Not assessed" ? "Start topic" : "Continue practice" }));
  return { topics, recommendedNext, recommendedSequence: ordered.slice(0, 8).map((topic) => topic.topicId), recommendations };
}

export function getRecommendations(attempts: Attempt[], topicNames: Record<string, string>) {
  return getAdaptiveRoadmap(curriculum, attempts).recommendations.map((recommendation) => ({ ...recommendation, title: topicNames[recommendation.topicId] || recommendation.title }));
}

export function summarizeAttempts(attempts: Attempt[]) {
  const days = new Set(attempts.map((a) => a.timestamp.slice(0, 10)));
  const correct = attempts.filter((a) => a.correct).length;
  const recent = attempts.slice(-7);
  return { total: attempts.length, correct, accuracy: attempts.length ? Math.round(correct / attempts.length * 100) : 0, activeDays: days.size, recentAccuracy: recent.length ? Math.round(recent.filter((a) => a.correct).length / recent.length * 100) : 0 };
}

export function nextDifficulty(attempts: Attempt[], topicId: string): Question["difficulty"] {
  const recent = attempts.filter((a) => a.topicId === topicId).slice(-3);
  if (recent.length >= 2 && recent.every((a) => a.correct)) return "Applied";
  if (recent.length && recent.filter((a) => a.correct).length === 0) return "Foundational";
  return "Developing";
}

export function consistencyCalendar(attempts: Attempt[], days = 28) {
  const counts = new Map<string, number>();
  attempts.forEach((attempt) => { const day = attempt.timestamp.slice(0, 10); counts.set(day, (counts.get(day) || 0) + 1); });
  const result: { date: string; count: number; level: 0 | 1 | 2 | 3 }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today); date.setHours(12, 0, 0, 0); date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10); const count = counts.get(key) || 0;
    result.push({ date: key, count, level: count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3 });
  }
  return result;
}

export function consistencyMetrics(attempts: Attempt[]) {
  const calendar = consistencyCalendar(attempts, 28);
  let currentStreak = 0;
  for (let i = calendar.length - 1; i >= 0 && calendar[i].count > 0; i -= 1) currentStreak += 1;
  const weekly = [0, 1, 2, 3].map((week) => calendar.slice(week * 7, week * 7 + 7).reduce((sum, day) => sum + day.count, 0));
  return { activeDays: calendar.filter((day) => day.count > 0).length, currentStreak, weekly, calendar };
}

export function moduleUnderstanding(levels: Level[], attempts: Attempt[]) {
  return levels.map((level) => {
    const topics = level.topics.map((topic) => evidenceFor(topic.id, attempts));
    const assessed = topics.filter((topic) => topic.attempts > 0);
    const demonstrated = topics.filter((topic) => topic.status === "Understanding demonstrated").length;
    return { id: level.id, number: level.number, title: level.title, assessed: assessed.length, total: topics.length, demonstrated, accuracy: assessed.length ? Math.round(assessed.reduce((sum, topic) => sum + topic.accuracy, 0) / assessed.length) : 0 };
  });
}
