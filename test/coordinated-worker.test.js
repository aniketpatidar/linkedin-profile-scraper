import test from "node:test";
import assert from "node:assert/strict";
import { createProfileWorker, ProfileApiError } from "../src/profile-api.js";

test("returns session_busy through the public Worker error envelope", async () => {
  const worker = createProfileWorker(async () => {
    throw new ProfileApiError("session_busy", "deployment session is busy", 429);
  });
  const response = await worker.fetch(new Request("https://api.example/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://www.linkedin.com/in/example" }),
  }));
  const body = await response.json();
  assert.equal(response.status, 429);
  assert.deepEqual(body.error.code, "session_busy");
  assert.equal(body.error.message, "deployment session is busy");
  assert.match(body.error.requestId, /^[0-9a-f-]{36}$/);
});
