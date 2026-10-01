import test from "node:test";
import assert from "node:assert/strict";
import { validateJsonApiRequest } from "../lib/api-security.ts";

test("API metadata validation rejects unsupported methods and content types", () => {
  assert.deepEqual(validateJsonApiRequest(new Request("http://localhost/api/gemini", { method: "GET" })), { status: 405, error: "Method not allowed.", allow: "POST" });
  assert.equal(validateJsonApiRequest(new Request("http://localhost/api/gemini", { method: "POST", body: "{}", headers: { "content-type": "text/plain" } }))?.status, 415);
});

test("API metadata validation rejects cross-origin and oversized requests", () => {
  assert.equal(validateJsonApiRequest(new Request("http://localhost/api/gemini", { method: "POST", body: "{}", headers: { "content-type": "application/json", origin: "https://attacker.example" } }))?.status, 403);
  assert.equal(validateJsonApiRequest(new Request("http://localhost/api/gemini", { method: "POST", body: "{}", headers: { "content-type": "application/json", referer: "https://attacker.example/page" } }))?.status, 403);
  assert.equal(validateJsonApiRequest(new Request("http://localhost/api/gemini", { method: "POST", body: "{}", headers: { "content-type": "application/json", "sec-fetch-site": "cross-site" } }))?.status, 403);
  assert.equal(validateJsonApiRequest(new Request("http://localhost/api/gemini", { method: "POST", body: "{}", headers: { "content-type": "application/json" } })), undefined);
  assert.equal(validateJsonApiRequest(new Request("http://localhost/api/gemini", { method: "POST", body: "{}", headers: { "content-type": "application/json", "sec-fetch-site": "none" } })), undefined);
  assert.equal(validateJsonApiRequest(new Request("http://localhost/api/gemini", { method: "POST", body: "{}", headers: { "content-type": "application/json", "content-length": "50000" } }), 1000)?.status, 413);
});
