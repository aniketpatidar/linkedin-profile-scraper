# Return normalized partial profiles

Status: accepted

The public contract will use a stable normalized schema covering identity, headline, location, about, experience, education, skills, certifications, languages, images, and metadata. Missing fields produce a Partial Profile with explicit availability metadata; request-level failures use a stable error envelope and conventional HTTP statuses.
