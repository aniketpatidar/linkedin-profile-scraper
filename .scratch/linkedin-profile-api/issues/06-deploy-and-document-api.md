# Deploy and document the public API

Status: resolved
Label: resolved

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Deploy the completed Worker over public HTTPS and finish the repository README so another developer can configure the verified Authorized Source, run tests, use the endpoint, understand the normalized response and errors, reproduce deployment, and understand the approach and known limitations.

## Acceptance criteria

- [x] The Worker is deployed at a documented public HTTPS endpoint.
- [x] README setup instructions cover prerequisites, local development, deployment, secret configuration, and safe handling of credentials.
- [x] README documents the accepted Profile URL shape, request example, normalized response sections, Partial Profile semantics, image behavior, metadata, and error statuses.
- [x] README identifies the Authorized Source, its verified coverage limits, and the policy-compliant approach.
- [x] README documents anonymous MVP access, rate-limit limitations, no-persistence behavior, and opt-in/manual live verification.
- [x] CI or the documented verification command runs deterministic tests without requiring real provider credentials.
- [x] A final smoke check confirms URL validation, successful profile retrieval, partial response behavior, and safe error responses at the public endpoint.

## Blocked by

- `.scratch/linkedin-profile-api/issues/05-harden-privacy-and-operations.md`
