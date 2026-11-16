export const SITE_URL = "https://alexey-pelykh.com";

// Profiles listed both as JSON-LD `sameAs` and as `<link rel="me">`.
export const SOCIAL_PROFILES = [
  "https://github.com/alexey-pelykh",
  "https://linkedin.com/in/alexey-pelykh",
  "https://bsky.app/profile/alexey-pelykh.com",
  "https://x.com/alexey_pelykh",
  "https://dev.to/alexey-pelykh",
  "https://www.toptal.com/developers/resume/alexey-pelykh",
] as const;

// Profiles listed only as `<link rel="me">` and kept out of `sameAs`, because the account is dormant.
export const REL_ME_ONLY_PROFILES = [
  "https://substack.com/@alexeypelykh",
] as const;

export const REL_ME_PROFILES = [...SOCIAL_PROFILES, ...REL_ME_ONLY_PROFILES] as const;

export const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Alexey Pelykh",
  url: SITE_URL,
  jobTitle: "Software Architect",
  sameAs: [...SOCIAL_PROFILES],
};
