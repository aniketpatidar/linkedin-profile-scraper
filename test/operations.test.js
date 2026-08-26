import test from "node:test";
import assert from "node:assert/strict";
import { createProfileWorker, createRateLimiter } from "../src/profile-api.js";

function request() {
  return new Request("https://api.example/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://www.linkedin.com/in/example" }),
  });
}

test("limits anonymous requests and emits metadata-only logs", async () => {
  let currentTime = 0;
  const logs = [];
  const worker = createProfileWorker(
    async () => ({ identity: { name: "Ada" }, source: "fixture" }),
    {
      rateLimiter: createRateLimiter({
        maxRequests: 1,
        windowMs: 1000,
        now: () => currentTime,
      }),
      logger: (event) => logs.push(event),
    },
  );

  assert.equal((await worker.fetch(request())).status, 200);
  assert.equal((await worker.fetch(request())).status, 429);
  assert.equal(logs.length, 2);
  assert.deepEqual(Object.keys(logs[0]).sort(), [
    "durationMs",
    "event",
    "method",
    "requestId",
    "route",
    "status",
  ]);
  assert.equal(logs[0].route, "/profile");
  assert.doesNotMatch(JSON.stringify(logs), /linkedin|example|Ada|fixture/);

  currentTime = 1000;
  assert.equal((await worker.fetch(request())).status, 200);
});
