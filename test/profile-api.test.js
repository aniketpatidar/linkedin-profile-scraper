import test from "node:test";
import assert from "node:assert/strict";
import { createProfileWorker, ProfileApiError } from "../src/profile-api.js";

function request(body, method = "POST") {
  return new Request("https://api.example/profile", {
    method,
    headers: { "content-type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined
  });
}

test("returns the normalized profile contract through the Worker boundary", async () => {
  const worker = createProfileWorker(async (profileUrl) => ({
    identity: { name: "Ada Example", profileUrl },
    headline: "Engineer",
    source: "fixture"
  }));

  const response = await worker.fetch(request({ url: "https://linkedin.com/in/ada-example/?trk=public" }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.identity.name, "Ada Example");
  assert.equal(body.identity.profileUrl, "https://www.linkedin.com/in/ada-example");
  assert.equal(body.headline, "Engineer");
  assert.equal(body.location, null);
  assert.deepEqual(body.experience, []);
  assert.equal(body.meta.source, "fixture");
  assert.equal(body.meta.fieldAvailability.about, false);
  assert.match(response.headers.get("x-request-id"), /^[0-9a-f-]{36}$/);
});

test("rejects unsupported URL shapes with a stable error envelope", async () => {
  const worker = createProfileWorker();
  const response = await worker.fetch(request({ url: "https://www.linkedin.com/company/example" }));
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.deepEqual(Object.keys(body), ["error"]);
  assert.equal(body.error.code, "unsupported_profile");
  assert.equal(body.error.requestId, response.headers.get("x-request-id"));
});

test("returns not found when the provider cannot identify a profile", async () => {
  const worker = createProfileWorker(async () => null);
  const response = await worker.fetch(request({ url: "https://www.linkedin.com/in/missing" }));
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, "profile_not_found");
});

test("maps provider failures without exposing provider details", async () => {
  const worker = createProfileWorker(async () => {
    throw new Error("secret provider internals");
  });
  const response = await worker.fetch(request({ url: "https://www.linkedin.com/in/example" }));
  const body = await response.json();

  assert.equal(response.status, 502);
  assert.equal(body.error.code, "provider_error");
  assert.equal(body.error.message, "profile provider request failed");
  assert.doesNotMatch(JSON.stringify(body), /secret provider internals/);
});

test("returns a stable error for malformed JSON", async () => {
  const worker = createProfileWorker();
  const response = await worker.fetch(new Request("https://api.example/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "not-json"
  }));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "invalid_input");
});

test("preserves provider rate-limit errors", async () => {
  const worker = createProfileWorker(async () => {
    throw new ProfileApiError("rate_limited", "profile provider rate limit reached", 429);
  });
  const response = await worker.fetch(request({ url: "https://www.linkedin.com/in/example" }));
  const body = await response.json();

  assert.equal(response.status, 429);
  assert.equal(body.error.code, "rate_limited");
  assert.equal(body.error.message, "profile provider rate limit reached");
});
