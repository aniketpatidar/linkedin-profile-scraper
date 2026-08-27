import test from "node:test";
import assert from "node:assert/strict";
import { createLinkedInBrowserProvider } from "../src/providers/linkedin-browser.js";
import { ProfileApiError } from "../src/profile-api.js";
import { readFile } from "node:fs/promises";

const fixture = await readFile(
  new URL("./fixtures/linkedin-profile.html", import.meta.url),
  "utf8",
);
const profileUrl = "https://www.linkedin.com/in/aniketpatidar";

test("uses Browser Run with deployment-managed session cookies", async () => {
  let configuredCookies;
  let closed = false;
  const provider = createLinkedInBrowserProvider({
    browser: {},
    sessionCookie: "li_at=fixture-cookie; JSESSIONID=fixture-session",
    launchImpl: async () => ({
      newPage: async () => ({
        setCookie: async (...cookies) => {
          configuredCookies = cookies;
        },
        goto: async () => ({ status: () => 200 }),
        content: async () => fixture,
      }),
      close: async () => {
        closed = true;
      },
    }),
  });

  const profile = await provider(profileUrl);

  assert.equal(profile.source, "linkedin-browser-run");
  assert.equal(profile.identity.name, "Ada Example");
  assert.deepEqual(
    configuredCookies.map(({ name, value }) => ({ name, value })),
    [
      { name: "li_at", value: "fixture-cookie" },
      { name: "JSESSIONID", value: "fixture-session" },
    ],
  );
  assert.equal(closed, true);
});

test("maps a browser provider block safely", async () => {
  const provider = createLinkedInBrowserProvider({
    browser: {},
    sessionCookie: "li_at=fixture-cookie",
    launchImpl: async () => ({
      newPage: async () => ({
        setCookie: async () => {},
        goto: async () => ({ status: () => 999 }),
      }),
      close: async () => {},
    }),
  });

  await assert.rejects(
    provider(profileUrl),
    (error) =>
      error instanceof ProfileApiError &&
      error.code === "provider_unavailable" &&
      error.status === 502,
  );
});
