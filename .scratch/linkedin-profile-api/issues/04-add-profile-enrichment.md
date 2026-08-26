# Add professional-history and media enrichment

Status: ready-for-agent
Label: ready-for-agent

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Extend the integrated Profile Provider mapping to include experience, education, skills, certifications, languages, images, retrieval metadata, and field availability. Preserve the provider-neutral schema and Partial Profile behavior when the Authorized Source lacks any enrichment field.

## Acceptance criteria

- [ ] Experience and education are returned as structured collections with stable field semantics.
- [ ] Skills, certifications, and languages are returned as structured collections when available.
- [ ] Images are returned only as provider URLs with basic metadata; images are not downloaded, persisted, or base64-embedded.
- [ ] Unavailable enrichment fields follow the agreed `null`/`[]` and availability metadata rules.
- [ ] Metadata includes schema version and retrieval time without exposing provider internals.
- [ ] Fixture tests cover complete, partial, empty-collection, malformed, and provider-limited enrichment responses.
- [ ] The README’s coverage claims match the verified provider behavior.

## Blocked by

- `.scratch/linkedin-profile-api/issues/03-integrate-authorized-source.md`
