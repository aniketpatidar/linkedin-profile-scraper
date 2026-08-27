# 09 — Return normalized Partial Profiles from the browser agent

**What to build:** Connect the self-hosted browser Profile Provider to the public Worker contract and return synchronous normalized Partial Profiles with stable error behavior.

**Blocked by:** 08 — Build the self-hosted browser Profile Provider

**Status:** resolved

- [x] A non-empty display name is sufficient for a successful Partial Profile.
- [x] Missing singular fields are null, missing collections are empty, and field availability is accurate.
- [x] The response contains only the provider-neutral Profile contract and safe metadata.
- [x] Authentication failure, profile absence, provider unavailability, session contention, and malformed data use stable error envelopes.
- [x] Worker-boundary tests verify observable responses through the Profile Provider seam.

## Resolution

Connected the coordinated Browser Run provider to the existing normalized Worker contract and added a public-boundary regression test for `session_busy`. Existing contract and enrichment tests continue to verify Partial Profile defaults, field availability, and stable provider errors. The full suite passes with 25 tests, Wrangler types are current, and the deployment dry run succeeds.

