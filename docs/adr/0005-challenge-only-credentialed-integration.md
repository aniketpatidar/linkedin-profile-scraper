# Use a challenge-only credentialed integration

Status: accepted

To satisfy the hiring challenge’s explicit reverse-engineering scope, the implementation may use the owner’s LinkedIn credentials through a backend-only Challenge Integration. This supersedes the production-oriented restriction in ADR-0001 for this challenge effort only; credentials must remain deployment-managed, the service must not accept user passwords, and the README must disclose the narrow scope, risks, and known limitations.

## Consequences

The implementation must not be presented as a generally authorized LinkedIn data product. It is limited to the challenge deployment and the owner’s account, with no credential sharing, credential commitment, or expansion to arbitrary users without a separate authorization review.
