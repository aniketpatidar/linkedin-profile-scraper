const LINKEDIN_ORIGIN = "https://www.linkedin.com";

export function extractCsrfToken(cookieString) {
  const match = cookieString.match(/JSESSIONID="?([^";]+)"?/);
  return match ? match[1] : null;
}

export function createChallengeProfileRequest(profilePath, sessionCookie) {
  if (!sessionCookie?.trim()) {
    throw new Error("LINKEDIN_SESSION_COOKIE is not configured");
  }

  const url = new URL(profilePath, LINKEDIN_ORIGIN);
  if (url.origin !== LINKEDIN_ORIGIN || !url.pathname.startsWith("/in/")) {
    throw new Error("Profile path must target LinkedIn");
  }

  const pathParts = url.pathname.split("/").filter(Boolean);
  const publicIdentifier = pathParts[1];
  
  if (!publicIdentifier) {
    throw new Error("Profile path must include a public identifier");
  }

  const voyagerUrl = new URL(`/voyager/api/identity/profiles/${publicIdentifier}/profileView`, LINKEDIN_ORIGIN);

  const csrfToken = extractCsrfToken(sessionCookie) || "ajax:challenge";

  return new Request(voyagerUrl, {
    headers: {
      Accept: "application/vnd.linkedin.normalized+json+2.1, application/json",
      Cookie: sessionCookie,
      "csrf-token": csrfToken,
      "User-Agent": "linkedin-profile-api-challenge/1.0",
      "x-li-lang": "en_US"
    }
  });
}
