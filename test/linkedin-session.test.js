import test from "node:test";
import assert from "node:assert/strict";
import {
  createLinkedInSessionProvider,
  parseVoyagerProfileJson,
} from "../src/providers/linkedin-session.js";
import { ProfileApiError } from "../src/profile-api.js";
import { readFile } from "node:fs/promises";

const fixture = JSON.parse(await readFile(
  new URL("./fixtures/voyager-profile.json", import.meta.url),
  "utf8",
));
const profileUrl = "https://www.linkedin.com/in/ada-example";

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("maps fixture voyager JSON into the enriched Profile contract", async () => {
  let upstreamRequest;
  const provider = createLinkedInSessionProvider({
    sessionCookie: 'li_at=fixture-only; JSESSIONID="ajax:fixture"',
    fetchImpl: async (request) => {
      upstreamRequest = request;
      return response(fixture);
    },
  });

  const profile = await provider(profileUrl);

  assert.equal(profile.identity.name, "Ada Example");
  assert.equal(profile.headline, "Staff Engineer");
  assert.equal(profile.location, "Bengaluru");
  assert.equal(profile.about, "Builds reliable systems.");
  assert.deepEqual(profile.experience, [
    {
      company: "Acme Systems",
      title: "Staff Engineer",
      description: "Builds reliable systems.",
      startDate: "2020-01",
      endDate: null,
    },
  ]);
  assert.deepEqual(profile.education, [
    {
      institution: "Example University",
      degree: "BSc Computer Science",
      startDate: "2012",
      endDate: "2016",
    },
  ]);
  assert.deepEqual(profile.skills, [
    { name: "JavaScript" },
    { name: "Cloudflare Workers" },
  ]);
  assert.deepEqual(profile.certifications, [
    {
      name: "Cloudflare Developer Certification",
      issuer: "Cloudflare",
      dateIssued: "2024-03",
    },
  ]);
  assert.deepEqual(profile.languages, [
    { name: "English", proficiency: null },
    { name: "Hindi", proficiency: "professional" },
  ]);
  assert.deepEqual(profile.images, [
    {
      url: "https://media.example/avatar.jpg",
      kind: "profile",
      width: 400,
      height: 400,
    },
  ]);
  assert.equal(profile.source, "voyager-api");
  assert.equal(upstreamRequest.headers.get("cookie"), 'li_at=fixture-only; JSESSIONID="ajax:fixture"');
  assert.equal(upstreamRequest.headers.get("csrf-token"), "ajax:fixture");
  assert.equal(upstreamRequest.url, "https://www.linkedin.com/voyager/api/identity/profiles/ada-example/profileView");
});

test("returns empty enrichment collections for malformed or unavailable fields", () => {
  const payload = {
    profile: {
      firstName: "Partial",
      lastName: "Example",
    },
    positionView: { elements: [{}] },
    educationView: { elements: [{}] },
    skillView: { elements: [{ name: "Partial Skill" }] },
    certificationView: { elements: [{}] },
    languageView: { elements: [{}] }
  };
  const profile = parseVoyagerProfileJson(payload, profileUrl);
  assert.equal(profile.experience.length, 1);
  assert.equal(profile.experience[0].company, null);
  assert.equal(profile.education.length, 1);
  assert.equal(profile.education[0].institution, null);
  assert.deepEqual(profile.skills, [{ name: "Partial Skill" }]);
  assert.equal(profile.certifications.length, 1);
  assert.equal(profile.certifications[0].name, null);
  assert.equal(profile.languages.length, 1);
  assert.equal(profile.languages[0].name, null);
  assert.deepEqual(profile.images, []);
});

test("returns null when no trustworthy person data is present", () => {
  assert.equal(
    parseVoyagerProfileJson({}, profileUrl),
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
