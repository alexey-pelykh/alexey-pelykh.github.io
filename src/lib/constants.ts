export const SITE_URL = "https://alexey-pelykh.com";

export const SOCIAL_PROFILES = [
  "https://github.com/alexey-pelykh",
  "https://linkedin.com/in/alexey-pelykh",
  "https://bsky.app/profile/alexey-pelykh.bsky.social",
  "https://x.com/alexey_pelykh",
  "https://dev.to/alexeypelykh",
  "https://substack.com/@alexeypelykh",
  "https://mastodon.social/@alexey_pelykh",
] as const;

export const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Alexey Pelykh",
  url: SITE_URL,
  jobTitle: "Software Architect",
  sameAs: [...SOCIAL_PROFILES],
};
