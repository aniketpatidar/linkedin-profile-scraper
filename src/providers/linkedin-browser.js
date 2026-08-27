import puppeteer from "@cloudflare/puppeteer";
import { parseLinkedInProfileHtml } from "./linkedin-session.js";
import { ProfileApiError } from "../profile-api.js";

const BROWSER_TIMEOUT_MS = 15_000;

function sessionCookies(value) {
  const raw = String(value || "").trim();
  if (!raw.includes("="))
    return [
      {
        name: "li_at",
        value: raw,
        domain: ".linkedin.com",
        path: "/",
        secure: true,
        httpOnly: true,
      },
    ];
  return raw
    .split(";")
    .map((part) => part.trim().split("="))
    .filter(([name, cookieValue]) => name && cookieValue)
    .map(([name, ...parts]) => ({
      name,
      value: parts.join("="),
      domain: ".linkedin.com",
      path: "/",
      secure: true,
      httpOnly: true,
    }));
}

export function createLinkedInBrowserProvider({
  browser,
  sessionCookie,
  launchImpl = puppeteer.launch,
} = {}) {
  return async function linkedInBrowserProvider(profileUrl) {
    const cookies = sessionCookies(sessionCookie);
    if (!browser || cookies.length === 0) {
      throw new ProfileApiError(
        "provider_auth_failed",
        "profile provider credentials are not configured",
        502,
      );
    }

    let browserSession;
    try {
      browserSession = await launchImpl(browser);
      const page = await browserSession.newPage();
      await page.setCookie(...cookies);
      const response = await page.goto(profileUrl, {
        waitUntil: "domcontentloaded",
        timeout: BROWSER_TIMEOUT_MS,
      });

      if (response?.status() === 999) {
        throw new ProfileApiError(
          "provider_unavailable",
          "profile provider is unavailable",
          502,
        );
      }
      if (response && [401, 403].includes(response.status())) {
        throw new ProfileApiError(
          "provider_auth_failed",
          "profile provider authentication failed",
          502,
        );
      }
      if (response?.status() === 404) {
        throw new ProfileApiError(
          "profile_not_found",
          "profile was not found",
          404,
        );
      }

      const finalPath =
        typeof page.url === "function" ? new URL(page.url()).pathname : null;
      if (finalPath && /\/(?:login|checkpoint|uas)\b/i.test(finalPath)) {
        throw new ProfileApiError(
          "provider_auth_failed",
          "profile provider authentication failed",
          502,
        );
      }
      const html = await page.content();
      const profile = parseLinkedInProfileHtml(html, profileUrl);
      if (profile) return { ...profile, source: "linkedin-browser-run" };

      if (typeof page.evaluate === "function") {
        const rendered = await page.evaluate(() => ({
          name: document.querySelector("h1")?.textContent?.trim() || null,
          headline:
            document.querySelector(".text-body-medium")?.textContent?.trim() ||
            null,
          location:
            document.querySelector(".text-body-small")?.textContent?.trim() ||
            null,
        }));
        if (rendered.name) {
          return {
            identity: { name: rendered.name, profileUrl },
            headline: rendered.headline,
            location: rendered.location,
            about: null,
            experience: [],
            education: [],
            skills: [],
            certifications: [],
            languages: [],
            images: [],
            source: "linkedin-browser-run",
          };
        }
      }
      return null;
    } catch (error) {
      if (error instanceof ProfileApiError) throw error;
      throw new ProfileApiError(
        "provider_unavailable",
        "profile provider is unavailable",
        502,
      );
    } finally {
      if (browserSession) await browserSession.close();
    }
  };
}
