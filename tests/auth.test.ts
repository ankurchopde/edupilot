import test from "node:test";
import assert from "node:assert/strict";
import { isSafeNextPath } from "../lib/supabase/config.ts";

test("OAuth return paths only allow local application paths", () => {
  assert.equal(isSafeNextPath("/roadmap"), true);
  assert.equal(isSafeNextPath("/roadmap?from=login"), true);
  assert.equal(isSafeNextPath("https://evil.example"), false);
  assert.equal(isSafeNextPath("//evil.example"), false);
  assert.equal(isSafeNextPath("/\\evil.example"), false);
  assert.equal(isSafeNextPath(null), false);
});
