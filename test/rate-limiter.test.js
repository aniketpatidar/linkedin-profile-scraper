import test from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "../src/profile-api.js";

test("tracks rate limits independently for each client key", () => {
  const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000, now: () => 0 });
  assert.equal(limiter.allow("client-a"), true);
  assert.equal(limiter.allow("client-a"), false);
  assert.equal(limiter.allow("client-b"), true);
});
