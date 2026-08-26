import { fakeProfileProvider } from "./providers/fake-profile.js";

const LINKEDIN_HOSTS = new Set(["linkedin.com", "www.linkedin.com"]);
const PROFILE_PATH = /^\/in\/([a-zA-Z0-9][a-zA-Z0-9-_%]*)\/?$/;
const COLLECTION_FIELDS = ["experience", "education", "skills", "certifications", "languages", "images"];
const SINGULAR_FIELDS = ["headline", "location", "about"];

export class ProfileApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function normalizeProfileUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ProfileApiError("invalid_input", "url is required", 400);
  }

  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new ProfileApiError("invalid_url", "url must be a valid HTTPS LinkedIn URL", 400);
  }

  if (parsed.protocol !== "https:" || !LINKEDIN_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new ProfileApiError("unsupported_url", "url must be an HTTPS LinkedIn profile URL", 422);
  }

  const match = parsed.pathname.match(PROFILE_PATH);
  if (!match) {
    throw new ProfileApiError("unsupported_profile", "only public member profiles are supported", 422);
  }

  return `https://www.linkedin.com/in/${decodeURIComponent(match[1])}`;
}

function fieldAvailability(profile) {
  return Object.fromEntries([
    ["identity", Boolean(profile.identity?.name)],
    ...SINGULAR_FIELDS.map((field) => [field, profile[field] !== null && profile[field] !== undefined]),
    ...COLLECTION_FIELDS.map((field) => [field, Array.isArray(profile[field]) && profile[field].length > 0])
  ]);
}

function normalizeProfile(profile, profileUrl) {
  const normalized = {
    identity: profile.identity ?? { name: null, profileUrl },
    headline: profile.headline ?? null,
    location: profile.location ?? null,
    about: profile.about ?? null,
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    education: Array.isArray(profile.education) ? profile.education : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    languages: Array.isArray(profile.languages) ? profile.languages : [],
    images: Array.isArray(profile.images) ? profile.images : [],
    meta: {
      schemaVersion: "1",
      retrievedAt: new Date().toISOString(),
      source: profile.source ?? "unknown",
      fieldAvailability: fieldAvailability(profile)
    }
  };

  normalized.identity.profileUrl ??= profileUrl;
  return normalized;
}

function errorResponse(error, requestId) {
  const apiError = error instanceof ProfileApiError
    ? error
    : new ProfileApiError("provider_error", "profile provider request failed", 502);

  return Response.json(
    {
      error: {
        code: apiError.code,
        message: apiError.message,
        requestId
      }
    },
    { status: apiError.status, headers: { "x-request-id": requestId } }
  );
}

export function createProfileWorker(provider = fakeProfileProvider) {
  return {
    async fetch(request) {
      const requestId = crypto.randomUUID();
      const url = new URL(request.url);

      if (url.pathname === "/health" && request.method === "GET") {
        return Response.json({ ok: true }, { headers: { "x-request-id": requestId } });
      }

      if (url.pathname !== "/profile" || request.method !== "POST") {
        return errorResponse(new ProfileApiError("not_found", "route not found", 404), requestId);
      }

      try {
        let body;
        try {
          body = await request.json();
        } catch {
          throw new ProfileApiError("invalid_input", "request body must be valid JSON", 400);
        }
        const profileUrl = normalizeProfileUrl(body?.url);
        const profile = await provider(profileUrl);

        if (!profile) {
          throw new ProfileApiError("profile_not_found", "profile was not found", 404);
        }

        return Response.json(normalizeProfile(profile, profileUrl), {
          headers: { "x-request-id": requestId }
        });
      } catch (error) {
        return errorResponse(error, requestId);
      }
    }
  };
}
