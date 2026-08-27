import { createChallengeProfileRequest } from "./challenge-session.js";
import { ProfileApiError } from "../profile-api.js";

const FETCH_TIMEOUT_MS = 10_000;

function formatYearMonth(date) {
  if (!date || !date.year) return null;
  if (!date.month) return `${date.year}`;
  return `${date.year}-${String(date.month).padStart(2, "0")}`;
}

export function parseVoyagerDashJson(payload, profileUrl) {
  if (!payload || !payload.included) return null;

  let profileData = null;
  const experience = [];
  const education = [];
  const skills = [];
  const certifications = [];
  const languages = [];
  
  for (const item of payload.included) {
    if (item.$type === "com.linkedin.voyager.dash.identity.profile.Profile") {
      profileData = item;
    } else if (item.$type === "com.linkedin.voyager.dash.identity.profile.Position") {
      experience.push({
        company: item.companyName || null,
        title: item.title || null,
        description: item.description || null,
        startDate: formatYearMonth(item.dateRange?.start),
        endDate: formatYearMonth(item.dateRange?.end)
      });
    } else if (item.$type === "com.linkedin.voyager.dash.identity.profile.Education") {
      education.push({
        institution: item.schoolName || null,
        degree: item.degreeName || null,
        startDate: formatYearMonth(item.dateRange?.start),
        endDate: formatYearMonth(item.dateRange?.end)
      });
    } else if (item.$type === "com.linkedin.voyager.dash.identity.profile.Skill") {
      skills.push({ name: item.name });
    } else if (item.$type === "com.linkedin.voyager.identity.shared.MiniProfile" && !profileData) {
       profileData = item;
    }
  }

  if (!profileData) return null;

  const name = [profileData.firstName, profileData.lastName].filter(Boolean).join(" ") || null;
  if (!name) return null;

  const images = [];
  const picture = profileData.picture;
  if (picture && picture.rootUrl && picture.artifacts) {
    for (const artifact of picture.artifacts) {
      images.push({
        url: picture.rootUrl + artifact.fileIdentifyingUrlPathSegment,
        kind: "profile",
        width: artifact.width,
        height: artifact.height
      });
    }
  }

  return {
    identity: { name, profileUrl },
    headline: profileData.headline || profileData.occupation || null,
    location: profileData.locationName || null,
    about: profileData.summary || null,
    experience,
    education,
    skills,
    certifications,
    languages,
    images,
    source: "voyager-dash-api",
  };
}

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
