import test from "node:test";
import assert from "node:assert/strict";
import { createChallengeProfileRequest, extractCsrfToken } from "../src/providers/challenge-session.js";

test("extracts csrf token from cookie", () => {
  assert.equal(extractCsrfToken('li_at=secret; JSESSIONID="ajax:12345"; other=val'), "ajax:12345");
  assert.equal(extractCsrfToken('JSESSIONID=ajax:12345'), "ajax:12345");
  assert.equal(extractCsrfToken('li_at=secret'), null);
});

test("builds a LinkedIn request from the server-side session cookie", () => {
  const request = createChallengeProfileRequest("/in/example", 'li_at=secret; JSESSIONID="ajax:12345"');

  assert.equal(request.url, "https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity=example");
  assert.equal(request.headers.get("cookie"), 'li_at=secret; JSESSIONID="ajax:12345"');
  assert.equal(request.headers.get("csrf-token"), "ajax:12345");
  assert.equal(request.headers.get("user-agent"), "linkedin-profile-api-challenge/1.0");
});

test("rejects non-profile paths", () => {
  assert.throws(
    () => createChallengeProfileRequest("/company/example", "li_at=secret"),
     /must target LinkedIn/
  );
});

test("rejects missing session secrets", () => {
  assert.throws(
    () => createChallengeProfileRequest("/in/example", ""),
    /LINKEDIN_SESSION_COOKIE is not configured/
  );
});

test("rejects paths that normalize outside the profile route", () => {
  assert.throws(
    () => createChallengeProfileRequest("/in/../company/example", "li_at=secret"),
    /must target LinkedIn/
  );
});
