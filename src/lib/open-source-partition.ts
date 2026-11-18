// Picks the six cards of the "My open-source projects" section from the curated file, and the pull requests the
// contributions section shows from the fetched data.
// Pure: it reads nothing and imports nothing at runtime, so `node --test` can load it by its .ts path. It fails
// closed: input it cannot read with certainty throws instead of reaching the page.
import type {
  Contribution,
  CuratedCard,
  CuratedFile,
  CuratedMember,
  ListedPullRequest,
  ListedRepository,
  OpenSourcePullRequest,
  OpenSourceRepository,
  Partition,
  PartitionInput,
} from "../app/open-source-contributions/types";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const REPOSITORY_PATTERN = /^[^/\s]+\/[^/\s]+$/;
const CARD_COUNT = 6;
const CARD_ONLY_KEYS = ["url", "summary", "caveat", "upstream"] as const;

function fail(message: string): never {
  throw new Error(`open-source partition: ${message}`);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function checkSlug(slug: unknown, label: string): string {
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    fail(`${label} has the slug ${JSON.stringify(slug)}, which does not match ${SLUG_PATTERN}`);
  }
  return slug;
}

function checkCurated(curated: unknown): CuratedFile {
  if (!isObject(curated)) fail("the curated file is missing or not an object");
  if (!Array.isArray(curated.members)) fail("the curated file has no members list");
  for (const member of curated.members) {
    if (!isObject(member)) fail("a curated member is not an object");
    const slug = checkSlug(member.slug, "a curated member");
    if (member.kind !== "project") fail(`the member ${slug} has kind ${JSON.stringify(member.kind)}, not "project"`);
    if (typeof member.name !== "string") fail(`the member ${slug} lacks its name`);
    if (!Array.isArray(member.repositories) || member.repositories.length === 0) fail(`the member ${slug} lists no repository`);
    for (const repository of member.repositories) {
      if (typeof repository !== "string" || !REPOSITORY_PATTERN.test(repository)) {
        fail(`the member ${slug} lists ${JSON.stringify(repository)}, which is not owner/repo`);
      }
    }
    if (member.cardOrder === undefined) {
      // Only a card shows text, so text on any other member would be text no page shows.
      for (const key of CARD_ONLY_KEYS) {
        if (key in member) fail(`the member ${slug} is no card and holds ${key}`);
      }
      continue;
    }
    if (typeof member.url !== "string" || !/^https:\/\//.test(member.url) || typeof member.summary !== "string") {
      fail(`the card ${slug} lacks its https url or its summary`);
    }
  }
  return curated as unknown as CuratedFile;
}

function checkData(data: unknown, contributor: string) {
  if (!isObject(data)) fail("the fetched data is missing or not an object");
  if (!Array.isArray(data.projects)) fail("the fetched data has no projects list");
  if (!isObject(data.issueStates)) fail("the fetched data has no issueStates");
  if (typeof data.contributor === "string" && data.contributor.toLowerCase() !== contributor.toLowerCase()) {
    fail(`the fetched data belongs to ${data.contributor}, not ${contributor}`);
  }
  // A failure names a repository by its position, never by its name: the build log of a public repository is public,
  // and the data holds repositories the pages never show.
  for (const [projectIndex, project] of data.projects.entries()) {
    if (!isObject(project) || !Array.isArray(project.repositories)) fail("a fetched project has no repositories list");
    for (const [repositoryIndex, repository] of project.repositories.entries()) {
      const at = `projects[${projectIndex}].repositories[${repositoryIndex}]`;
      if (!isObject(repository) || typeof repository.name !== "string" || !REPOSITORY_PATTERN.test(repository.name)) {
        fail("a fetched repository has no owner/repo name");
      }
      if (!Array.isArray(repository.pullRequests)) fail(`the fetched repository at ${at} has no pull requests list`);
      for (const pullRequest of repository.pullRequests) {
        if (!isObject(pullRequest) || typeof pullRequest.number !== "number" || typeof pullRequest.url !== "string" ||
          typeof pullRequest.title !== "string" || typeof pullRequest.merged !== "boolean") {
          fail(`a fetched pull request of the repository at ${at} lacks its number, url, title or merged flag`);
        }
      }
    }
  }
  return data as unknown as PartitionInput["data"];
}

function ownerOf(repository: OpenSourceRepository): string {
  return typeof repository.owner === "string" && repository.owner ? repository.owner : repository.name.split("/")[0];
}

// "Merged" or "Open", or undefined for a pull request closed without a merge, which no section shows.
function statusOf(pullRequest: OpenSourcePullRequest): ListedPullRequest["status"] | undefined {
  if (pullRequest.merged) return "Merged";
  return pullRequest.state === "CLOSED" ? undefined : "Open";
}

function newestFirst(a: ListedPullRequest, b: ListedPullRequest): number {
  return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
}

function listed(repository: OpenSourceRepository, pullRequests: OpenSourcePullRequest[]): ListedRepository {
  const items: ListedPullRequest[] = [];
  for (const pullRequest of pullRequests) {
    const status = statusOf(pullRequest);
    if (status === undefined) continue;
    items.push({
      number: pullRequest.number,
      url: pullRequest.url,
      title: pullRequest.title,
      status,
      createdAt: pullRequest.createdAt,
      mergedAt: pullRequest.mergedAt ?? null,
    });
  }
  items.sort(newestFirst);
  return {
    name: repository.name,
    title: repository.title,
    description: repository.description ?? null,
    url: repository.url,
    pullRequests: items,
  };
}

export function partition(input: PartitionInput): Partition {
  if (!isObject(input)) fail("no input");
  const { isOwnOrganisation, contributor } = input;
  if (typeof isOwnOrganisation !== "function") fail("no isOwnOrganisation function");
  if (typeof contributor !== "string" || !contributor) fail("no contributor");
  const curated = checkCurated(input.curated);
  const data = checkData(input.data, contributor);
  const me = contributor.toLowerCase();

  // Members: each repository belongs to one member at most.
  const memberByRepository = new Map<string, CuratedMember>();
  for (const member of curated.members) {
    for (const repository of member.repositories) {
      const key = repository.toLowerCase();
      const holder = memberByRepository.get(key);
      if (holder) fail(`${repository} is listed by both ${holder.slug} and ${member.slug}`);
      memberByRepository.set(key, member);
    }
  }

  // Cards: exactly six, in cardOrder. Every other member is listed only to keep its repositories out of the
  // contributions section, and shows nowhere.
  const cards = curated.members.filter((member): member is CuratedCard => member.cardOrder !== undefined);
  if (cards.length !== CARD_COUNT) fail(`${cards.length} members are cards, not ${CARD_COUNT}`);
  for (let order = 1; order <= CARD_COUNT; order++) {
    if (cards.filter((card) => card.cardOrder === order).length !== 1) fail(`no single card has cardOrder ${order}`);
  }
  cards.sort((a, b) => a.cardOrder - b.cardOrder);

  // Pull requests: the contributions section lists only work another maintainer owns and reviewed, where all five
  // rules hold:
  // (a) the repository is no member repository; (b) its owner is not the contributor; (c) its owner is not one of his
  // organisations; (d) it is public; (e) when merged, someone other than the contributor merged it.
  const contributions: Contribution[] = [];
  let excludedOwnOrganisation = 0;
  for (const project of data.projects) {
    const shownRepositories: ListedRepository[] = [];
    for (const repository of project.repositories) {
      if (memberByRepository.has(repository.name.toLowerCase())) continue;
      const owner = ownerOf(repository);
      const contributorOwned = owner.toLowerCase() === me;
      const ownOrganisation = isOwnOrganisation(owner) === true;
      const isPrivate = repository.isPrivate !== false;
      const shown: OpenSourcePullRequest[] = [];
      for (const pullRequest of repository.pullRequests) {
        const selfMerged = pullRequest.merged && typeof pullRequest.mergedBy === "string" && pullRequest.mergedBy.toLowerCase() === me;
        if (contributorOwned || isPrivate || selfMerged) continue;
        if (ownOrganisation) {
          // Counted only when the section would otherwise show it: a pull request closed without a merge never shows.
          if (statusOf(pullRequest) !== undefined) excludedOwnOrganisation++;
          continue;
        }
        shown.push(pullRequest);
      }
      const entry = listed(repository, shown);
      if (entry.pullRequests.length > 0) shownRepositories.push(entry);
    }
    if (shownRepositories.length > 0) {
      contributions.push({
        slug: checkSlug(project.slug, `the fetched project ${JSON.stringify(project.title)}`),
        title: project.title,
        description: project.description ?? null,
        url: project.url,
        repositories: shownRepositories,
      });
    }
  }

  // Pages: one per contribution, never two on one slug. No member has a page.
  const pages: Partition["pages"] = contributions.map((contribution) => ({ slug: contribution.slug }));
  const seen = new Set<string>();
  for (const page of pages) {
    if (seen.has(page.slug)) fail(`two pages take the slug ${page.slug}`);
    seen.add(page.slug);
  }

  return { cards, contributions, pages, excludedOwnOrganisation };
}
