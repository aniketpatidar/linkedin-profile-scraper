import test from "node:test";
import assert from "node:assert/strict";
import { createLinkedInSessionProvider, parseLinkedInProfileHtml } from "../src/providers/linkedin-session.js";
import { ProfileApiError } from "../src/profile-api.js";
import { readFile } from "node:fs/promises";

const fixture = await readFile(new URL("./fixtures/linkedin-profile.html", import.meta.url), "utf8");
const profileUrl = "https://www.linkedin.com/in/ada-example";

function response(body, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/html" } });
}

test("maps fixture profile HTML into the minimal Profile contract", async () => {
  let upstreamRequest;
  const provider = createLinkedInSessionProvider({
    sessionCookie: "li_at=fixture-only",
    fetchImpl: async (request) => {
      upstreamRequest = request;
      return response(fixture);
    }
  });

  const profile = await provider(profileUrl);

  assert.equal(profile.identity.name, "Ada Example");
  assert.equal(profile.headline, "Staff Engineer");
  assert.equal(profile.location, "Bengaluru");
  assert.equal(profile.about, "Builds reliable systems.");
  assert.deepEqual(profile.images, [{ url: "https://media.example/avatar.jpg", kind: "profile" }]);
  assert.equal(profile.source, "linkedin-session");
  assert.equal(upstreamRequest.headers.get("cookie"), "li_at=fixture-only");
  assert.equal(upstreamRequest.url, profileUrl);
});

test("returns null when no trustworthy person data is present", () => {
  assert.equal(parseLinkedInProfileHtml("<html><head></head></html>", profileUrl), null);
});

test("maps authentication, rate-limit, not-found, and provider failures", async () => {
  for (const [status, code, expectedStatus] of [
    [401, "provider_auth_failed", 502],
    [429, "rate_limited", 429],
    [404, "profile_not_found", 404],
    [500, "provider_error", 502]
  ]) {
    const provider = createLinkedInSessionProvider({
      sessionCookie: "li_at=fixture-only",
      fetchImpl: async () => response("", status)
    });

    await assert.rejects(
      provider(profileUrl),
      (error) => error instanceof ProfileApiError
        && error.code === code
        && error.status === expectedStatus
    );
  }
});

test("fails safely when the session secret is absent", async () => {
  const provider = createLinkedInSessionProvider({ fetchImpl: async () => response(fixture) });

  await assert.rejects(
    provider(profileUrl),
    (error) => error instanceof ProfileApiError
      && error.code === "provider_auth_failed"
      && error.status === 502
  );
});
