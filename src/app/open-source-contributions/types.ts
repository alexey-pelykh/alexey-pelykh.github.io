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

// Every member fences its repositories out of the contributions section. Only the six members that carry cardOrder
// are shown, each as a card that links to the project's own site; the others carry no page text.
export type CuratedMember = {
  slug: string;
  name: string;
  kind: string;
  repositories: string[];
  cardOrder?: number;
  url?: string;
  summary?: string;
  caveat?: string;
  upstream?: string;
  promoteToCardWhenClosed?: string[];
};

// A member that carries cardOrder, with the fields its card reads.
export type CuratedCard = CuratedMember & { cardOrder: number; url: string; summary: string };

export type NotableDescriptionPart = string | { text: string; url: string };

export type CuratedNotable =
  | { member: string; description: string }
  | { name: string; url: string; description: string | NotableDescriptionPart[] };

export type CuratedFile = {
  ownOrganisationSha256: string[];
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

export type Contribution = {
  slug: string;
  title: string;
  description: string | null;
  url: string;
  repositories: ListedRepository[];
};

export type Partition = {
  // The six cards, in cardOrder.
  cards: CuratedCard[];
  contributions: Contribution[];
  // One page per contribution. No member has a page: each card links to the project's own site.
  pages: { slug: string }[];
  excludedOwnOrganisation: number;
};

export type PartitionInput = {
  curated: CuratedFile;
  data: OpenSourceContributions;
  isOwnOrganisation: (owner: string) => boolean;
  contributor: string;
};
