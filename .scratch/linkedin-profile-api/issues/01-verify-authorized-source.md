# Verify and select the Authorized Source

Status: superseded
Label: wontfix

## Parent

`.scratch/linkedin-profile-api/spec.md`

## What to build

Investigate and select one Authorized Source for LinkedIn public member-profile data. Verify its terms and permitted use, authentication model, available fields, response behavior, rate limits, image behavior, and compatibility with a Cloudflare Worker. Record the selected source, configuration requirements, known coverage gaps, and any human approval required before integration.

## Acceptance criteria

- [ ] One Authorized Source is explicitly selected, or the project is blocked with the missing approval or access requirement clearly recorded.
- [ ] Terms/policy compatibility, authentication method, rate limits, field coverage, image behavior, and Worker compatibility are documented.
- [ ] No private endpoint reverse-engineering or personal LinkedIn credentials are required.
- [ ] Provider secrets and environment configuration requirements are defined without committing secret values.
- [ ] The provider’s known unavailable fields and failure modes are listed for the normalized contract.

## Blocked by

None - can start immediately

## Resolution

No Authorized Source is selected for the current challenge scope. LinkedIn official APIs require authenticated or approved access and do not satisfy anonymous arbitrary-profile lookup with the requested field coverage. Bright Data is technically compatible but its public license does not establish permission to redistribute data through a similar hosted product. See the authorized-source-research.md note and the 01-verify-authorized-source-resolution.md record; written provider authorization or a consent-based scope revision is required.
