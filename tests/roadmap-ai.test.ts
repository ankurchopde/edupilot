import test from "node:test";
import assert from "node:assert/strict";
import { curriculum } from "../lib/data.ts";
import { getAdaptiveRoadmap, type Attempt } from "../lib/learning.ts";
import { applyRoadmapAiResponse, normalizeRoadmapCache, roadmapEvidenceFingerprint, validateRoadmapAiResponse } from "../lib/roadmap-ai.ts";
import { requestRoadmapRecommendation } from "../lib/gemini.ts";

function attempt(topicId: string, correct: boolean, index: number): Attempt {
  return { questionId: `${topicId}-${index}`, topicId, topic: topicId, correct, difficulty: "Foundational", source: "diagnostic", timestamp: `2026-10-0${index + 1}T00:00:00.000Z` };
}

test("Gemini ordering is personalized but cannot move a dependent topic before its prerequisite", () => {
  const base = getAdaptiveRoadmap(curriculum, [attempt("what-is-ai", true, 0)]);
  const personalized = applyRoadmapAiResponse(base, { sequence: ["ai-systems", "what-is-ai"], recommendations: [{ topicId: "ai-systems", reason: "Your diagnostic signal supports extending the foundations next." }] });
  assert.equal(personalized.recommendedSequence[0], "what-is-ai");
  assert.equal(personalized.recommendedSequence[1], "ai-systems");
  assert.equal(personalized.topics["what-is-ai"].status, "Learning");
  assert.notEqual(personalized.topics["what-is-ai"].status, "Understanding demonstrated");
});

test("invalid Gemini topics are rejected and cannot bypass deterministic prerequisites", () => {
  const base = getAdaptiveRoadmap(curriculum, []);
  assert.equal(validateRoadmapAiResponse({ sequence: ["not-a-topic"], recommendations: [] }, base), undefined);
  const validated = validateRoadmapAiResponse({ sequence: ["data", "what-is-ai"], recommendations: [{ topicId: "data", reason: "Start with data." }] }, base);
  assert.ok(validated);
  const safe = applyRoadmapAiResponse(base, validated!);
  assert.equal(safe.recommendedNext, "what-is-ai");
});

test("a stale later-level Gemini sequence is discarded when an earlier level is incomplete", () => {
  const base = getAdaptiveRoadmap(curriculum, [attempt("what-is-ai", false, 0)]);
  const safe = applyRoadmapAiResponse(base, { sequence: ["training-deep", "language-models", "what-is-ai"], recommendations: [{ topicId: "training-deep", reason: "Old cached reason." }] });
  assert.equal(safe.recommendedNext, "what-is-ai");
  assert.ok(safe.recommendedSequence.every((topicId) => safe.topics[topicId].levelNumber === 1));
});

test("roadmap cache uses the same evidence fingerprint and malformed cache is ignored", () => {
  const evidence = [attempt("what-is-ai", false, 0)];
  const fingerprint = roadmapEvidenceFingerprint(evidence);
  assert.equal(roadmapEvidenceFingerprint(evidence), fingerprint);
  assert.equal(normalizeRoadmapCache({ version: 2, fingerprint, source: "gemini", sequence: ["what-is-ai"], reasons: { "what-is-ai": "Review the missed signal." }, generatedAt: "2026-10-01T00:00:00.000Z" })?.fingerprint, fingerprint);
  assert.equal(normalizeRoadmapCache({ fingerprint, source: "gemini", sequence: "bad", generatedAt: "now" }), undefined);
  assert.notEqual(roadmapEvidenceFingerprint([...evidence, attempt("what-is-ai", true, 1)]), fingerprint);
});

test("Gemini roadmap API failure is reported for deterministic fallback", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ available: false, fallback: true, reason: "Gemini roadmap analysis failed." }), { status: 502 });
  try {
    const result = await requestRoadmapRecommendation([]);
    assert.equal(result.available, false);
    assert.equal(result.fallback, true);
    assert.match(result.reason || "", /failed/);
  } finally { globalThis.fetch = originalFetch; }
});
