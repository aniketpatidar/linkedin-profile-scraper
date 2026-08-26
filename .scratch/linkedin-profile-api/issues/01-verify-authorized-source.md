# Verify and select the Authorized Source

Status: ready-for-agent
Label: ready-for-agent

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
