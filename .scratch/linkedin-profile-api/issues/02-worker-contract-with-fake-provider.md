# Deliver the Worker contract with a fake Profile Provider

Status: resolved
Label: ready-for-agent

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Build the public Worker request path around a fake Profile Provider so the API contract can be exercised before live provider integration. Accept and normalize only public member-profile URLs, reject unsupported inputs, return the stable provider-neutral schema, model Partial Profiles and field availability, and return safe stable errors with request IDs.

## Acceptance criteria

- [x] The Worker exposes a documented profile-request endpoint over its local runtime.
- [x] Canonical `/in/{public-identifier}` URLs are accepted after safe normalization; non-LinkedIn and unsupported profile URL shapes are rejected.
- [x] Successful responses have stable sections for identity, headline, location, about, experience, education, skills, certifications, languages, images, and metadata.
- [x] Missing singular fields use `null`, missing collections use `[]`, and field availability is explicit.
- [x] A real identified profile with missing fields returns a Partial Profile rather than failing the request.
- [x] Invalid input, unavailable profiles, unsupported URLs, provider failures, and limits map to a stable JSON error envelope and conventional statuses.
- [x] Contract tests exercise the external Worker behavior through a fake Profile Provider; no live provider or real credentials are required.

## Blocked by

- `.scratch/linkedin-profile-api/issues/01-challenge-integration-boundary.md`

## Resolution

Implemented the public `POST /profile` Worker contract with an injected fake Profile Provider, URL normalization and rejection, stable normalized response defaults, Partial Profile availability metadata, request IDs, and safe error mapping. Added boundary tests for success, unsupported URLs, missing profiles, provider failures, and malformed JSON. `npm test`, `wrangler types --check`, `wrangler deploy --dry-run`, and `git diff --check` pass.
