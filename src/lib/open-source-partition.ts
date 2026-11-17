// Splits the fetched pull requests between the "My open-source projects" section and the contributions section.
// Pure: it reads nothing and imports nothing at runtime, so `node --test` can load it by its .ts path. It fails
// closed: input it cannot read with certainty throws instead of reaching the page.
import type {
  Contribution,
  CuratedFile,
  CuratedMember,
  ListedPullRequest,
  ListedRepository,
  MemberDetail,
  OpenSourcePullRequest,
  OpenSourceRepository,
  Partition,
  PartitionInput,
} from "../app/open-source-contributions/types";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const REPOSITORY_PATTERN = /^[^/\s]+\/[^/\s]+$/;
const CARD_COUNT = 4;

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
  if (!Array.isArray(curated.groups)) fail("the curated file has no groups list");
  const groupIds = new Set<string>();
  for (const group of curated.groups) {
    if (!isObject(group) || typeof group.id !== "string") fail("a curated group has no id");
    groupIds.add(group.id);
  }
  for (const member of curated.members) {
    if (!isObject(member)) fail("a curated member is not an object");
    const slug = checkSlug(member.slug, "a curated member");
    if (member.kind !== "project") fail(`the member ${slug} has kind ${JSON.stringify(member.kind)}, not "project"`);
    if (member.display !== "card" && member.display !== "row") fail(`the member ${slug} has no display "card" or "row"`);
    if (typeof member.name !== "string" || typeof member.summary !== "string" || typeof member.url !== "string") {
      fail(`the member ${slug} lacks its name, summary or url`);
    }
    if (!Array.isArray(member.repositories) || member.repositories.length === 0) fail(`the member ${slug} lists no repository`);
    for (const repository of member.repositories) {
      if (typeof repository !== "string" || !REPOSITORY_PATTERN.test(repository)) {
        fail(`the member ${slug} lists ${JSON.stringify(repository)}, which is not owner/repo`);
      }
    }
    if (member.group !== undefined && !groupIds.has(member.group as string)) {
      fail(`the member ${slug} names the unknown group ${JSON.stringify(member.group)}`);
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

  // Cards: exactly four, in cardOrder; a row whose tracked issues are all closed becomes a card after them.
  const cardMembers = curated.members.filter((member) => member.display === "card");
  if (cardMembers.length !== CARD_COUNT) fail(`${cardMembers.length} members are cards, not ${CARD_COUNT}`);
  const orders = cardMembers.map((member) => member.cardOrder);
  for (let order = 1; order <= CARD_COUNT; order++) {
    if (orders.filter((value) => value === order).length !== 1) fail(`no single card has cardOrder ${order}`);
  }
  const isPromoted = (member: CuratedMember) =>
    member.display === "row" &&
    Array.isArray(member.promoteToCardWhenClosed) &&
    member.promoteToCardWhenClosed.length > 0 &&
    member.promoteToCardWhenClosed.every((key) => data.issueStates[key]?.closed === true);
  const cards = [
    ...[...cardMembers].sort((a, b) => (a.cardOrder ?? 0) - (b.cardOrder ?? 0)),
    ...curated.members.filter(isPromoted),
  ].map((member) => ({ slug: member.slug }));
  const cardSlugs = new Set(cards.map((card) => card.slug));

  // Rows: every other member, in curated order; the members of a group form one row where the first of them stands.
  const rows: Partition["rows"] = [];
  const groupRows = new Map<string, { kind: "group"; id: string; slugs: string[] }>();
  for (const member of curated.members) {
    if (cardSlugs.has(member.slug)) continue;
    if (member.group !== undefined) {
      let row = groupRows.get(member.group);
      if (!row) {
        row = { kind: "group", id: member.group, slugs: [] };
        groupRows.set(member.group, row);
        rows.push(row);
      }
      row.slugs.push(member.slug);
    } else {
      rows.push({ kind: "member", slug: member.slug });
    }
  }

  // Pull requests: a member's page lists every one of its repositories; the contributions section lists only work
  // another maintainer owns and reviewed, where all five rules hold:
  // (a) the repository is no member repository; (b) its owner is not the contributor; (c) its owner is not one of his
  // organisations; (d) it is public; (e) when merged, someone other than the contributor merged it.
  const memberRepositories = new Map<string, ListedRepository[]>();
  const contributions: Contribution[] = [];
  let excludedOwnOrganisation = 0;
  for (const project of data.projects) {
    const shownRepositories: ListedRepository[] = [];
    for (const repository of project.repositories) {
      const member = memberByRepository.get(repository.name.toLowerCase());
      if (member) {
        const entry = listed(repository, repository.pullRequests);
        if (entry.pullRequests.length > 0) {
          memberRepositories.set(member.slug, [...(memberRepositories.get(member.slug) ?? []), entry]);
        }
        continue;
      }
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

  // Pages: one per member and one per contribution, never two on one slug.
  const pages: Partition["pages"] = [
    ...curated.members.map((member) => ({ slug: member.slug, section: "member" as const })),
    ...contributions.map((contribution) => ({ slug: contribution.slug, section: "contribution" as const })),
  ];
  const seen = new Set<string>();
  for (const page of pages) {
    if (seen.has(page.slug)) fail(`two pages take the slug ${page.slug}`);
    seen.add(page.slug);
  }

  const members: Record<string, MemberDetail> = {};
  for (const member of curated.members) {
    members[member.slug] = { member, repositories: memberRepositories.get(member.slug) ?? [] };
  }

  return { cards, rows, contributions, pages, members, excludedOwnOrganisation };
}
