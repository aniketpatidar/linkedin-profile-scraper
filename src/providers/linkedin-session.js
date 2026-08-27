import { createChallengeProfileRequest } from "./challenge-session.js";
import { ProfileApiError } from "../profile-api.js";

const FETCH_TIMEOUT_MS = 10_000;

function formatYearMonth(date) {
  if (!date || !date.year) return null;
  if (!date.month) return `${date.year}`;
  return `${date.year}-${String(date.month).padStart(2, "0")}`;
}

export function parseVoyagerProfileJson(payload, profileUrl) {
  if (!payload || !payload.profile) return null;

  const profile = payload.profile;
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null;
  if (!name) return null;

  const experience = (payload.positionView?.elements || []).map(pos => ({
    company: pos.companyName || null,
    title: pos.title || null,
    description: pos.description || null,
    startDate: formatYearMonth(pos.timePeriod?.startDate),
    endDate: formatYearMonth(pos.timePeriod?.endDate)
  }));

  const education = (payload.educationView?.elements || []).map(edu => ({
    institution: edu.schoolName || null,
    degree: edu.degreeName || null,
    startDate: formatYearMonth(edu.timePeriod?.startDate),
    endDate: formatYearMonth(edu.timePeriod?.endDate)
  }));

  const skills = (payload.skillView?.elements || []).map(s => ({
    name: s.name
  }));

  const certifications = (payload.certificationView?.elements || []).map(cert => ({
    name: cert.name || null,
    issuer: cert.authority || null,
    dateIssued: formatYearMonth(cert.timePeriod?.startDate)
  }));

  const languages = (payload.languageView?.elements || []).map(lang => ({
    name: lang.name || null,
    proficiency: lang.proficiency || null
  }));

  const images = [];
  const picture = profile.miniProfile?.picture?.["com.linkedin.common.VectorImage"];
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
    headline: profile.headline || null,
    location: profile.locationName || null,
    about: profile.summary || null,
    experience,
    education,
    skills,
    certifications,
    languages,
    images,
    source: "voyager-api",
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

    const profile = parseVoyagerProfileJson(payload, profileUrl);
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
