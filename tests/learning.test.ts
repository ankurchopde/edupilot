import test from "node:test";
import assert from "node:assert/strict";
import { curriculum } from "../lib/data.ts";
import { diagnosticPlacementLevel, getAdaptiveRoadmap, type Attempt } from "../lib/learning.ts";

function attemptsFor(topicId: string, correct: boolean, count: number): Attempt[] {
  return Array.from({ length: count }, (_, index) => ({ questionId: `${topicId}-${index}`, topicId, topic: topicId, correct, difficulty: "Foundational", timestamp: `2026-10-0${index + 1}T00:00:00.000Z` }));
}

test("different evidence produces different next recommendations", () => {
  const struggling = getAdaptiveRoadmap(curriculum, attemptsFor("what-is-ai", false, 1));
  const strong = getAdaptiveRoadmap(curriculum, attemptsFor("what-is-ai", true, 3));
  assert.equal(struggling.recommendedNext, "what-is-ai");
  assert.equal(struggling.topics["what-is-ai"].roadmapStatus, "Recommended next");
  assert.equal(strong.recommendedNext, "ai-systems");
  assert.notDeepEqual(struggling.recommendedSequence, strong.recommendedSequence);
});

test("a perfect first-pass signal moves the recommendation forward without claiming mastery", () => {
  const roadmap = getAdaptiveRoadmap(curriculum, attemptsFor("what-is-ai", true, 1));
  assert.equal(roadmap.topics["what-is-ai"].status, "Learning");
  assert.equal(roadmap.recommendedNext, "ai-systems");
  assert.equal(roadmap.topics["ai-systems"].roadmapStatus, "Recommended next");
});

test("a clean diagnostic still keeps the learner in the earliest incomplete level", () => {
  const diagnostic = [
    { questionId: "q1", topicId: "what-is-ai", topic: "AI Foundations", correct: true, difficulty: "Foundational" as const, source: "diagnostic" as const, timestamp: "2026-10-01T00:00:00.000Z" },
    { questionId: "q26", topicId: "ai-systems", topic: "AI Foundations", correct: true, difficulty: "Foundational" as const, source: "diagnostic" as const, timestamp: "2026-10-01T00:01:00.000Z" },
    { questionId: "q27", topicId: "responsible-basics", topic: "AI Foundations", correct: true, difficulty: "Developing" as const, source: "diagnostic" as const, timestamp: "2026-10-01T00:02:00.000Z" },
  ];
  const roadmap = getAdaptiveRoadmap(curriculum, diagnostic);
  assert.equal(diagnosticPlacementLevel(curriculum, diagnostic), 1);
  assert.equal(roadmap.recommendedNext, "ai-systems");
  assert.equal(roadmap.topics["what-is-ai"].status, "Learning");
  assert.notEqual(roadmap.topics.data.roadmapStatus, "Recommended next");
});

test("a weak prerequisite is prioritized and dependent material is locked", () => {
  const roadmap = getAdaptiveRoadmap(curriculum, attemptsFor("what-is-ai", false, 2));
  assert.equal(roadmap.recommendedNext, "what-is-ai");
  assert.equal(roadmap.topics["ai-systems"].roadmapStatus, "Locked");
  assert.match(roadmap.topics["ai-systems"].roadmapReason, /prerequisite/i);
});

test("strong repeated evidence allows progression to the next prerequisite-ready topic", () => {
  const roadmap = getAdaptiveRoadmap(curriculum, [...attemptsFor("what-is-ai", true, 3), ...attemptsFor("ai-systems", true, 3)]);
  assert.equal(roadmap.topics["what-is-ai"].status, "Understanding demonstrated");
  assert.equal(roadmap.topics["ai-systems"].status, "Understanding demonstrated");
  assert.equal(roadmap.recommendedNext, "responsible-basics");
  assert.equal(roadmap.topics["responsible-basics"].roadmapStatus, "Recommended next");
});

test("insufficient evidence remains Not assessed and is not mislabeled as weak", () => {
  const roadmap = getAdaptiveRoadmap(curriculum, []);
  assert.equal(roadmap.topics.data.status, "Not assessed");
  assert.equal(roadmap.topics.data.accuracy, 0);
  assert.equal(roadmap.topics.data.roadmapStatus, "Locked");
  assert.doesNotMatch(roadmap.topics.data.roadmapReason, /weak|low accuracy/i);
});

test("new attempts recalculate the recommendation", () => {
  const before = getAdaptiveRoadmap(curriculum, attemptsFor("what-is-ai", false, 1));
  const after = getAdaptiveRoadmap(curriculum, [...attemptsFor("what-is-ai", false, 1), ...attemptsFor("what-is-ai", true, 4)]);
  assert.equal(before.recommendedNext, "what-is-ai");
  assert.equal(after.recommendedNext, "ai-systems");
});

test("recent performance can raise a developing topic without rewriting its lifetime status", () => {
  const attempts = [true, true, true, true, false, false].map((correct, index) => ({ questionId: `recent-${index}`, topicId: "what-is-ai", topic: "AI Foundations", correct, difficulty: "Foundational" as const, timestamp: `2026-10-1${index}T00:00:00.000Z` }));
  const roadmap = getAdaptiveRoadmap(curriculum, attempts);
  assert.equal(roadmap.topics["what-is-ai"].status, "Developing");
  assert.equal(roadmap.topics["what-is-ai"].recentAccuracy, 33);
  assert.equal(roadmap.recommendedNext, "what-is-ai");
  assert.match(roadmap.topics["what-is-ai"].roadmapReason, /recent performance/i);
});

test("identical evidence produces a deterministic sequence and prerequisites are respected", () => {
  const evidence = [...attemptsFor("what-is-ai", true, 3), ...attemptsFor("ai-systems", true, 3)];
  const first = getAdaptiveRoadmap(curriculum, evidence);
  const second = getAdaptiveRoadmap(curriculum, evidence);
  assert.deepEqual(first.recommendedSequence, second.recommendedSequence);
  const index = new Map(first.recommendedSequence.map((id, position) => [id, position]));
  assert.ok((index.get("responsible-basics") ?? 0) >= (index.get("ai-systems") ?? 0));
});
