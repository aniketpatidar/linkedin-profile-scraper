# Harden privacy, observability, and MVP operations

Status: ready-for-agent
Label: ready-for-agent

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Apply the accepted privacy and operational policies to the deployed request path: on-demand retrieval, no persistent profile storage, safe operational logging, provider-safe limits, configurable low-volume rate limiting, and explicit documentation that caller authentication and mature abuse controls are deferred for the anonymous MVP.

## Acceptance criteria

- [ ] Profile data is not persisted by the Worker; any cache capability is disabled by default and bounded by a short configurable TTL.
- [ ] Logs contain operational metadata only and omit/redact profile content, images, credentials, and full URLs.
- [ ] Requests have safe timeouts and provider-safe low-volume limits that prevent accidental exhaustion.
- [ ] Anonymous MVP access remains functional over HTTPS, and deferred caller authentication is documented as a known limitation.
- [ ] Rate-limit and logging tests verify behavior without asserting implementation details.
- [ ] Secrets are loaded through deployment-managed bindings and are absent from logs and repository files.

## Blocked by

- `.scratch/linkedin-profile-api/issues/04-add-profile-enrichment.md`
