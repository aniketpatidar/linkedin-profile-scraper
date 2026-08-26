# Define the challenge-only credentialed integration

Status: resolved
Label: ready-for-agent

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Define the challenge-only `Challenge Integration` that uses the owner’s LinkedIn session/authentication material from deployment-managed secrets. Confirm the selected access mechanism is technically callable from the chosen runtime, document the required secret names and setup without secret values, and constrain the integration to the owner’s account and challenge deployment.

This ticket replaces the original provider-authorization blocker for the hiring challenge. The earlier research remains available as a record of why this is not a general production data service.

## Acceptance criteria

- [x] The challenge access mechanism is selected and verified against the Worker runtime, or a concrete runtime limitation is recorded.
- [x] Required secret names, formats, rotation expectations, and local/deployed configuration are documented without exposing values.
- [x] Credentials are accessed only server-side through deployment-managed secrets and are never accepted from API callers.
- [x] The integration is explicitly limited to the owner’s account and challenge deployment.
- [x] No credentials are committed, logged, returned, or included in fixtures.
- [x] The README will disclose the challenge-only scope, risks, and known limitations.

## Blocked by

None - can start immediately

## Resolution

Implemented the challenge-only session-cookie seam, Worker secret declaration, local secret template, safe health-only handler, and deterministic tests. Wrangler 4.126.0 generated the binding types and `wrangler deploy --dry-run` succeeded. No live LinkedIn request was made because no Owner Credential was supplied; live connectivity remains a deployment-time check.
