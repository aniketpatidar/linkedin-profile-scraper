import test from "node:test";
import assert from "node:assert/strict";
import {
  createLinkedInSessionProvider,
  parseVoyagerDashJson,
} from "../src/providers/linkedin-session.js";
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

test("maps fixture voyager dash JSON into the enriched Profile contract", async () => {
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
  assert.equal(profile.headline, "Software EngineerㆍAIㆍRuby on RailsㆍTypeScriptㆍReact.jsㆍNext.jsㆍNode.js");
  assert.equal(profile.location, null);
  assert.equal(profile.about, null);
  assert.deepEqual(profile.experience, []);
  assert.deepEqual(profile.education, []);
  assert.deepEqual(profile.skills, []);
  assert.deepEqual(profile.certifications, []);
  assert.deepEqual(profile.languages, []);
  assert.equal(profile.images[0].url, "https://media.licdn.com/dms/image/v2/D4D03AQGbPIpTczjfcw/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1684865870362?e=1789603200&v=beta&t=fpP2el5zedjjbLKJj8cn3VvBjxCdTPeDzLBqKGXbzbs");
  assert.equal(profile.source, "voyager-dash-api");
  assert.equal(upstreamRequest.headers.get("cookie"), 'li_at=fixture-only; JSESSIONID="ajax:fixture"');
  assert.equal(upstreamRequest.headers.get("csrf-token"), "ajax:fixture");
  assert.equal(upstreamRequest.url, "https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=aniketpatidar");
});

test("returns empty enrichment collections for malformed or unavailable fields", () => {
  const payload = {
    included: [
      { $type: "com.linkedin.voyager.dash.identity.profile.Profile", firstName: "Partial" },
      { $type: "com.linkedin.voyager.dash.identity.profile.Position" },
      { $type: "com.linkedin.voyager.dash.identity.profile.Education" },
      { $type: "com.linkedin.voyager.dash.identity.profile.Skill", name: "Partial Skill" }
    ]
  };
  const profile = parseVoyagerDashJson(payload, profileUrl);
  assert.equal(profile.experience.length, 1);
  assert.equal(profile.experience[0].company, null);
  assert.equal(profile.education.length, 1);
  assert.equal(profile.education[0].institution, null);
  assert.deepEqual(profile.skills, [{ name: "Partial Skill" }]);
  assert.deepEqual(profile.images, []);
});

test("returns null when no trustworthy person data is present", () => {
  assert.equal(
    parseVoyagerDashJson({}, profileUrl),
    null,
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
