import test from "node:test";
import assert from "node:assert/strict";
import { createLinkedInSessionProvider } from "../src/providers/linkedin-session.js";
import { ProfileApiError } from "../src/profile-api.js";
import { readFile } from "node:fs/promises";

const fixture = JSON.parse(await readFile(
  new URL("./fixtures/voyager-dash.json", import.meta.url),
  "utf8",
));
const profileUrl = "https://www.linkedin.com/in/aniketpatidar";

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("delegates to the dash mapper successfully", async () => {
  let upstreamRequest;
  const provider = createLinkedInSessionProvider({
    sessionCookie: 'li_at=fixture-only; JSESSIONID="ajax:fixture"',
    fetchImpl: async (request) => {
      upstreamRequest = request;
      return response(fixture);
    },
  });

  const profile = await provider(profileUrl);

  assert.equal(profile.identity.name, "Aniket Patidar");
  assert.equal(profile.source, "voyager-dash-api");
  assert.equal(upstreamRequest.headers.get("cookie"), 'li_at=fixture-only; JSESSIONID="ajax:fixture"');
  assert.equal(upstreamRequest.headers.get("csrf-token"), "ajax:fixture");
  assert.equal(upstreamRequest.url, "https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=aniketpatidar");
});

test("returns not_found when the mapper returns null", async () => {
  const provider = createLinkedInSessionProvider({
    sessionCookie: "li_at=fixture-only",
    fetchImpl: async () => response({ included: [] }),
  });

  await assert.rejects(
    provider(profileUrl),
    (error) =>
      error instanceof ProfileApiError &&
      error.code === "profile_not_found" &&
      error.status === 404,
  );
});

test("maps authentication, rate-limit, not-found, and provider failures", async () => {
  for (const [status, code, expectedStatus] of [
    [401, "provider_auth_failed", 502],
    [429, "rate_limited", 429],
    [404, "profile_not_found", 404],
    [500, "provider_error", 502],
    [999, "provider_unavailable", 502],
  ]) {
    const provider = createLinkedInSessionProvider({
      sessionCookie: "li_at=fixture-only",
      fetchImpl: async () => response({}, status),
    });

    await assert.rejects(
      provider(profileUrl),
      (error) =>
        error instanceof ProfileApiError &&
        error.code === code &&
        error.status === expectedStatus,
    );
  }
});

test("fails safely when the session secret is absent", async () => {
  const provider = createLinkedInSessionProvider({
    fetchImpl: async () => response(fixture),
  });

  await assert.rejects(
    provider(profileUrl),
    (error) =>
      error instanceof ProfileApiError &&
      error.code === "provider_auth_failed" &&
      error.status === 502,
  );
});

test("fails safely when the json is malformed", async () => {
  const provider = createLinkedInSessionProvider({
    sessionCookie: "li_at=fixture-only",
    fetchImpl: async () => new Response("malformed json", { status: 200 }),
  });

  await assert.rejects(
    provider(profileUrl),
    (error) =>
      error instanceof ProfileApiError &&
      error.code === "provider_error" &&
      error.status === 502,
  );
});
