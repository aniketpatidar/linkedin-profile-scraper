# Harden privacy, observability, and MVP operations

Status: resolved
Label: resolved

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Apply the accepted privacy and operational policies to the deployed request path: on-demand retrieval, no persistent profile storage, safe operational logging, provider-safe limits, configurable low-volume rate limiting, and explicit documentation that caller authentication and mature abuse controls are deferred for the anonymous MVP.

## Acceptance criteria

- [x] Profile data is not persisted by the Worker; any cache capability is disabled by default and bounded by a short configurable TTL.
- [x] Logs contain operational metadata only and omit/redact profile content, images, credentials, and full URLs.
- [x] Requests have safe timeouts and provider-safe low-volume limits that prevent accidental exhaustion.
- [x] Anonymous MVP access remains functional over HTTPS, and deferred caller authentication is documented as a known limitation.
- [x] Rate-limit and logging tests verify behavior without asserting implementation details.
- [x] Secrets are loaded through deployment-managed bindings and are absent from logs and repository files.

## Blocked by

- `.scratch/linkedin-profile-api/issues/04-add-profile-enrichment.md`

## Resolution

Added an injectable fixed-window anonymous limiter and metadata-only request logging at the Worker boundary. The deployed entrypoint uses a 10-request/minute best-effort limit per Worker isolate. Profile retrieval remains on demand with no persistence or cache; provider responses remain bounded and timed out; secrets stay deployment-managed. README and challenge integration documentation record the anonymous MVP and deferred durable abuse controls. Tests verify limiting and that logs omit profile URLs, content, and provider details.
