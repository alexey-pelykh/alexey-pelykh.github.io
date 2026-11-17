// The fetched data, data/open-source-contributions.json, as retrieve-open-source-contributions.js writes it.

export type OpenSourcePullRequest = {
  number: number;
  title: string;
  url: string;
  merged: boolean;
  state: "OPEN" | "MERGED" | "CLOSED";
  createdAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  mergedBy: string | null;
};

export type OpenSourceRepository = {
  name: string;
  owner: string;
  title: string;
  description: string | null;
  url: string;
  isPrivate: boolean;
  pullRequests: OpenSourcePullRequest[];
};

export type OpenSourceProject = {
  title: string;
  description: string | null;
  url: string;
  slug: string;
  repositories: OpenSourceRepository[];
};

export type OpenSourceContributions = {
  contributor: string;
  issueStates: Record<string, { closed: boolean }>;
  projects: OpenSourceProject[];
};

// The curated file, src/content/open-source-projects.json.

export type CuratedMember = {
  slug: string;
  name: string;
  kind: string;
  display: "card" | "row";
  cardOrder?: number;
  repositories: string[];
  url: string;
  years?: string;
  summary: string;
  caveat?: string;
  upstream?: string;
  group?: string;
  promoteToCardWhenClosed?: string[];
};

export type CuratedGroup = {
  id: string;
  label: string;
  url: string;
};

export type NotableDescriptionPart = string | { text: string; url: string };

export type CuratedNotable =
  | { member: string; description: string }
  | { name: string; url: string; description: string | NotableDescriptionPart[] };

export type CuratedFile = {
  ownOrganisationSha256: string[];
  groups: CuratedGroup[];
  members: CuratedMember[];
  notable: CuratedNotable[];
};

// What partition() returns.

export type PullRequestStatus = "Merged" | "Open";

export type ListedPullRequest = {
  number: number;
  url: string;
  title: string;
  status: PullRequestStatus;
  createdAt: string;
  mergedAt: string | null;
};

export type ListedRepository = {
  name: string;
  title: string;
  description: string | null;
  url: string;
  pullRequests: ListedPullRequest[];
};

export type MemberRow = { kind: "member"; slug: string };
export type GroupRow = { kind: "group"; id: string; slugs: string[] };

export type Contribution = {
  slug: string;
  title: string;
  description: string | null;
  url: string;
  repositories: ListedRepository[];
};

export type MemberDetail = {
  member: CuratedMember;
  // The repositories of the member that hold pull requests of the contributor, each with all of them, newest first.
  repositories: ListedRepository[];
};

export type Partition = {
  cards: { slug: string }[];
  rows: (MemberRow | GroupRow)[];
  contributions: Contribution[];
  pages: { slug: string; section: "member" | "contribution" }[];
  members: Record<string, MemberDetail>;
  excludedOwnOrganisation: number;
};

export type PartitionInput = {
  curated: CuratedFile;
  data: OpenSourceContributions;
  isOwnOrganisation: (owner: string) => boolean;
  contributor: string;
};
