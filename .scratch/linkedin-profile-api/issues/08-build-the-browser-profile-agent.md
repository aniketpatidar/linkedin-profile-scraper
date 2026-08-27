# 08 — Build the self-hosted browser Profile Provider

**What to build:** Retrieve one Profile URL through the coordinated Browser Run session, read the public rendered page and public structured data, and produce an extractable Profile result.

**Blocked by:** 07 — Create the deployment session coordinator

**Status:** resolved

- [x] One valid Profile URL opens through Browser Run using deployment-managed Owner Credentials.
- [x] The browser flow uses only public rendered-page and public structured-data extraction.
- [x] Identity, headline, location, about, experience, education, skills, certifications, languages, and images are extracted when available.
- [x] Authentication redirects, invalid sessions, timeouts, unavailable pages, and missing identity map to safe provider outcomes.
- [x] No stealth tooling, private endpoints, proxy rotation, CAPTCHA bypass, or rate-limit bypass is introduced.
- [x] Browser lifecycle and extraction behavior have mocked-browser and fixture tests.

## Resolution

Verified the self-hosted Browser Run Profile Provider with deployment-managed session-cookie setup, public rendered-page and JSON-LD extraction, safe handling for authentication redirects, provider blocks, missing identity, timeouts, and browser cleanup. The targeted Browser Run and LinkedIn provider tests pass, and the Wrangler dry run includes Browser Run and session-coordinator bindings. Live LinkedIn availability remains deployment-session dependent; no stealth or access-control bypass was added.

