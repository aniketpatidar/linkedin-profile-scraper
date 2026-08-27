import { createChallengeProfileRequest } from "./challenge-session.js";
import { parseVoyagerDashJson } from "./voyager-dash-mapper.js";
import { ProfileApiError } from "../profile-api.js";

const FETCH_TIMEOUT_MS = 10_000;

export function createLinkedInSessionProvider({
  sessionCookie,
  fetchImpl = fetch,
} = {}) {
  return async function linkedInSessionProvider(profileUrl) {
    const path = new URL(profileUrl).pathname;
    let upstreamResponse;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const upstreamRequest = createChallengeProfileRequest(
        path,
        sessionCookie,
      );
      upstreamResponse = await fetchImpl(upstreamRequest, {
        signal: controller.signal,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "LINKEDIN_SESSION_COOKIE is not configured"
      ) {
        throw new ProfileApiError(
          "provider_auth_failed",
          "profile provider credentials are not configured",
          502,
        );
      }
      if (error instanceof ProfileApiError) throw error;
      throw new ProfileApiError(
        "provider_unavailable",
        "profile provider is unavailable",
        502,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
      throw new ProfileApiError(
        "provider_auth_failed",
        "profile provider authentication failed",
        502,
      );
    }
    if (upstreamResponse.status === 404) {
      throw new ProfileApiError(
        "profile_not_found",
        "profile was not found",
        404,
      );
    }
    if (upstreamResponse.status === 429) {
      throw new ProfileApiError(
        "rate_limited",
        "profile provider rate limit reached",
        429,
      );
    }
    if (upstreamResponse.status === 999) {
      throw new ProfileApiError(
        "provider_unavailable",
        "profile provider is unavailable",
        502,
      );
    }
    if (!upstreamResponse.ok) {
      throw new ProfileApiError(
        "provider_error",
        "profile provider request failed",
        502,
      );
    }

    let payload;
    try {
      payload = await upstreamResponse.json();
    } catch (e) {
      throw new ProfileApiError(
        "provider_error",
        "profile provider returned invalid json",
        502,
      );
    }

    const profile = parseVoyagerDashJson(payload, profileUrl);
    if (!profile) {
      throw new ProfileApiError(
        "profile_not_found",
        "profile could not be parsed",
        404,
      );
    }
    return profile;
  };
}
