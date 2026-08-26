# LinkedIn Profile API

Status: ready-for-agent
Label: ready-for-agent

## Problem Statement

Developers need a hosted API that accepts a LinkedIn public member-profile URL and returns useful professional profile information as structured JSON. The current repository contains only the challenge statement and design decisions; there is no deployable API, provider integration, public contract, or documented setup.

The API must be useful when individual fields are unavailable, while avoiding dependence on private endpoint reverse-engineering, personal credentials, persistent profile storage, or undocumented provider payloads.

## Solution

Build and deploy a Cloudflare Worker over public HTTPS. The Worker accepts only normalized public member-profile URLs, obtains data through one verified policy-compliant Authorized Source behind a replaceable Profile Provider boundary, maps the result into a stable normalized schema, and returns a Partial Profile when the source cannot provide every field.

The repository will include setup instructions, API documentation, provider configuration guidance, testing guidance, the approach taken, and known limitations. Secrets remain deployment-managed and never enter source control.

## User Stories

1. As an API consumer, I want to submit a canonical LinkedIn public member-profile URL, so that I can request structured profile information.
2. As an API consumer, I want common URL variations normalized, so that harmless locale and query-string differences do not cause avoidable failures.
3. As an API consumer, I want non-LinkedIn URLs rejected, so that the API has a clear and safe input boundary.
4. As an API consumer, I want company pages, posts, search pages, private profiles, recruiter URLs, and other unsupported shapes rejected, so that I know exactly what the endpoint accepts.
5. As an API consumer, I want identity information returned when the Authorized Source can identify the member, so that I can reliably associate the response with a person.
6. As an API consumer, I want headline, location, and about information returned when available, so that I can understand the member’s professional context.
7. As an API consumer, I want experience and education returned as structured collections, so that I can process career history programmatically.
8. As an API consumer, I want skills, certifications, and languages returned as structured collections, so that I can use the profile for matching and analysis.
9. As an API consumer, I want available profile images returned as URLs with basic metadata, so that I can display them without the API storing or embedding image data.
10. As an API consumer, I want unavailable fields represented explicitly, so that I can distinguish missing source data from malformed responses.
11. As an API consumer, I want a Partial Profile when some fields are unavailable, so that one missing section does not discard otherwise useful information.
12. As an API consumer, I want consistent null and empty-collection semantics, so that clients do not need provider-specific parsing logic.
13. As an API consumer, I want a stable metadata section containing retrieval and schema information, so that I can reason about freshness and contract versions.
14. As an API consumer, I want stable JSON errors and conventional HTTP statuses, so that my client can handle invalid input and upstream failures predictably.
15. As an API consumer, I want request IDs in successful and failed responses, so that support and debugging can correlate a request without exposing profile data.
16. As a maintainer, I want the first provider isolated behind a Profile Provider boundary, so that a verified replacement can be introduced without changing the public contract.
17. As a maintainer, I want provider terms, authentication, field coverage, and Worker compatibility verified before integration, so that the implementation does not silently rely on an unsuitable source.
18. As a maintainer, I want provider credentials supplied through deployment-managed secrets, so that credentials never appear in the repository or logs.
19. As a maintainer, I want profile data fetched on demand, so that the API does not become a persistent store of personal information.
20. As a maintainer, I want any future cache to be short-lived and configurable, so that performance improvements do not create indefinite retention.
21. As a maintainer, I want operational logs to exclude profile content, images, credentials, and full URLs, so that observability does not replicate sensitive data.
22. As a maintainer, I want fixture-based tests for provider responses, so that automated tests are deterministic and do not require live provider access.
23. As a maintainer, I want contract tests at the public Worker request boundary, so that externally observable behavior remains stable.
24. As a maintainer, I want live-provider checks to be opt-in or manual, so that CI is not coupled to provider availability, rate limits, or real credentials.
25. As a repository visitor, I want README setup and API documentation, so that I can run, understand, and evaluate the project.
26. As a repository visitor, I want the README to explain the authorized-source approach and limitations, so that the project’s coverage and constraints are not misleading.
27. As a repository visitor, I want deployment instructions for the Worker, so that I can reproduce the public HTTPS deployment.
28. As a maintainer, I want anonymous MVP access documented as a deliberate limitation, so that deferred caller authentication and mature abuse controls are visible follow-up work.

## Implementation Decisions

- Use a Cloudflare Worker as the public HTTPS runtime.
- Accept only canonical public member-profile URLs using the `/in/{public-identifier}` shape after normalization.
- Reject unsupported URL types and do not accept caller-supplied LinkedIn credentials.
- Obtain data only from a verified policy-compliant Authorized Source. Private endpoint reverse-engineering and automated personal credentials are out of scope.
- Define a replaceable Profile Provider interface between the Worker and the selected source. The first provider is chosen only after terms, authentication, field coverage, and Worker compatibility are verified.
- Keep the public response provider-neutral and normalized, with top-level sections for identity, headline, location, about, experience, education, skills, certifications, languages, images, and metadata.
- Represent unavailable singular values as `null` and unavailable collections as `[]`; include explicit field-availability metadata.
- Return a Partial Profile when a real profile is identified and at least some trustworthy data is available. Use request-level errors when input is invalid, the profile is unsupported/unavailable, authorization fails, limits are reached, or the provider is unavailable.
- Use a stable JSON error envelope containing an error code, safe message, request ID, and optional safe details. Do not expose provider internals.
- Return image URLs and basic metadata without downloading, persisting, or base64-embedding images.
- Fetch profiles on demand and do not persist profile data by default. Any cache must be short-lived, configurable, and policy-compatible.
- Permit anonymous MVP profile requests over HTTPS. Caller API keys and mature abuse controls are deferred, while configurable low-volume limits and provider-safe request limits are documented follow-up concerns.
- Log operational metadata only: request ID, safe route information, status, latency, provider outcome, and schema version. Redact profile content, images, credentials, and full URLs.
- Document environment configuration, secret handling, deployment, API usage, response schema, approach, and known limitations in the README.

## Testing Decisions

- Test external behavior at the highest seam: the public Worker request handler with a fake Profile Provider.
- Cover URL normalization and rejection, successful normalized responses, Partial Profile behavior, explicit field availability, image mapping, stable error envelopes, status mapping, request IDs, and log redaction.
- Test provider mapping separately with synthetic or recorded fixtures, focusing on domain output rather than provider implementation details.
- Do not assert private implementation structure when externally observable behavior is sufficient.
- Do not require live Authorized Source calls, real credentials, or provider availability in automated tests.
- Keep live-provider verification manual or opt-in and ensure it cannot run accidentally in ordinary CI.
- There is no existing test prior art in the repository; the initial suite should establish the Worker-boundary contract as the project’s testing convention.

## Out of Scope

- Reverse-engineering or automating private LinkedIn endpoints.
- Using personal LinkedIn credentials or asking API callers for LinkedIn credentials.
- Supporting company pages, posts, search results, recruiter/private URLs, or arbitrary websites.
- Guaranteeing every field on every profile; source availability and policy restrictions may produce Partial Profiles.
- Persistent profile storage, indefinite caching, analytics databases, or downloaded image storage.
- Caller API keys, user accounts, billing, quotas, dashboards, and mature abuse-prevention systems in the MVP.
- Multiple providers in the first implementation; the boundary should permit future replacement, but only one verified provider is required initially.
- Browser automation or a full headless-browser scraping runtime.

## Further Notes

- Provider selection is an implementation prerequisite, not an assumption. The team must verify the source before claiming field coverage or deployment compatibility.
- The README must clearly distinguish fields returned by the normalized contract from fields that may be unavailable from the selected source.
- The design baseline and ADRs in the repository are authoritative for the accepted runtime, source boundary, response contract, and MVP access policy.

## Scope amendment

The hiring challenge PDF explicitly permits using the owner's own LinkedIn credentials and asks for reverse-engineering. For this challenge only, ADR-0005 and `01-challenge-integration-boundary.md` supersede the original Authorized Source implementation path. The research note remains as historical evidence and should not be interpreted as approval for a general production service.
