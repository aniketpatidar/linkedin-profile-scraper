const LINKEDIN_ORIGIN = "https://www.linkedin.com";

export function createChallengeProfileRequest(profilePath, sessionCookie) {

  if (!sessionCookie?.trim()) {
    throw new Error("LINKEDIN_SESSION_COOKIE is not configured");
  }

  const url = new URL(profilePath, LINKEDIN_ORIGIN);
  if (url.origin !== LINKEDIN_ORIGIN || !url.pathname.startsWith("/in/")) {
    throw new Error("Profile path must target LinkedIn");
  }

  return new Request(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      Cookie: sessionCookie,
      "User-Agent": "linkedin-profile-api-challenge/1.0"
    }
  });
}
