import test from "node:test";
import assert from "node:assert/strict";
import { generateGeminiText } from "../lib/gemini-server.ts";
import { MAX_CHAT_MESSAGES, TUTOR_SYSTEM_INSTRUCTION, buildTutorSystemInstruction, validateChatRequest, normalizeChatMessages, type ChatMessage } from "../lib/tutor-chat.ts";
import { buildGenerationConfig, DEFAULT_GEMINI_MODEL, resolveGeminiModel, thinkingConfigForModel } from "../lib/gemini-config.ts";
import { markdownToBlocks } from "../lib/markdown-parser.ts";

function message(index: number, content = `question ${index}`): ChatMessage { return { id: `m-${index}`, role: index % 2 ? "assistant" : "user", content, createdAt: new Date(0).toISOString() }; }

test("chat history is bounded to the most recent messages and input budget", () => {
  const history = Array.from({ length: MAX_CHAT_MESSAGES + 8 }, (_, index) => message(index, "x".repeat(1200)));
  const bounded = normalizeChatMessages(history);
  assert.ok(bounded.length <= MAX_CHAT_MESSAGES);
  assert.ok(bounded.length < history.length);
  assert.equal(bounded.at(-1)?.id, `m-${MAX_CHAT_MESSAGES + 7}`);
  assert.ok(bounded.reduce((sum, item) => sum + item.content.length, 0) <= 12000);
});

test("chat request validation requires a final user message and bounds lesson context", () => {
  assert.deepEqual(validateChatRequest({ messages: [] }), { error: "A user message is required." });
  assert.deepEqual(validateChatRequest({ messages: [{ role: "user", content: "x".repeat(1601) }] }), { error: "Message is too long." });
  const valid = validateChatRequest({ messages: [message(0, "What is a feature?")], lessonContext: { topic: "data".repeat(100), lessonTitle: "Dataset basics", objective: "x".repeat(2000) } });
  assert.ok("messages" in valid);
  if ("messages" in valid) {
    assert.equal(valid.messages[0].role, "user");
    assert.ok((valid.lessonContext?.topic.length || 0) <= 160);
    assert.ok((valid.lessonContext?.objective?.length || 0) <= 1200);
  }
});

test("Markdown blocks preserve readable quiz, list, code, and math structure", () => {
  const blocks = markdownToBlocks("### Practice\n\n**Question**\nWhat is $x^2$?\n\n**Your turn**\nExplain it.\n\n1. Start here\n2. Check your work\n\n```js\nconst answer = 4;\n```\n\n$$\nx^2 + y^2\n$$");
  assert.deepEqual(blocks.map((block) => block.kind), ["heading", "label", "paragraph", "label", "paragraph", "ordered-list", "code", "math"]);
  assert.equal(blocks[1].kind === "label" ? blocks[1].content : "", "Question");
  assert.equal(blocks[6].kind === "code" ? blocks[6].language : "", "js");
});

test("Tutor formatting instruction handles quizzes and missing progress safely", () => {
  assert.match(TUTOR_SYSTEM_INSTRUCTION, /\*\*Question\*\*/);
  assert.match(TUTOR_SYSTEM_INSTRUCTION, /\*\*Your turn\*\*/);
  assert.match(TUTOR_SYSTEM_INSTRUCTION, /never pretend to know progress/i);
  assert.match(buildTutorSystemInstruction(), /Do not reveal the answer/i);
});

test("model defaults and thinking configuration are model-aware", () => {
  assert.equal(resolveGeminiModel(""), DEFAULT_GEMINI_MODEL);
  assert.deepEqual(thinkingConfigForModel("gemini-3.5-flash-lite", "low"), { thinkingConfig: { thinkingLevel: "LOW" } });
  const legacy = thinkingConfigForModel("gemini-2.5-flash", "low");
  assert.equal(legacy.thinkingConfig, undefined);
  assert.match(legacy.omittedReason || "", /different thinking configuration/i);
  assert.deepEqual(buildGenerationConfig("gemini-3.5-flash-lite", 700), { maxOutputTokens: 700 });
});

test("Gemini errors become a safe error result", async () => {
  const result = await generateGeminiText("test-key", "gemini-test", { systemInstruction: { parts: [{ text: "tutor" }] }, contents: [{ role: "user", parts: [{ text: "hello" }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 10 } }, async () => new Response("{}", { status: 503 }));
  assert.deepEqual(result, { ok: false, reason: "Gemini is temporarily unavailable. Please try again shortly." });
});

test("a valid mocked Gemini response is returned as text", async () => {
  const result = await generateGeminiText("test-key", "gemini-test", { systemInstruction: { parts: [{ text: "tutor" }] }, contents: [{ role: "user", parts: [{ text: "hello" }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 10 } }, async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "A feature is an input signal." }] } }] }), { status: 200, headers: { "content-type": "application/json" } }));
  assert.deepEqual(result, { ok: true, text: "A feature is an input signal." });
});

test("malformed Gemini content is rejected safely", async () => {
  const result = await generateGeminiText("test-key", "gemini-test", { systemInstruction: { parts: [{ text: "tutor" }] }, contents: [{ role: "user", parts: [{ text: "hello" }] }], generationConfig: { maxOutputTokens: 10 } }, async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{}] } }] }), { status: 200 }));
  assert.deepEqual(result, { ok: false, reason: "Gemini returned no usable content." });
});
