# Integrate the verified Authorized Source for a minimal Profile

Status: resolved
Label: ready-for-agent

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Replace the fake provider for the minimal path with an adapter for the verified Authorized Source. Fetch and map trustworthy identity, headline, location, and about data through the existing Worker contract, using deployment-managed secrets and deterministic provider fixtures.

## Acceptance criteria

- [x] The selected Authorized Source is called only through the Profile Provider boundary.
- [x] Provider authentication uses deployment-managed configuration and no secret is committed or logged.
- [x] Identity, headline, location, and about fields map into the normalized public response.
- [x] Provider unavailability, authentication failure, rate limits, malformed responses, and not-found responses map to the agreed safe error behavior.
- [x] Provider responses are validated before mapping and cannot inject provider-specific payloads into the public contract.
- [x] Automated tests use fixtures and cover successful mapping, partial minimal data, malformed data, and provider failures.
- [x] An opt-in/manual live verification path exists without becoming a required CI dependency.

## Blocked by

- `.scratch/linkedin-profile-api/issues/02-worker-contract-with-fake-provider.md`

## Resolution

Implemented the LinkedIn session `Profile Provider` adapter and wired it into the production Worker entrypoint. The adapter uses the deployment-managed session cookie, bounded response reads, fixture HTML/JSON-LD parsing, minimal identity/headline/location/about/image mapping, and safe mappings for authentication, rate-limit, not-found, malformed, oversized, and upstream failures. Added fixture-backed tests; no live credential or LinkedIn request was used. `npm test`, `wrangler types --check`, `wrangler deploy --dry-run`, and `git diff --check` pass.
