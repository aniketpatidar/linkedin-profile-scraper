# Add professional-history and media enrichment

Status: resolved
Label: resolved

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Extend the integrated Profile Provider mapping to include experience, education, skills, certifications, languages, images, retrieval metadata, and field availability. Preserve the provider-neutral schema and Partial Profile behavior when the Authorized Source lacks any enrichment field.

## Acceptance criteria

- [x] Experience and education are returned as structured collections with stable field semantics.
- [x] Skills, certifications, and languages are returned as structured collections when available.
- [x] Images are returned only as provider URLs with basic metadata; images are not downloaded, persisted, or base64-embedded.
- [x] Unavailable enrichment fields follow the agreed `null`/`[]` and availability metadata rules.
- [x] Metadata includes schema version and retrieval time without exposing provider internals.
- [x] Fixture tests cover complete, partial, empty-collection, malformed, and provider-limited enrichment responses.
- [x] The README’s coverage claims match the verified provider behavior.

## Blocked by

- `.scratch/linkedin-profile-api/issues/03-integrate-authorized-source.md`

## Resolution

Implemented fixture-backed enrichment mapping in the challenge LinkedIn session provider. Structured JSON-LD fields map to stable experience, education, skills, certifications, languages, and image shapes; malformed or missing entries become empty collections, while the existing Profile API supplies schema version, retrieval time, source, and field availability metadata. README and contract coverage claims now state that extraction is provider-shape dependent. No images are downloaded or persisted.
