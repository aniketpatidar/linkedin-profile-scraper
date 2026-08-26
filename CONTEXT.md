# LinkedIn Profile API

This context defines the language for retrieving publicly usable LinkedIn profile information through an API.

## Access and data

**Authorized Source**:
A source that explicitly permits the application to obtain and return LinkedIn profile data, such as an applicable official API or licensed provider.
_Avoid_: Scraper, reverse-engineered endpoint

**Profile**:
The structured representation of one LinkedIn member's available professional information returned by this API.
_Avoid_: Account, page

**Public Member Profile**:
A LinkedIn member profile identified by a publicly shareable `/in/{public-identifier}` URL and requestable without caller-supplied LinkedIn authentication.
_Avoid_: Company profile, private profile, recruiter profile

**Profile URL**:
The normalized LinkedIn URL supplied to identify a Public Member Profile.
_Avoid_: LinkedIn link, page URL

**Partial Profile**:
A Profile for which its data source returned some fields but not all requested fields; unavailable fields are represented explicitly rather than causing the request to fail.
_Avoid_: Incomplete response, empty profile

**Profile Provider**:
The replaceable integration boundary through which the API obtains a Profile from a data source.
_Avoid_: Scraper, provider payload

**Owner Session Integration**:
A Profile retrieval path using the owner’s own LinkedIn session and limited to the configured deployment; it is not intended as a general production data service.
_Avoid_: Authorized Source, public scraper

**Owner Credentials**:
Authentication secrets belonging to the operator and used only by the Owner Session Integration; they are never shared with callers or committed to the repository.
_Avoid_: User credentials, caller password
