// retrieve-open-source-contributions.js run against a local GraphQL endpoint.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assertDataShape } from "./lib/data-shape.mjs";
import { CONTRIBUTOR, EXPECTED_OWNERS_PATH, FETCH_SCRIPT_PATH, PROMOTION_KEYS, readJson } from "./lib/fixtures.mjs";
import { close, contributionsServer, listen, pullRequestNode } from "./lib/mock-graphql.mjs";

const UNMATCHED_EXCLUSION_KEY = "up-for-grabs/up-for-grabs.net#5558";
const UNLISTED_OWNER = "newowner-one";
// One of the contributor's organisations whose login is already public: its hash is in ownOrganisationSha256.
const OWN_ORGANISATION = "qontoctl";

function runScript({ endpoint, ci = false, timeoutMs = 120_000 }) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "oss-fetch-test-"));
  const env = { ...process.env, GITHUB_TOKEN: "test-token-not-a-real-token", GITHUB_GRAPHQL_ENDPOINT: endpoint };
  delete env.CI;
  if (ci) {
    env.CI = "true";
  }
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [FETCH_SCRIPT_PATH], { cwd, env });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      const dataFile = path.join(cwd, "open-source-contributions.json");
      const data = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, "utf8")) : null;
      fs.rmSync(cwd, { recursive: true, force: true });
      resolve({ code, output, lines: output.split("\n"), data });
    });
  });
}

function fixtureNodes() {
  const nodes = [];
  // One merged pull request per listed owner, merged by a maintainer, so the expected-owner check passes.
  for (const owner of readJson(EXPECTED_OWNERS_PATH)) {
    nodes.push(pullRequestNode({ owner, repo: `${owner.toLowerCase()}-lib`, number: 1, title: `Fix for ${owner}`, merged: true, mergedBy: "maintainer-one" }));
  }
  // Two pull requests in private repositories, dropped by the private-repository skip.
  nodes.push(pullRequestNode({ owner: CONTRIBUTOR, repo: "private-alpha", number: 1, title: "Private change one", isPrivate: true, ownerIsUser: true }));
  nodes.push(pullRequestNode({ owner: CONTRIBUTOR, repo: "private-beta", number: 2, title: "Private change two", isPrivate: true, ownerIsUser: true }));
  // Three pull requests named by exclusion keys; the fourth key matches nothing.
  nodes.push(pullRequestNode({ owner: "appcypher", repo: "awesome-mcp-servers", number: 774, title: "Add a server", merged: true, mergedBy: "maintainer-two" }));
  nodes.push(pullRequestNode({ owner: "punkpeye", repo: "awesome-mcp-servers", number: 2169, title: "Add a server", merged: true, mergedBy: "maintainer-two" }));
  nodes.push(pullRequestNode({ owner: "MunGell", repo: "awesome-for-beginners", number: 1905, title: "Add a project", merged: true, mergedBy: "maintainer-two" }));
  // A pull request the contributor merged into his own repository: kept now that the self-merge skip is gone.
  nodes.push(pullRequestNode({ owner: CONTRIBUTOR, repo: "pcre4j", number: 10, title: "Own merged change", merged: true, mergedBy: CONTRIBUTOR, ownerIsUser: true }));
  // An owner with a merged pull request that expected-contribution-owners.json does not list.
  nodes.push(pullRequestNode({ owner: UNLISTED_OWNER, repo: "widget", number: 5, title: "Widget fix", merged: true, mergedBy: "maintainer-three" }));
  // An open pull request, a closed-unmerged one, and one by another author.
  nodes.push(pullRequestNode({ owner: "gotosleep", repo: "JASidePanels", number: 7, title: "Open change" }));
  nodes.push(pullRequestNode({ owner: "someowner", repo: "closed-repo", number: 3, title: "Closed unmerged", closed: true }));
  nodes.push(pullRequestNode({ owner: "someowner", repo: "other-repo", number: 4, title: "Not mine", merged: true, mergedBy: "x", author: "someone-else" }));
  return nodes;
}

// Six attempts, the n-th retry about n times 5 seconds after the attempt before it.
function assertRetriedSixTimes(run, arrivals) {
  assert.notEqual(run.code, 0, "the run fails once the attempts are spent");
  assert.equal(arrivals.length, 6, `six attempts reached the endpoint:\n${run.output}`);
  for (let attempt = 1; attempt < arrivals.length; attempt++) {
    const gap = arrivals[attempt] - arrivals[attempt - 1];
    assert.ok(gap >= attempt * 5000 * 0.9, `attempt ${attempt + 1} waited ${gap} ms, at least about ${attempt * 5000} ms`);
    assert.ok(gap < attempt * 5000 + 4000, `attempt ${attempt + 1} waited ${gap} ms, about ${attempt * 5000} ms`);
  }
}

function allPullRequests(data) {
  return data.projects.flatMap((project) => project.repositories.flatMap((repository) =>
    repository.pullRequests.map((pullRequest) => ({ repository: repository.name, ...pullRequest }))));
}

test("a run logs the drop counts, warns on an unmatched key, and writes the new data shape", { timeout: 180_000 }, async () => {
  const { server, requests } = contributionsServer({ login: CONTRIBUTOR, nodes: fixtureNodes() });
  const endpoint = await listen(server);
  try {
    const run = await runScript({ endpoint });
    assert.equal(run.code, 0, `the run exits 0:\n${run.output}`);

    const privateLines = run.lines.filter((line) => /private/i.test(line) && /(?<![0-9])2(?![0-9])/.test(line));
    assert.ok(privateLines.length >= 1, `a line names the 2 pull requests the private-repository skip dropped:\n${run.output}`);
    const exclusionLines = run.lines.filter((line) => /exclu/i.test(line) && /(?<![0-9])3(?![0-9])/.test(line));
    assert.ok(exclusionLines.length >= 1, `a line names the 3 pull requests the exclusion keys dropped:\n${run.output}`);
    const warnings = run.lines.filter((line) => line.toLowerCase().includes(UNMATCHED_EXCLUSION_KEY.toLowerCase()));
    assert.ok(warnings.length >= 1, `a warning names the exclusion key that matched nothing:\n${run.output}`);

    const ownerLines = run.lines.filter((line) => line.includes("expected-contribution-owners"));
    assert.ok(ownerLines.some((line) => line.includes(UNLISTED_OWNER)), `outside CI the unlisted owner is named:\n${run.output}`);

    const contributionsQueries = requests.filter((request) => /contributionsCollection/.test(request.query));
    assert.ok(contributionsQueries.length > 0, "the run queried contributionsCollection");
    for (const request of contributionsQueries) {
      assert.match(request.query, /first:\s*25(?![0-9])/, "the page size stays 25");
      // The stand-in answers with every field whatever the query selects, so the query itself must ask for them.
      for (const field of [/mergedBy\s*\{\s*login\s*\}/, /\bcreatedAt\b/, /\bmergedAt\b/, /\bclosedAt\b/, /\bstate\b/, /\bisPrivate\b/]) {
        assert.match(request.query, field, `the contributions query selects ${field}`);
      }
    }

    assert.ok(run.data, "the run wrote open-source-contributions.json");
    assertDataShape(run.data);
    assert.equal(run.data.contributor, CONTRIBUTOR);
    const pullRequests = allPullRequests(run.data);
    const keys = pullRequests.map((pullRequest) => `${pullRequest.repository}#${pullRequest.number}`.toLowerCase());
    assert.ok(keys.includes(`${CONTRIBUTOR}/pcre4j#10`), "the self-merged pull request is kept");
    assert.ok(keys.includes("gotosleep/jasidepanels#7"), "the open pull request is kept");
    for (const dropped of [`${CONTRIBUTOR}/private-alpha#1`, `${CONTRIBUTOR}/private-beta#2`, "appcypher/awesome-mcp-servers#774",
      "punkpeye/awesome-mcp-servers#2169", "mungell/awesome-for-beginners#1905", "someowner/closed-repo#3", "someowner/other-repo#4"]) {
      assert.ok(!keys.includes(dropped), `${dropped} is dropped`);
    }
    const ownMerged = pullRequests.find((pullRequest) => pullRequest.repository.toLowerCase() === `${CONTRIBUTOR}/pcre4j`);
    assert.equal(ownMerged.mergedBy, CONTRIBUTOR);
    assert.equal(ownMerged.createdAt, "2026-03-04T05:06:07Z");
    assert.equal(ownMerged.mergedAt, "2026-03-05T05:06:07Z");
    assert.equal(ownMerged.state, "MERGED");
    assert.ok(!JSON.stringify(run.data).includes("BODY-"), "no pull-request body reaches the data");
  } finally {
    await close(server);
  }
});

test("the run stores whether each tracked issue is closed, and the owner log leaves his organisations out", { timeout: 180_000 }, async () => {
  const [closedKey, openKey] = PROMOTION_KEYS;
  const nodes = [
    ...fixtureNodes(),
    pullRequestNode({ owner: OWN_ORGANISATION, repo: "qontoctl", number: 9, title: "Own organisation change", merged: true, mergedBy: "maintainer-four" }),
  ];
  const { server, requests } = contributionsServer({ login: CONTRIBUTOR, nodes, closedIssues: new Set([closedKey]) });
  const endpoint = await listen(server);
  try {
    const run = await runScript({ endpoint });
    assert.equal(run.code, 0, `the run exits 0:\n${run.output}`);
    assert.deepEqual(run.data.issueStates, { [closedKey]: { closed: true }, [openKey]: { closed: false } });
    const asked = requests
      .filter((request) => /issueOrPullRequest/.test(request.query))
      .map(({ variables }) => `${variables.owner}/${variables.name}#${variables.number}`);
    assert.deepEqual(asked.sort(), [...PROMOTION_KEYS].sort(), "the run asks for each tracked issue by owner, name and number");
    const ownerLines = run.lines.filter((line) => line.includes("expected-contribution-owners"));
    assert.ok(ownerLines.some((line) => line.includes(UNLISTED_OWNER)), `the unlisted owner is named:\n${run.output}`);
    for (const line of ownerLines) {
      assert.ok(!line.toLowerCase().includes(OWN_ORGANISATION), `the owner log names no organisation of his: ${line}`);
    }
  } finally {
    await close(server);
  }
});

test("under CI the unlisted-owner log prints a count and no owner name", { timeout: 180_000 }, async () => {
  const { server } = contributionsServer({ login: CONTRIBUTOR, nodes: fixtureNodes() });
  const endpoint = await listen(server);
  try {
    const run = await runScript({ endpoint, ci: true });
    assert.equal(run.code, 0, `the run exits 0:\n${run.output}`);
    const ownerLines = run.lines.filter((line) => line.includes("expected-contribution-owners"));
    assert.ok(ownerLines.length >= 1, `a line reports the owners missing from expected-contribution-owners.json:\n${run.output}`);
    for (const line of ownerLines) {
      assert.ok(!line.includes(UNLISTED_OWNER), `under CI the owner is not named: ${line}`);
    }
    assert.ok(ownerLines.some((line) => /(?<![0-9A-Za-z])[1-9][0-9]*(?![0-9])/.test(line)), `the line gives a count:\n${ownerLines.join("\n")}`);
  } finally {
    await close(server);
  }
});

test("a listed owner whose only merged pull request the contributor merged fails the expected-owner check", { timeout: 180_000 }, async () => {
  const nodes = fixtureNodes().map((node) => (node.pullRequest.repository.owner.login === "OCA"
    ? pullRequestNode({ owner: "OCA", repo: "oca-lib", number: 1, title: "Fix for OCA", merged: true, mergedBy: CONTRIBUTOR })
    : node));
  const { server } = contributionsServer({ login: CONTRIBUTOR, nodes });
  const endpoint = await listen(server);
  try {
    const run = await runScript({ endpoint });
    assert.notEqual(run.code, 0, `the run fails:\n${run.output}`);
    assert.ok(run.lines.some((line) => /expected-contribution-owners/.test(line) && /\bOCA\b/.test(line)), `the failure names OCA:\n${run.output}`);
  } finally {
    await close(server);
  }
});

test("a 4xx error keeps the response body GitHub returned", { timeout: 60_000 }, async () => {
  const body = JSON.stringify({ message: "Bad credentials", documentation_url: "https://docs.github.com/graphql" });
  const server = http.createServer((request, response) => {
    request.resume();
    request.on("end", () => {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(body);
    });
  });
  const endpoint = await listen(server);
  try {
    const run = await runScript({ endpoint, timeoutMs: 50_000 });
    assert.notEqual(run.code, 0, "the run fails");
    assert.ok(run.output.includes("Bad credentials"), `the error carries GitHub's message:\n${run.output}`);
  } finally {
    await close(server);
  }
});

test("a network-level fetch failure is retried six times with the 5xx delay", { timeout: 150_000 }, async () => {
  const arrivals = [];
  const server = http.createServer((request) => {
    arrivals.push(Date.now());
    request.socket.destroy();
  });
  const endpoint = await listen(server);
  try {
    const run = await runScript({ endpoint, timeoutMs: 140_000 });
    assertRetriedSixTimes(run, arrivals);
  } finally {
    await close(server);
  }
});

test("a 5xx answer is retried six times with the same delays as a network failure", { timeout: 150_000 }, async () => {
  const arrivals = [];
  const server = http.createServer((request, response) => {
    arrivals.push(Date.now());
    request.resume();
    request.on("end", () => {
      response.writeHead(502, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Bad gateway" }));
    });
  });
  const endpoint = await listen(server);
  try {
    const run = await runScript({ endpoint, timeoutMs: 140_000 });
    assertRetriedSixTimes(run, arrivals);
  } finally {
    await close(server);
  }
});
