# Integrate the verified Authorized Source for a minimal Profile

Status: ready-for-agent
Label: ready-for-agent

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Replace the fake provider for the minimal path with an adapter for the verified Authorized Source. Fetch and map trustworthy identity, headline, location, and about data through the existing Worker contract, using deployment-managed secrets and deterministic provider fixtures.

## Acceptance criteria

- [ ] The selected Authorized Source is called only through the Profile Provider boundary.
- [ ] Provider authentication uses deployment-managed configuration and no secret is committed or logged.
- [ ] Identity, headline, location, and about fields map into the normalized public response.
- [ ] Provider unavailability, authentication failure, rate limits, malformed responses, and not-found responses map to the agreed safe error behavior.
- [ ] Provider responses are validated before mapping and cannot inject provider-specific payloads into the public contract.
- [ ] Automated tests use fixtures and cover successful mapping, partial minimal data, malformed data, and provider failures.
- [ ] An opt-in/manual live verification path exists without becoming a required CI dependency.

## Blocked by

- `.scratch/linkedin-profile-api/issues/02-worker-contract-with-fake-provider.md`
