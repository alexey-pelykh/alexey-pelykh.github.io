const fs = require("node:fs/promises");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN environment variable is not set");
  process.exit(1);
}

const GITHUB_GRAPHQL_ENDPOINT = process.env.GITHUB_GRAPHQL_ENDPOINT || "https://api.github.com/graphql";

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
          first: 100
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
              body
              bodyHTML
              permalink
              merged
              mergedBy {
                login
              }
              closed
              author {
                login
              }
              repository {
                name
                description
                url
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
  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
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
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const json = await response.json();
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error("Error in GraphQL query");
  }
  return json;
}

async function fetchPullRequests() {
  const contributorReponse = await query(contributorQuery);
  const contributor = contributorReponse.data.viewer.login;
  console.log(`Contributor: ${contributor}`);

  const now = new Date();
  const sinceThreshold = new Date(Date.UTC(2010, 0, 1));
  const pullRequests = [];
  const pullRequestsByRepositorySlug = {};
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
          // console.log(`Skipping unmerged-but-closed pull request: ${pullRequest.permalink}`);
          continue;
        }

        // Skip the pull requests merged by the contributor
        if (pullRequest.merged && pullRequest.mergedBy && pullRequest.mergedBy.login === contributor) {
          // console.log(`Skipping pull request merged by the contributor: ${pullRequest.permalink}`);
          continue;
        }

        // Skip the pull requests not authored by the contributor
        if (pullRequest.author.login !== contributor) {
          // console.log(`Skipping pull request not authored by the contributor: ${pullRequest.permalink}`);
          continue;
        }

        // Skip the OCA's UPD pull requests
        if (pullRequest.repository.owner.login === "OCA" && pullRequest.title.includes("[UPD]")) {
          // console.log(`Skipping OCA's UPD pull request: ${pullRequest.permalink}`);
          continue;
        }

        // Skip this repository's pull requests
        if (pullRequest.repository.name === "alexey-pelykh.github.io" && pullRequest.repository.owner.login === "alexey-pelykh") {
          // console.log(`Skipping this repository's pull request: ${pullRequest.permalink}`);
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
  console.log(`Processing ${pullRequests.length} pull requests...`);

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

  const projectBySlug = {};
  const repositorySlugsByProjectSlug = {};
  for (const repositoryOwner of Object.keys(repositoryNamesByOwner)) {
    const repositoryNames = repositoryNamesByOwner[repositoryOwner];

    if (repositoryNames.length === 1) {
      const repositoryName = repositoryNames[0];
      const repositorySlug = `${repositoryOwner}/${repositoryName}`;

      let project;
      let projectSlug;
      if (repositoryName.includes(repositoryOwner)) {
        project = {
          title: repositoryBySlug[repositorySlug].name,
          description: repositoryBySlug[repositorySlug].description,
          url: repositoryBySlug[repositorySlug].url,
          repositorySlugs: [repositorySlug],
        };
      } else if (repositoryOwner.includes(repositoryName)) {
        project = {
          title: repositoryOwnerByLogin[repositoryOwner].name,
          description: repositoryOwnerByLogin[repositoryOwner].description,
          url: repositoryBySlug[repositorySlug].url,
          repositorySlugs: [repositorySlug],
        };
      } else {
        if (repositoryOwnerByLogin[repositoryOwner].description !== undefined) {
          project = {
            title: `${repositoryOwnerByLogin[repositoryOwner].name} - ${repositoryBySlug[repositorySlug].name}`,
            description: repositoryBySlug[repositorySlug].description,
            url: repositoryBySlug[repositorySlug].url,
            repositorySlugs: [repositorySlug],
          };
        } else {
          project = {
            title: repositoryBySlug[repositorySlug].name,
            description: repositoryBySlug[repositorySlug].description,
            url: repositoryBySlug[repositorySlug].url,
            repositorySlugs: [repositorySlug],
          };
        }
      }
      if (projectSlug === undefined) {
        projectSlug = project.title
          .replace(/[^a-z0-9]/gi, "-")
          .replace(/-+/g, "-")
          .toLowerCase();
      }

      if (!(projectSlug in repositorySlugsByProjectSlug)) {
        repositorySlugsByProjectSlug[projectSlug] = [];
      }
      repositorySlugsByProjectSlug[projectSlug].push(repositorySlug);

      projectBySlug[projectSlug] = project;

      continue;
    }

    if (repositoryOwnerByLogin[repositoryOwner].description === undefined) {
      // For repositories owned by individuals, create a project per repository
      for (const repositoryName of repositoryNames) {
        const repositorySlug = `${repositoryOwner}/${repositoryName}`;

        const project = {
          title: repositoryBySlug[repositorySlug].name,
          description: repositoryBySlug[repositorySlug].description,
          url: repositoryBySlug[repositorySlug].url,
          repositorySlugs: [repositorySlug],
        };
        const projectSlug = project.title
          .replace(/[^a-z0-9]/gi, "-")
          .replace(/-+/g, "-")
          .toLowerCase();

        repositorySlugsByProjectSlug[projectSlug] = [...project.repositorySlugs];

        projectBySlug[projectSlug] = project;
      }
    } else {
      // For repositories owned by organizations, create a project per organization
      const project = {
        title: repositoryOwnerByLogin[repositoryOwner].name,
        description: repositoryOwnerByLogin[repositoryOwner].description,
        url: repositoryOwnerByLogin[repositoryOwner].url,
        repositorySlugs: repositoryNames.map((repositoryName) => `${repositoryOwner}/${repositoryName}`),
      };
      const projectSlug = project.title
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-")
        .toLowerCase();

      repositorySlugsByProjectSlug[projectSlug] = [...project.repositorySlugs];

      projectBySlug[projectSlug] = project;
    }
  }

  console.log("Open-source Contributions:");
  const projectContributions = [];
  for (const projectSlug of Object.keys(projectBySlug)) {
    const project = projectBySlug[projectSlug];
    console.log(`- [${projectSlug}] ${project.title} (${project.url}): ${project.description}`);

    const projectContribution = {
      title: project.title,
      description: project.description,
      url: project.url,
      slug: projectSlug,
      repositories: [],
    };

    for (const repositorySlug of repositorySlugsByProjectSlug[projectSlug]) {
      const repository = repositoryBySlug[repositorySlug];
      console.log(`  - [${repositorySlug}]`);

      const repositoryContribution = {
        name: repositorySlug,
        title: repository.name,
        description: repository.description,
        url: repository.url,
        pullRequests: [],
      };

      for (const pullRequest of pullRequestsByRepositorySlug[repositorySlug]) {
        console.log(`    - ${pullRequest.permalink}`);

        repositoryContribution.pullRequests.push({
          number: pullRequest.number,
          title: pullRequest.title,
          description: pullRequest.bodyHTML,
          url: pullRequest.permalink,
          merged: pullRequest.merged,
        });
      }

      projectContribution.repositories.push(repositoryContribution);
    }

    projectContributions.push(projectContribution);
  }

  const openSourceContributions = {
    projects: projectContributions,
  };
  await fs.writeFile("open-source-contributions.json", JSON.stringify(openSourceContributions, null, 2));
}

fetchPullRequests().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
