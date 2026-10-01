import type { AdaptiveRoadmap, Attempt } from "./learning";

export type RoadmapAiItem = { topicId: string; reason: string };
export type RoadmapAiResponse = { sequence: string[]; recommendations: RoadmapAiItem[] };
export type RoadmapCache = { version: 2; fingerprint: string; source: "gemini" | "deterministic"; sequence: string[]; reasons: Record<string, string>; generatedAt: string; error?: string };

function hash(value: string) { let result = 2166136261; for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619); return (result >>> 0).toString(16); }

export function roadmapEvidenceFingerprint(attempts: Attempt[]) {
  return hash(JSON.stringify(attempts.map((attempt) => ({ questionId: attempt.questionId, topicId: attempt.topicId, correct: attempt.correct, source: attempt.source || "unknown", timestamp: attempt.timestamp }))));
}

export function normalizeRoadmapCache(value: unknown): RoadmapCache | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const item = value as Record<string, unknown>;
  if (item.version !== 2 || typeof item.fingerprint !== "string" || (item.source !== "gemini" && item.source !== "deterministic") || !Array.isArray(item.sequence) || typeof item.generatedAt !== "string") return undefined;
  const sequence = item.sequence.filter((topicId): topicId is string => typeof topicId === "string").slice(0, 20);
  const reasons = typeof item.reasons === "object" && item.reasons !== null ? Object.fromEntries(Object.entries(item.reasons).filter((entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string").map(([id, reason]) => [id, reason.slice(0, 360)])) : {};
  return { version: 2, fingerprint: item.fingerprint.slice(0, 32), source: item.source, sequence, reasons, generatedAt: item.generatedAt, error: typeof item.error === "string" ? item.error.slice(0, 240) : undefined };
}

export function normalizeRoadmapAttempts(value: unknown): Attempt[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null).flatMap((item) => {
    if (typeof item.questionId !== "string" || typeof item.topicId !== "string" || typeof item.topic !== "string" || typeof item.correct !== "boolean" || typeof item.timestamp !== "string") return [];
    const difficulty = item.difficulty === "Foundational" || item.difficulty === "Developing" || item.difficulty === "Applied" ? item.difficulty : "Foundational";
    const source = item.source === "diagnostic" || item.source === "practice" ? item.source : undefined;
    return [{ questionId: item.questionId.slice(0, 100), topicId: item.topicId.slice(0, 100), topic: item.topic.slice(0, 160), correct: item.correct, difficulty, source, timestamp: item.timestamp.slice(0, 40) } satisfies Attempt];
  }).slice(-120);
}

export function validateRoadmapAiResponse(value: unknown, roadmap: AdaptiveRoadmap): RoadmapAiResponse | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const item = value as Record<string, unknown>;
  const validIds = new Set(Object.keys(roadmap.topics));
  const sequence = Array.isArray(item.sequence) ? item.sequence.filter((id): id is string => typeof id === "string" && validIds.has(id)).slice(0, 20) : [];
  const recommendations = Array.isArray(item.recommendations) ? item.recommendations.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const recommendation = entry as Record<string, unknown>;
    return typeof recommendation.topicId === "string" && validIds.has(recommendation.topicId) && typeof recommendation.reason === "string" && recommendation.reason.trim() ? [{ topicId: recommendation.topicId, reason: recommendation.reason.trim().slice(0, 360) }] : [];
  }).slice(0, 8) : [];
  return sequence.length || recommendations.length ? { sequence: [...new Set(sequence)], recommendations } : undefined;
}

function prerequisiteOrder(ids: string[], roadmap: AdaptiveRoadmap) {
  const unique = [...new Set(ids)];
  const rank = new Map(unique.map((id, index) => [id, index]));
  return unique.sort((left, right) => {
    const leftTopic = roadmap.topics[left]; const rightTopic = roadmap.topics[right];
    const leftNeedsPrerequisite = leftTopic.prerequisiteIds.some((id) => rank.has(id) && roadmap.topics[id]?.status !== "Understanding demonstrated");
    const rightNeedsPrerequisite = rightTopic.prerequisiteIds.some((id) => rank.has(id) && roadmap.topics[id]?.status !== "Understanding demonstrated");
    if (leftNeedsPrerequisite !== rightNeedsPrerequisite) return leftNeedsPrerequisite ? 1 : -1;
    for (const prerequisite of leftTopic.prerequisiteIds) if (rank.has(prerequisite) && rank.get(prerequisite)! > rank.get(left)!) return -1;
    for (const prerequisite of rightTopic.prerequisiteIds) if (rank.has(prerequisite) && rank.get(prerequisite)! > rank.get(right)!) return 1;
    return rank.get(left)! - rank.get(right)!;
  });
}

export function applyRoadmapAiResponse(roadmap: AdaptiveRoadmap, response: RoadmapAiResponse) {
  const unfinished = Object.values(roadmap.topics).filter((topic) => topic.status !== "Understanding demonstrated");
  const currentLevel = unfinished.length ? Math.min(...unfinished.map((topic) => topic.levelNumber)) : undefined;
  const eligible = unfinished.filter((topic) => !topic.locked && (currentLevel === undefined || topic.levelNumber === currentLevel));
  const eligibleIds = new Set(eligible.map((topic) => topic.topicId));
  const aiIds = response.sequence.filter((id) => eligibleIds.has(id));
  const ordered = prerequisiteOrder([...aiIds, ...roadmap.recommendedSequence.filter((id) => !aiIds.includes(id) && eligibleIds.has(id))], roadmap);
  const reasons = new Map(response.recommendations.filter((item) => eligibleIds.has(item.topicId)).map((item) => [item.topicId, item.reason]));
  const topics = { ...roadmap.topics };
  const recommendations = ordered.slice(0, 3).map((topicId) => {
    const topic = topics[topicId];
    return { topicId, title: topic.title, reason: reasons.get(topicId) || topic.roadmapReason, action: topic.status === "Needs review" ? "Review concept" : topic.status === "Not assessed" ? "Start topic" : "Continue practice" };
  });
  if (ordered[0]) topics[ordered[0]].roadmapStatus = "Recommended next";
  for (const topicId of ordered) if (reasons.has(topicId)) topics[topicId].roadmapReason = reasons.get(topicId)!;
  return { ...roadmap, topics, recommendedNext: ordered[0] || roadmap.recommendedNext, recommendedSequence: ordered, recommendations };
}

export function buildRoadmapPrompt(attempts: Attempt[], roadmap: AdaptiveRoadmap) {
  const evidence = Object.values(roadmap.topics).map((topic) => `${topic.topicId}|${topic.title}|status=${topic.status}|attempts=${topic.attempts}|correct=${topic.correct}|accuracy=${topic.accuracy}|recent=${topic.recentAccuracy}|locked=${topic.locked}|prereqs=${topic.prerequisiteIds.join(",")}`).join("\n");
  const recentAttempts = attempts.slice(-80).map((attempt) => `${attempt.topicId}|${attempt.source || "unknown"}|${attempt.correct ? "correct" : "incorrect"}|${attempt.questionId}`).join("\n");
  return `You are the EduPilot roadmap recommender. Use only the supplied recorded evidence. Do not score answers, change mastery statuses, invent explanations, or claim a topic is mastered. Follow the existing curriculum progression: recommend only from the earliest incomplete level represented in the supplied available sequence; never jump directly to a middle or final level while an earlier level has a weak, new, or insufficiently evidenced topic. Respect prerequisites: do not put a dependent topic before an unmet prerequisite. Prioritize review when evidence shows difficulty and otherwise choose the next learning opportunity. Return only JSON: {"sequence":[topicId strings],"recommendations":[{"topicId":"...","reason":"one concise evidence-based reason"}]}. Use only topic IDs from the evidence.\nTOPIC EVIDENCE:\n${evidence}\nRECENT RECORDED ATTEMPTS:\n${recentAttempts || "none"}\nThe deterministic available sequence is already curriculum-gated; preserve that gate.`;
}
