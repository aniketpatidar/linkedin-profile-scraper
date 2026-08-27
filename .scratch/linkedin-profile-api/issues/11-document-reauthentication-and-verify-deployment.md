# 11 — Document reauthentication and verify the deployed agent

**What to build:** Provide the manual Owner Credentials refresh procedure and verify the complete self-hosted agent over public HTTPS.

**Blocked by:** 10 — Add public MVP controls and safe observability

**Status:** resolved

- [x] Reauthentication is documented as a deployment-secret update followed by coordinated session invalidation.
- [x] No public endpoint accepts or returns LinkedIn cookies or other Owner Credentials.
- [x] Deterministic tests run without live LinkedIn credentials.
- [x] A live smoke test verifies HTTP success, non-empty identity, normalized response shape, and field availability.
- [x] Authentication failure and unavailable-session behavior are verified without automatic retries.
- [x] Public documentation describes the Owner Session Integration’s narrow scope, risks, limitations, and no-persistence behavior.
