# LinkedIn Profile API — Design Baseline

Status: accepted

## Boundary

- Run publicly over HTTPS as a Cloudflare Worker.
- Accept only normalized public member-profile URLs in the canonical `linkedin.com/in/{public-identifier}` shape.
- Do not use private endpoint reverse-engineering or automated personal LinkedIn credentials.
- Obtain data through one verified, policy-compliant Authorized Source behind a replaceable Profile Provider boundary.

## Contract

- Return a stable normalized schema for identity, headline, location, about, experience, education, skills, certifications, languages, images, and metadata.
- Return a Partial Profile when a real profile is identified but some fields are unavailable.
- Use explicit availability metadata; use `null` for unavailable singular values and `[]` for unavailable collections.
- Use a stable JSON error envelope with conventional HTTP statuses for invalid input, unavailable profiles, unsupported URLs, limits, and provider failures.
- Return provider image URLs and basic metadata; do not download, persist, or base64-embed images.

## Operations and privacy

- Do not persist profile data by default; permit only an optional short-lived cache.
- Allow anonymous MVP requests over HTTPS; document caller authentication and mature abuse controls as follow-up work, with configurable low-volume limits.
- Log operational metadata only. Redact or omit profile content, images, credentials, and full URLs.
- Test with deterministic fixtures and contract tests; live-provider checks are opt-in/manual.
