export async function fakeProfileProvider(profileUrl) {
  return {
    identity: { name: "Example Profile", profileUrl },
    headline: "Example professional profile",
    location: null,
    about: null,
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    images: [],
    source: "fake"
  };
}
