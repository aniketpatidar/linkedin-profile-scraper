function formatYearMonth(date) {
  if (!date || !date.year) return null;
  if (!date.month) return `${date.year}`;
  return `${date.year}-${String(date.month).padStart(2, "0")}`;
}

export function parseVoyagerDashJson(payload, profileUrl) {
  if (!payload || !payload.included) return null;

  let profileData = null;
  const experience = [];
  const education = [];
  const skills = [];
  const certifications = [];
  const languages = [];
  
  for (const item of payload.included) {
    if (item.$type === "com.linkedin.voyager.dash.identity.profile.Profile") {
      profileData = item;
    } else if (item.$type === "com.linkedin.voyager.dash.identity.profile.Position") {
      experience.push({
        company: item.companyName || null,
        title: item.title || null,
        description: item.description || null,
        startDate: formatYearMonth(item.dateRange?.start),
        endDate: formatYearMonth(item.dateRange?.end)
      });
    } else if (item.$type === "com.linkedin.voyager.dash.identity.profile.Education") {
      education.push({
        institution: item.schoolName || null,
        degree: item.degreeName || null,
        startDate: formatYearMonth(item.dateRange?.start),
        endDate: formatYearMonth(item.dateRange?.end)
      });
    } else if (item.$type === "com.linkedin.voyager.dash.identity.profile.Skill") {
      skills.push({ name: item.name });
    } else if (item.$type === "com.linkedin.voyager.identity.shared.MiniProfile" && !profileData) {
       profileData = item;
    }
  }

  if (!profileData) return null;

  const name = [profileData.firstName, profileData.lastName].filter(Boolean).join(" ") || null;
  if (!name) return null;

  const images = [];
  const picture = profileData.picture;
  if (picture && picture.rootUrl && picture.artifacts) {
    for (const artifact of picture.artifacts) {
      images.push({
        url: picture.rootUrl + artifact.fileIdentifyingUrlPathSegment,
        kind: "profile",
        width: artifact.width,
        height: artifact.height
      });
    }
  }

  return {
    identity: { name, profileUrl },
    headline: profileData.headline || profileData.occupation || null,
    location: profileData.locationName || null,
    about: profileData.summary || null,
    experience,
    education,
    skills,
    certifications,
    languages,
    images,
    source: "voyager-dash-api",
  };
}
