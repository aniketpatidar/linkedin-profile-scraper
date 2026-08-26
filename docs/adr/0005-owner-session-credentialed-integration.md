# Use an owner-session credentialed integration

Status: accepted

For this limited-use deployment, the implementation may use the owner’s LinkedIn session through a backend-only integration. This supersedes the production-oriented restriction in ADR-0001 for this deployment only; credentials must remain deployment-managed, the service must not accept user passwords, and the README must disclose the narrow scope, risks, and known limitations.

## Consequences

The implementation must not be presented as a generally authorized LinkedIn data product. It is limited to the configured deployment and the owner’s account, with no credential sharing, credential commitment, or expansion to arbitrary users without a separate authorization review.
