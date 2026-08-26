import { createChallengeProfileRequest } from "./challenge-session.js";
import { ProfileApiError } from "../profile-api.js";

const MAX_PROFILE_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

async function readBoundedText(response) {
  if (!response.body) {
    return response.text();
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      total += value.byteLength;
      if (total > MAX_PROFILE_BYTES) {
        throw new ProfileApiError(
          "provider_payload_too_large",
          "profile provider response was too large",
          502,
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function jsonLdValues(html) {
  const values = [];
  const pattern =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      const parsed = JSON.parse(match[1].trim());
      values.push(...(Array.isArray(parsed) ? parsed : [parsed]));
    } catch {
      // Ignore unrelated or malformed embedded JSON and use remaining fields.
    }
  }
  return values;
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  return html.match(pattern)?.[1] ?? null;
}

function asArray(value) {
  return Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? [value]
      : [];
}

function textValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function namedValue(value) {
  if (typeof value === "string")
    return value.trim() ? { name: value.trim(), extra: {} } : null;
  if (!value || typeof value !== "object") return null;
  const name = textValue(value.name);
  return name ? { name, extra: value } : null;
}

function experienceValues(person) {
  return asArray(person.worksFor).flatMap((value) => {
    const item = namedValue(value);
    return item
      ? [
          {
            company: item.name,
            title: textValue(item.extra.jobTitle),
            description: textValue(item.extra.description),
            startDate: textValue(item.extra.startDate),
            endDate: textValue(item.extra.endDate),
          },
        ]
      : [];
  });
}

function educationValues(person) {
  return asArray(person.alumniOf).flatMap((value) => {
    const item = namedValue(value);
    return item
      ? [
          {
            institution: item.name,
            degree: textValue(item.extra.degree),
            startDate: textValue(item.extra.startDate),
            endDate: textValue(item.extra.endDate),
          },
        ]
      : [];
  });
}

function skillValues(person) {
  return asArray(person.knowsAbout).flatMap((value) => {
    const item = namedValue(value);
    return item ? [{ name: item.name }] : [];
  });
}

function certificationValues(person) {
  return asArray(person.hasCredential).flatMap((value) => {
    const item = namedValue(value);
    if (!item) return [];
    const issuer = namedValue(item.extra.issuer);
    return [
      {
        name: item.name,
        issuer: issuer?.name ?? null,
        dateIssued: textValue(item.extra.dateIssued),
      },
    ];
  });
}

function languageValues(person) {
  return asArray(person.knowsLanguage).flatMap((value) => {
    const item = namedValue(value);
    return item
      ? [{ name: item.name, proficiency: textValue(item.extra.proficiency) }]
      : [];
  });
}

function imageValues(person) {
  const images = [];
  for (const image of [person.image, person.photo]) {
    if (typeof image === "string" && image.trim())
      images.push({ url: image.trim(), kind: "profile" });
    if (
      image &&
      typeof image === "object" &&
      typeof image.url === "string" &&
      image.url.trim()
    ) {
      const value = { url: image.url.trim(), kind: "profile" };
      if (Number.isInteger(image.width)) value.width = image.width;
      if (Number.isInteger(image.height)) value.height = image.height;
      images.push(value);
    }
  }
  return images;
}

export function parseLinkedInProfileHtml(html, profileUrl) {
  const person =
    jsonLdValues(html).find((value) => value?.["@type"] === "Person") ?? {};
  const name = person.name ?? metaContent(html, "og:title");
  const headline = person.jobTitle ?? metaContent(html, "og:description");
  const location =
    person.address?.addressLocality ??
    person.address?.addressRegion ??
    person.address?.addressCountry ??
    null;
  const about = person.description ?? null;
  const images = imageValues(person);

  if (!name) return null;

  return {
    identity: { name, profileUrl },
    headline,
    location,
    about,
    experience: experienceValues(person),
    education: educationValues(person),
    skills: skillValues(person),
    certifications: certificationValues(person),
    languages: languageValues(person),
    images,
    source: "linkedin-session",
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
      upstreamRequest.headers.set("Accept-Language", "en-US,en;q=0.9");
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
    if (!upstreamResponse.ok) {
      throw new ProfileApiError(
        "provider_error",
        "profile provider request failed",
        502,
      );
    }

    const html = await readBoundedText(upstreamResponse);
    return parseLinkedInProfileHtml(html, profileUrl);
  };
}
