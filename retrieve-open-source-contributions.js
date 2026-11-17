const { createHash } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN environment variable is not set");
  process.exit(1);
}

const GITHUB_GRAPHQL_ENDPOINT = process.env.GITHUB_GRAPHQL_ENDPOINT || "https://api.github.com/graphql";

// Pull requests removed from the data entirely. Only pull requests whose sole change adds one of the owner's own projects
// to a third-party list or directory belong here.
const EXCLUDED_PULL_REQUESTS = [
  "appcypher/awesome-mcp-servers#774",
  "punkpeye/awesome-mcp-servers#2169",
  "MunGell/awesome-for-beginners#1905",
  "up-for-grabs/up-for-grabs.net#5558",
];
const EXCLUDED_PULL_REQUEST_KEYS = new Set(EXCLUDED_PULL_REQUESTS.map((key) => key.toLowerCase()));

// The exclusion key a pull request matches, lowercased, or undefined when it matches none.
function exclusionKeyOf(pullRequest) {
  const key = `${pullRequest.repository.owner.login}/${pullRequest.repository.name}#${pullRequest.number}`.toLowerCase();
  return EXCLUDED_PULL_REQUEST_KEYS.has(key) ? key : undefined;
}

// The issues whose state the page reads at build time, from the curated file's promoteToCardWhenClosed lists. Only
// whether each one is closed is stored, never its title, body or labels.
const CURATED_PATH = path.join(__dirname, "src", "content", "open-source-projects.json");

async function readTrackedIssueKeys() {
  const curated = JSON.parse(await fs.readFile(CURATED_PATH, "utf8"));
  const keys = new Set();
  for (const member of curated.members) {
    for (const key of member.promoteToCardWhenClosed ?? []) {
      if (!/^[^/\s#]+\/[^/\s#]+#[0-9]+$/.test(key)) {
        throw new Error(`Malformed issue key in ${path.relative(__dirname, CURATED_PATH)}: ${key}`);
      }
      keys.add(key);
    }
  }
  return [...keys];
}

// Whether an owner is one of the contributor's own organisations, by the SHA-256 hashes of their lowercase logins in
// the curated file, whose list names none of them.
async function readIsOwnOrganisation() {
  const curated = JSON.parse(await fs.readFile(CURATED_PATH, "utf8"));
  const hashes = new Set(curated.ownOrganisationSha256 ?? []);
  return (owner) => hashes.has(createHash("sha256").update(owner.toLowerCase()).digest("hex"));
}

async function fetchIssueStates(keys) {
  const issueStates = {};
  for (const key of keys) {
    const [, owner, name, number] = key.match(/^([^/]+)\/([^#]+)#([0-9]+)$/);
    const response = await query(issueStateQuery, { owner, name, number: Number(number) });
    const issue = response.data.repository?.issueOrPullRequest;
    if (!issue || typeof issue.closed !== "boolean") {
      throw new Error(`Could not read whether ${key} is closed`);
    }
    issueStates[key] = { closed: issue.closed };
  }
  return issueStates;
}

const issueStateQuery = `
  query ($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      issueOrPullRequest(number: $number) {
        ... on Issue {
          closed
        }
        ... on PullRequest {
          closed
        }
      }
    }
  }
`;

const contributorQuery = `
  query {
    viewer {
      login
    }
  }
`;

const pullRequestsChunkQuery = `
  query ($from: DateTime, $to: DateTime, $cursor: String) {
    viewer {
      contributionsCollection(
        from: $from
        to: $to
      ) {
        pullRequestContributions(
          orderBy: { direction: DESC }
          first: 25
          after: $cursor
        ) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            pullRequest {
              number
              title
              permalink
              merged
              mergedBy {
                login
              }
              closed
              state
              createdAt
              mergedAt
              closedAt
              author {
                login
              }
              repository {
                name
                description
                url
                isPrivate
                owner {
                  login
                  url
                  ... on Organization {
                    name
                    description
                  }
                  ... on User {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function query(query, variables = undefined) {
  // GitHub's GraphQL endpoint answers some pages with a transient 5xx, or with a 200 whose body is cut off, and a
  // request can fail before any response arrives; retry all three with a growing delay.
  const maxAttempts = 6;
  let json;
  for (let attempt = 1; ; attempt++) {
    let response;
    let failure;
    try {
      response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });
    } catch (error) {
      failure = `network error (${error.cause?.message ?? error.message})`;
    }
    if (response === undefined) {
      // failure is set above
    } else if (response.ok) {
      try {
        json = await response.json();
        break;
      } catch (error) {
        failure = `unreadable response body (${error.message})`;
      }
    } else if (response.status < 500) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP error: ${response.status}${text ? `: ${text}` : ""}`);
    } else {
      failure = `HTTP error: ${response.status}`;
    }
    if (attempt >= maxAttempts) {
      throw new Error(failure);
    }
    console.log(`${failure}, retrying (attempt ${attempt} of ${maxAttempts})...`);
    await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
  }
  if (json.errors) {
    // An error message can name an organisation or a repository, and a CI log of a public repository is public.
    console.error("GraphQL errors:", process.env.CI ? json.errors.map((error) => error.type ?? "unknown type") : json.errors);
    throw new Error("Error in GraphQL query");
  }
  return json;
}

function slugOf(text) {
  return text
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

async function fetchPullRequests() {
  // A CI log of a public repository is public, so under CI the progress and check lines give counts and name no
  // owner or repository that is not already in a committed file. A 4xx error keeps GitHub's response body.
  const inCi = Boolean(process.env.CI);

  const trackedIssueKeys = await readTrackedIssueKeys();

  const contributorResponse = await query(contributorQuery);
  const contributor = contributorResponse.data.viewer.login;
  console.log(`Contributor: ${contributor}`);

  const now = new Date();
  const sinceThreshold = new Date(Date.UTC(2010, 0, 1));
  const pullRequests = [];
  const pullRequestsByRepositorySlug = {};
  let skippedPrivate = 0;
  let skippedExcluded = 0;
  const matchedExclusionKeys = new Set();
  let pullRequestsCursor = undefined;
  for (
    let until = new Date(Date.UTC(now.getFullYear() + 1, 0, 1)), since = new Date(Date.UTC(now.getFullYear(), 0, 1));
    since >= sinceThreshold;
    until = since, since = new Date(Date.UTC(since.getFullYear() - 1, 0, 1))
  ) {
    console.log(`Fetching pull-requests from ${since.toISOString()} to ${until.toISOString()}...`);
    pullRequestsCursor = undefined;
    for (;;) {
      const pullRequestsChunkResponse = await query(pullRequestsChunkQuery, {
        from: since.toISOString(),
        to: until.toISOString(),
        cursor: pullRequestsCursor,
      });
      const pullRequestsChunk = pullRequestsChunkResponse.data.viewer.contributionsCollection.pullRequestContributions;
      console.log(`Fetched ${pullRequestsChunk.nodes.length} of ${pullRequestsChunk.totalCount} pull-requests...`);

      for (const node of pullRequestsChunk.nodes) {
        const pullRequest = node.pullRequest;

        // Skip the unmerged-but-closed pull requests
        if (!pullRequest.merged && pullRequest.closed) {
          continue;
        }

        // Pull requests the contributor merged himself are kept, so each of his projects' pages can list them. The
        // contributions section leaves them out at build time (src/lib/open-source-partition.ts).

        // Skip the pull requests not authored by the contributor
        if (pullRequest.author?.login !== contributor) {
          continue;
        }

        // Skip the OCA's UPD pull requests
        if (pullRequest.repository.owner.login === "OCA" && pullRequest.title.includes("[UPD]")) {
          continue;
        }

        // Skip the pull requests in private repositories, so their titles never reach the public page
        if (pullRequest.repository.isPrivate) {
          skippedPrivate++;
          continue;
        }

        // Skip the pull requests excluded by hand
        const exclusionKey = exclusionKeyOf(pullRequest);
        if (exclusionKey !== undefined) {
          skippedExcluded++;
          matchedExclusionKeys.add(exclusionKey);
          continue;
        }

        // Skip this repository's pull requests
        if (pullRequest.repository.name === "alexey-pelykh.github.io" && pullRequest.repository.owner.login === "alexey-pelykh") {
          continue;
        }

        pullRequests.push(pullRequest);

        const repositorySlug = `${pullRequest.repository.owner.login}/${pullRequest.repository.name}`;
        if (!(repositorySlug in pullRequestsByRepositorySlug)) {
          pullRequestsByRepositorySlug[repositorySlug] = [];
        }
        pullRequestsByRepositorySlug[repositorySlug].push(pullRequest);
      }

      if (!pullRequestsChunk.pageInfo.hasNextPage) {
        break;
      }
      pullRequestsCursor = pullRequestsChunk.pageInfo.endCursor;
    }
  }
  console.log(`Skipped ${skippedPrivate} pull requests in private repositories`);
  console.log(`Skipped ${skippedExcluded} pull requests named by an exclusion key in EXCLUDED_PULL_REQUESTS`);
  for (const key of EXCLUDED_PULL_REQUESTS) {
    if (!matchedExclusionKeys.has(key.toLowerCase())) {
      console.warn(`Warning: the exclusion key ${key} in EXCLUDED_PULL_REQUESTS matched no pull request`);
    }
  }
  console.log(`Processing ${pullRequests.length} pull requests...`);

  // Fail when an owner whose pull requests were merged before has none now. GitHub can leave an organization's
  // contributions out of contributionsCollection for a token without any error, and the page then silently loses
  // that project. A merged pull request does not go away, so a missing owner means the fetch lost it. Only a pull
  // request someone other than the contributor merged counts, as it did while the fetch skipped the others.
  const expectedOwners = JSON.parse(
    await fs.readFile(path.join(__dirname, "expected-contribution-owners.json"), "utf8"),
  );
  const ownersWithMergedPullRequests = new Set(
    pullRequests
      .filter((pullRequest) => pullRequest.merged && pullRequest.mergedBy?.login !== contributor)
      .map((pullRequest) => pullRequest.repository.owner.login.toLowerCase()),
  );
  const missingOwners = expectedOwners.filter((owner) => !ownersWithMergedPullRequests.has(owner.toLowerCase()));
  if (missingOwners.length > 0) {
    throw new Error(
      `No pull request merged by someone else found for ${missingOwners.join(", ")}, listed in expected-contribution-owners.json. ` +
        "Check what the token can see before removing an owner from that file.",
    );
  }
  const expectedOwnerKeys = new Set(expectedOwners.map((owner) => owner.toLowerCase()));
  // His own organisations are left out, so following this line never writes one of their logins into that public
  // file.
  const isOwnOrganisation = await readIsOwnOrganisation();
  const unlistedOwners = [...ownersWithMergedPullRequests].filter(
    (owner) => !expectedOwnerKeys.has(owner) && !isOwnOrganisation(owner),
  );
  if (unlistedOwners.length > 0) {
    console.log(
      `Owners with pull requests merged by someone else, not yet in expected-contribution-owners.json: ${inCi ? unlistedOwners.length : unlistedOwners.join(", ")}`,
    );
  }

  const issueStates = await fetchIssueStates(trackedIssueKeys);

  const repositoryOwnerByLogin = {};
  const repositoryBySlug = {};
  const repositoryNamesByOwner = {};
  for (const pullRequest of pullRequests) {
    const repository = pullRequest.repository;

    const repositorySlug = `${repository.owner.login}/${repository.name}`;
    repositoryBySlug[repositorySlug] = repository;

    repositoryNamesByOwner[repository.owner.login] = [
      ...new Set([...(repositoryNamesByOwner[repository.owner.login] || []), repository.name]),
    ];

    repositoryOwnerByLogin[repository.owner.login] = repository.owner;
  }

  // One project per repository of an individual, and one per organization, titled as before so the pages of the
  // contributions keep their slugs.
  const projects = [];
  for (const repositoryOwner of Object.keys(repositoryNamesByOwner)) {
    const repositoryNames = repositoryNamesByOwner[repositoryOwner];
    const owner = repositoryOwnerByLogin[repositoryOwner];
    const ownerName = owner.name || owner.login;
    const isOrganization = owner.description !== undefined;

    if (repositoryNames.length === 1) {
      const repositoryName = repositoryNames[0];
      const repository = repositoryBySlug[`${repositoryOwner}/${repositoryName}`];

      let title;
      let description = repository.description;
      if (repositoryName.includes(repositoryOwner)) {
        title = repository.name;
      } else if (repositoryOwner.includes(repositoryName)) {
        title = ownerName;
        description = owner.description;
      } else if (isOrganization) {
        title = `${ownerName} - ${repository.name}`;
      } else {
        title = repository.name;
      }
      projects.push({ owner: repositoryOwner, title, description, url: repository.url, repositoryNames });
    } else if (!isOrganization) {
      for (const repositoryName of repositoryNames) {
        const repository = repositoryBySlug[`${repositoryOwner}/${repositoryName}`];
        projects.push({
          owner: repositoryOwner,
          title: repository.name,
          description: repository.description,
          url: repository.url,
          repositoryNames: [repositoryName],
        });
      }
    } else {
      projects.push({
        owner: repositoryOwner,
        title: ownerName,
        description: owner.description,
        url: owner.url,
        repositoryNames,
      });
    }
  }

  // Give every project its own slug. When two projects would share one, such as two repositories of one name owned
  // by different accounts, the one owned by someone other than the contributor keeps the plain slug, and the others
  // take their owner's login as a suffix.
  const projectsBySlug = new Map();
  for (const project of projects) {
    const slug = slugOf(project.title);
    projectsBySlug.set(slug, [...(projectsBySlug.get(slug) ?? []), project]);
  }
  const usedSlugs = new Set();
  const slugByProject = new Map();
  const ordered = [...projectsBySlug.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  for (const [slug, candidates] of ordered) {
    const sorted = [...candidates].sort((a, b) => {
      const aMine = a.owner.toLowerCase() === contributor.toLowerCase() ? 1 : 0;
      const bMine = b.owner.toLowerCase() === contributor.toLowerCase() ? 1 : 0;
      return aMine - bMine || a.owner.toLowerCase().localeCompare(b.owner.toLowerCase());
    });
    sorted.forEach((project, index) => {
      if (index === 0 && !usedSlugs.has(slug)) {
        slugByProject.set(project, slug);
        usedSlugs.add(slug);
        return;
      }
      let candidate = `${slug}-${slugOf(project.owner)}`;
      for (let suffix = 2; usedSlugs.has(candidate) || projectsBySlug.has(candidate); suffix++) {
        candidate = `${slug}-${slugOf(project.owner)}-${suffix}`;
      }
      slugByProject.set(project, candidate);
      usedSlugs.add(candidate);
    });
  }

  if (inCi) {
    console.log(`Open-source contributions: ${projects.length} projects, ${pullRequests.length} pull requests`);
  } else {
    console.log("Open-source Contributions:");
  }
  const projectContributions = [];
  for (const project of projects) {
    const projectSlug = slugByProject.get(project);
    if (!inCi) {
      console.log(`- [${projectSlug}] ${project.title} (${project.url}): ${project.description}`);
    }

    const projectContribution = {
      title: project.title,
      description: project.description,
      url: project.url,
      slug: projectSlug,
      repositories: [],
    };

    for (const repositoryName of project.repositoryNames) {
      const repositorySlug = `${project.owner}/${repositoryName}`;
      const repository = repositoryBySlug[repositorySlug];
      if (!inCi) {
        console.log(`  - [${repositorySlug}]`);
      }

      const repositoryContribution = {
        name: repositorySlug,
        owner: project.owner,
        title: repository.name,
        description: repository.description,
        url: repository.url,
        isPrivate: repository.isPrivate,
        pullRequests: [],
      };

      for (const pullRequest of pullRequestsByRepositorySlug[repositorySlug]) {
        if (!inCi) {
          console.log(`    - ${pullRequest.permalink}`);
        }

        repositoryContribution.pullRequests.push({
          number: pullRequest.number,
          title: pullRequest.title,
          url: pullRequest.permalink,
          merged: pullRequest.merged,
          state: pullRequest.state,
          createdAt: pullRequest.createdAt,
          mergedAt: pullRequest.mergedAt ?? null,
          closedAt: pullRequest.closedAt ?? null,
          mergedBy: pullRequest.mergedBy?.login ?? null,
        });
      }

      projectContribution.repositories.push(repositoryContribution);
    }

    projectContributions.push(projectContribution);
  }

  const openSourceContributions = {
    contributor,
    issueStates,
    projects: projectContributions,
  };
  await fs.writeFile("open-source-contributions.json", JSON.stringify(openSourceContributions, null, 2));
}

fetchPullRequests().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
