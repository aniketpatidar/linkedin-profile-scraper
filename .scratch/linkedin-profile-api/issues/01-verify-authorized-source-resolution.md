# Ticket 01 resolution: Authorized Source blocked

Status: blocked
Label: needs-info

## Parent

`.scratch/linkedin-profile-api/spec.md`

## Finding

No Authorized Source is selected. LinkedIn’s official API requires member authorization and approved access, and does not support the challenge’s anonymous arbitrary-profile lookup with the requested breadth of fields. Bright Data offers technically suitable URL-based structured extraction, but its public license restricts distribution for similar or competitive products, so it cannot be accepted without written authorization for this exact hosted API use.

## Evidence

See `.scratch/linkedin-profile-api/authorized-source-research.md` for primary-source citations and the detailed comparison.

## Required next step

Obtain written provider authorization covering lookup, redistribution, intended use, retention/deletion, images, rate limits, and field coverage; otherwise revise the product to an authenticated-member, consent-based profile API.
