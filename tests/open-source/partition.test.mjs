// The pure seam src/lib/open-source-partition.ts.
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  BRAINBEAN,
  BRAINBEAN_GROUP_ID,
  CARDS,
  CONTRIBUTOR,
  OPEN_ONLY_OWNERS,
  PARTITION_PATH,
  PROMOTION_KEYS,
  SLUG_PATTERN,
  expectedMembers,
  loadPartition,
  partitionReal,
  contributionVerdict,
  isOwnOrganisationFrom,
  isShownContribution,
  logName,
  readCurated,
  sameRepository,
  sha256Hex,
} from "./lib/fixtures.mjs";

// ---------------------------------------------------------------------------------------------------------
// Fixture: four cards, two plain rows, one promotable row, one group member, and fetched data covering every
// branch of the contribution rule: (a) not a member repository, (b) not owned by the contributor, (c) not owned by
// one of his organisations, (d) not private, (e) when merged, not merged by the contributor. No owner list applies.

const ME = "me";
const MY_ORG = "myorg";
const isMyOrganisation = isOwnOrganisationFrom([sha256Hex(MY_ORG)]);

function member(slug, overrides = {}) {
  return {
    slug,
    name: `Name of ${slug}`,
    kind: "project",
    display: "row",
    repositories: [`${ME}/${slug}`],
    url: `https://github.com/${ME}/${slug}`,
    summary: `Summary of ${slug}`,
    ...overrides,
  };
}

function curatedFixture() {
  return {
    ownOrganisationSha256: [sha256Hex(MY_ORG)],
    groups: [{ id: "studio", label: "The studio", url: "https://github.com/studio" }],
    members: [
      member("card-three", { display: "card", cardOrder: 3 }),
      member("card-one", { display: "card", cardOrder: 1 }),
      member("row-one"),
      member("card-four", { display: "card", cardOrder: 4 }),
      member("card-two", { display: "card", cardOrder: 2 }),
      member("promo", { promoteToCardWhenClosed: [`${ME}/promo#1`, `${ME}/promo#2`] }),
      member("studio-lib", { repositories: ["studio/studio-lib"], group: "studio", url: "https://github.com/studio/studio-lib" }),
      member("row-two"),
    ],
    notable: [],
  };
}

let prNumber = 0;
function pr({ merged, mergedBy = null, title, closed = false }) {
  prNumber += 1;
  return {
    number: prNumber,
    title: title ?? `Pull request ${prNumber}`,
    url: `https://github.com/example/example/pull/${prNumber}`,
    merged,
    state: merged ? "MERGED" : closed ? "CLOSED" : "OPEN",
    createdAt: `2025-01-${String((prNumber % 27) + 1).padStart(2, "0")}T00:00:00Z`,
    mergedAt: merged ? "2025-02-01T00:00:00Z" : null,
    closedAt: merged || closed ? "2025-02-01T00:00:00Z" : null,
    mergedBy: merged ? mergedBy : null,
  };
}

function repository(name, pullRequests, { isPrivate = false } = {}) {
  const [owner, repo] = name.split("/");
  return {
    name,
    owner,
    title: repo,
    description: `Description of ${name}`,
    url: `https://github.com/${name}`,
    isPrivate,
    pullRequests: pullRequests.map((pullRequest) => ({
      ...pullRequest,
      url: `https://github.com/${name}/pull/${pullRequest.number}`,
    })),
  };
}

function project(slug, repositories) {
  return { title: slug, description: `Project ${slug}`, url: `https://github.com/${slug}`, slug, repositories };
}

function dataFixture({ closed = [false, false] } = {}) {
  prNumber = 0;
  return {
    contributor: ME,
    issueStates: {
      [`${ME}/promo#1`]: { closed: closed[0] },
      [`${ME}/promo#2`]: { closed: closed[1] },
    },
    projects: [
      project("card-one", [repository(`${ME}/card-one`, [pr({ merged: true, mergedBy: ME, title: "Own merged change" })])]),
      project("row-one", [repository(`${ME}/row-one`, [pr({ merged: false })])]),
      project("studio-lib", [repository("studio/studio-lib", [pr({ merged: true, mergedBy: ME })])]),
      project("third", [
        repository("listed/lib", [
          pr({ merged: true, mergedBy: "maintainer", title: "Reviewed and merged" }),
          pr({ merged: false, title: "Still open" }),
          pr({ merged: true, mergedBy: ME, title: "Merged by the contributor" }),
        ]),
        repository("listed/secret", [pr({ merged: true, mergedBy: "maintainer", title: "In a private repository" })], { isPrivate: true }),
      ]),
      project("openproj", [repository("openowner/thing", [pr({ merged: false, title: "Open in an unlisted owner" })])]),
      project("stranger", [repository("stranger/thing", [pr({ merged: true, mergedBy: "maintainer", title: "Merged in an unlisted owner" })])]),
      project("priv", [repository("listed/hidden", [pr({ merged: true, mergedBy: "maintainer" })], { isPrivate: true })]),
      project("nonmember-own", [repository(`${ME}/random`, [
        pr({ merged: true, mergedBy: ME, title: "Uncurated own repository" }),
        pr({ merged: true, mergedBy: "maintainer", title: "Uncurated own repository, merged by another" }),
        pr({ merged: false, title: "Uncurated own repository, open" }),
      ])]),
      project("caps-own", [repository("Me/Caps", [pr({ merged: true, mergedBy: "maintainer", title: "Own account in other letter case" })])]),
      project("orgproj", [repository(`${MY_ORG}/tool`, [
        pr({ merged: false, title: "Own organisation, open" }),
        pr({ merged: true, mergedBy: "maintainer", title: "Own organisation, merged by another" }),
        pr({ merged: false, closed: true, title: "Own organisation, closed without a merge" }),
      ])]),
      project("orgcaps", [repository("MyOrg/Other", [pr({ merged: true, mergedBy: "maintainer", title: "Own organisation in other letter case" })])]),
      project("orgself", [repository(`${MY_ORG}/selfmerged`, [pr({ merged: true, mergedBy: ME, title: "Own organisation, self-merged" })])]),
      project("orgprivate", [repository(`${MY_ORG}/hidden`, [pr({ merged: false, title: "Own organisation, private" })], { isPrivate: true })]),
    ],
  };
}

async function runFixture({ curated = curatedFixture(), data = dataFixture(), isOwnOrganisation = isMyOrganisation } = {}) {
  const partition = await loadPartition();
  return partition({ curated, data, isOwnOrganisation, contributor: ME });
}

// Loads the seam first, so a missing module fails the test instead of standing in for the expected throw, and
// checks that the unaltered fixture passes, so a seam that throws on everything does not pass either.
async function assertThrowsOn(cases) {
  const partition = await loadPartition();
  partition({ curated: curatedFixture(), data: dataFixture(), isOwnOrganisation: isMyOrganisation, contributor: ME });
  for (const [name, input] of Object.entries(cases)) {
    assert.throws(
      () => partition({ curated: curatedFixture(), data: dataFixture(), isOwnOrganisation: isMyOrganisation, contributor: ME, ...input }),
      Error,
      name,
    );
  }
}

function prsByTitle(data) {
  const map = new Map();
  for (const proj of data.projects) {
    for (const repo of proj.repositories) {
      for (const pullRequest of repo.pullRequests) {
        map.set(pullRequest.url, { repository: repo, pullRequest });
      }
    }
  }
  return map;
}

// ---------------------------------------------------------------------------------------------------------

test("seam: open-source-partition.ts imports nothing at runtime", () => {
  const source = fs.readFileSync(PARTITION_PATH, "utf8");
  for (const line of source.split("\n")) {
    if (/^\s*import\b/.test(line)) {
      assert.match(line, /^\s*import\s+type\b/, `runtime import: ${line}`);
    }
    if (/^\s*export\s+(\*|\{[^}]*\})\s*from\b/.test(line)) {
      assert.fail(`runtime re-export: ${line}`);
    }
  }
  assert.doesNotMatch(source, /\brequire\s*\(/, "no require()");
  assert.doesNotMatch(source, /\bimport\s*\(/, "no dynamic import()");
});

test("cards come in cardOrder and rows hold the rest, the group as one row", async () => {
  const result = await runFixture();
  assert.deepEqual(result.cards.map((card) => card.slug), ["card-one", "card-two", "card-three", "card-four"]);
  const memberRows = result.rows.filter((row) => row.kind === "member").map((row) => row.slug).sort();
  assert.deepEqual(memberRows, ["promo", "row-one", "row-two"]);
  const groupRows = result.rows.filter((row) => row.kind === "group");
  assert.equal(groupRows.length, 1);
  assert.equal(groupRows[0].id, "studio");
  assert.deepEqual(groupRows[0].slugs, ["studio-lib"]);
});

test("a promotable row becomes a fifth card only when both issues are closed", async () => {
  for (const closed of [[false, false], [true, false], [false, true]]) {
    const result = await runFixture({ data: dataFixture({ closed }) });
    assert.equal(result.cards.length, 4, `closed ${closed}: four cards`);
    assert.ok(result.rows.some((row) => row.kind === "member" && row.slug === "promo"), `closed ${closed}: promo is a row`);
  }
  const result = await runFixture({ data: dataFixture({ closed: [true, true] }) });
  assert.deepEqual(result.cards.map((card) => card.slug), ["card-one", "card-two", "card-three", "card-four", "promo"]);
  assert.ok(!result.rows.some((row) => row.kind === "member" && row.slug === "promo"), "promo is no longer a row");
});

test("contributions hold exactly the pull requests the contribution rule admits", async () => {
  const data = dataFixture();
  const result = await runFixture({ data });
  const listed = result.contributions.flatMap((entry) =>
    entry.repositories.flatMap((repo) => repo.pullRequests.map((pullRequest) => ({ slug: entry.slug, repo: repo.name, ...pullRequest }))));
  assert.deepEqual(
    listed.map((pullRequest) => pullRequest.title).sort(),
    ["Merged in an unlisted owner", "Open in an unlisted owner", "Reviewed and merged", "Still open"],
  );
  assert.deepEqual([...new Set(listed.map((pullRequest) => pullRequest.slug))].sort(), ["openproj", "stranger", "third"]);
  for (const pullRequest of listed) {
    assert.ok(["listed/lib", "openowner/thing", "stranger/thing"].includes(pullRequest.repo), `repository of ${pullRequest.title}`);
  }
  const byUrl = prsByTitle(data);
  for (const pullRequest of listed) {
    const source = byUrl.get(pullRequest.url);
    assert.ok(source, `${pullRequest.url} comes from the data`);
    assert.equal(pullRequest.number, source.pullRequest.number);
    assert.equal(pullRequest.title, source.pullRequest.title);
    assert.equal(pullRequest.status, source.pullRequest.merged ? "Merged" : "Open", `status of ${pullRequest.title}`);
  }
});

test("the contributions take no owner list; partition() decides own organisations through isOwnOrganisation", async () => {
  const everyOwnerIsOwn = await runFixture({ isOwnOrganisation: () => true });
  assert.deepEqual(everyOwnerIsOwn.contributions, [], "an isOwnOrganisation that holds every owner leaves no contribution");
  assert.ok(!everyOwnerIsOwn.pages.some((page) => page.section === "contribution"), "and no contribution page");
  const noOwnOrganisation = await runFixture({ isOwnOrganisation: () => false });
  const titles = noOwnOrganisation.contributions.flatMap((entry) =>
    entry.repositories.flatMap((repo) => repo.pullRequests.map((pullRequest) => pullRequest.title))).sort();
  assert.deepEqual(titles, [
    "Merged in an unlisted owner", "Open in an unlisted owner", "Own organisation in other letter case",
    "Own organisation, merged by another", "Own organisation, open", "Reviewed and merged", "Still open",
  ], "with no own organisation, the organisation's public pull requests that no other rule drops are shown");
  assert.equal(noOwnOrganisation.excludedOwnOrganisation, 0, "nothing is excluded as an own organisation");
});

test("excludedOwnOrganisation counts the pull requests rule (c) alone dropped", async () => {
  const result = await runFixture();
  assert.equal(typeof result.excludedOwnOrganisation, "number", "the result carries excludedOwnOrganisation");
  // Counted: "Own organisation, open", "Own organisation, merged by another", "Own organisation in other letter case".
  // Not counted: the self-merged one (rule (e) drops it too), the private one (rule (d) drops it too), and the one
  // closed without a merge, which no section shows.
  assert.equal(result.excludedOwnOrganisation, 3);
});

test("pull requests to uncurated repositories make no card, row or member page", async () => {
  const result = await runFixture();
  const curatedSlugs = new Set(curatedFixture().members.map((candidate) => candidate.slug));
  for (const card of result.cards) {
    assert.ok(curatedSlugs.has(card.slug), `card ${card.slug} is a curated member`);
  }
  for (const row of result.rows) {
    for (const slug of row.kind === "group" ? row.slugs : [row.slug]) {
      assert.ok(curatedSlugs.has(slug), `row ${slug} is a curated member`);
    }
  }
  const memberPages = result.pages.filter((page) => page.section === "member").map((page) => page.slug).sort();
  assert.deepEqual(memberPages, [...curatedSlugs].sort());
  const contributionPages = result.pages.filter((page) => page.section === "contribution").map((page) => page.slug).sort();
  assert.deepEqual(contributionPages, ["openproj", "stranger", "third"]);
  const allSlugs = result.pages.map((page) => page.slug);
  for (const dropped of ["priv", "nonmember-own", "caps-own", "orgproj", "orgcaps", "orgself", "orgprivate"]) {
    assert.ok(!allSlugs.includes(dropped), `no page for ${dropped}`);
  }
});

test("a member whose kind is not \"project\" throws", async () => {
  const cases = {};
  for (const kind of ["fork", "patch", "support", undefined]) {
    const curated = curatedFixture();
    curated.members[2] = { ...curated.members[2], kind };
    cases[`kind ${kind}`] = { curated };
  }
  await assertThrowsOn(cases);
});

test("two pages on one slug throw", async () => {
  const twoMembers = curatedFixture();
  twoMembers.members.push(member("row-one", { repositories: [`${ME}/row-one-copy`] }));
  const memberAndContribution = curatedFixture();
  memberAndContribution.members.push(member("third", { repositories: [`${ME}/other-third`] }));
  await assertThrowsOn({
    "two members on one slug": { curated: twoMembers },
    "a member and a contribution page on one slug": { curated: memberAndContribution },
  });
});

test("a slug outside ^[a-z0-9-]+$ throws", async () => {
  const cases = {};
  for (const slug of ["Row_One", "row one", "row/one", ""]) {
    assert.doesNotMatch(slug, SLUG_PATTERN);
    const curated = curatedFixture();
    curated.members[2] = { ...curated.members[2], slug };
    cases[`slug "${slug}"`] = { curated };
  }
  await assertThrowsOn(cases);
});

test("a repository listed by two members throws", async () => {
  const curated = curatedFixture();
  curated.members[7] = { ...curated.members[7], repositories: [`${ME}/row-one`] };
  await assertThrowsOn({ "row-two lists row-one's repository": { curated } });
});

test("a card count other than four throws", async () => {
  const three = curatedFixture();
  three.members = three.members.filter((candidate) => candidate.slug !== "card-four");
  const five = curatedFixture();
  five.members.push(member("card-five", { display: "card", cardOrder: 4 }));
  await assertThrowsOn({ "three cards": { curated: three }, "five cards": { curated: five } });
});

test("missing or malformed input throws", async () => {
  await assertThrowsOn({
    "no data": { data: undefined },
    "data without projects": { data: { contributor: ME, issueStates: {} } },
    "projects not an array": { data: { ...dataFixture(), projects: {} } },
    "no curated file": { curated: undefined },
    "curated without members": { curated: { ...curatedFixture(), members: undefined } },
  });
});

// ---------------------------------------------------------------------------------------------------------
// The committed curated file with the fetched data.

const OPEN = { [PROMOTION_KEYS[0]]: { closed: false }, [PROMOTION_KEYS[1]]: { closed: false } };
const CLOSED = { [PROMOTION_KEYS[0]]: { closed: true }, [PROMOTION_KEYS[1]]: { closed: true } };

test("with both remoteclaw issues open, the four cards in order and remoteclaw a row", async () => {
  const { result } = await partitionReal({ issueStates: OPEN });
  assert.deepEqual(result.cards.map((card) => card.slug), CARDS.map((card) => card.slug));
  assert.ok(result.rows.some((row) => row.kind === "member" && row.slug === "remoteclaw"));
});

test("with both remoteclaw issues closed, remoteclaw is a fifth card and no row", async () => {
  const { result } = await partitionReal({ issueStates: CLOSED });
  assert.deepEqual(result.cards.map((card) => card.slug), [...CARDS.map((card) => card.slug), "remoteclaw"]);
  assert.ok(!result.rows.some((row) => row.kind === "member" && row.slug === "remoteclaw"));
});

test("every member that is not a card is a row, the Brainbean members in one group row", async () => {
  const { result, curated } = await partitionReal({ issueStates: OPEN });
  const expected = expectedMembers(curated);
  const cardSlugs = new Set(result.cards.map((card) => card.slug));
  const groupRows = result.rows.filter((row) => row.kind === "group");
  assert.equal(groupRows.length, 1);
  assert.equal(groupRows[0].id, BRAINBEAN_GROUP_ID);
  assert.deepEqual([...groupRows[0].slugs].sort(), BRAINBEAN.map((entry) => entry.slug).sort());
  const memberRows = result.rows.filter((row) => row.kind === "member").map((row) => row.slug).sort();
  const expectedRows = expected
    .filter((entry) => !cardSlugs.has(entry.slug) && !entry.group)
    .map((entry) => entry.slug)
    .sort();
  assert.deepEqual(memberRows, expectedRows);
});

test("the contributions are exactly the fetched pull requests that rules (a) to (e) admit", async () => {
  const { result, curated, data } = await partitionReal();
  const isOwnOrganisation = isOwnOrganisationFrom(curated.ownOrganisationSha256);
  const memberRepositories = curated.members.flatMap((entry) => entry.repositories);
  const byUrl = prsByTitle(data);
  const listedUrls = new Set();
  for (const entry of result.contributions) {
    for (const repo of entry.repositories) {
      const name = logName(repo.name, "a contributions repository");
      for (const pullRequest of repo.pullRequests) {
        listedUrls.add(pullRequest.url);
        const url = logName(pullRequest.url, `a pull request of ${name}`);
        const source = byUrl.get(pullRequest.url);
        assert.ok(source, `${url} comes from the data`);
        assert.ok(sameRepository(source.repository.name, repo.name), `${url} sits in ${name}`);
        const verdict = contributionVerdict({ ...source, memberRepositories, isOwnOrganisation });
        assert.equal(verdict.member, false, `${name}: not a member repository`);
        assert.equal(verdict.contributorOwned, false, `${name}: not owned by the contributor`);
        assert.equal(verdict.ownOrganisation, false, `${name}: not owned by one of his organisations`);
        assert.equal(verdict.isPrivate, false, `${name}: public`);
        assert.equal(verdict.selfMerged, false, `${url}: not merged by the contributor`);
        assert.equal(pullRequest.status, source.pullRequest.merged ? "Merged" : "Open", `${url}: status`);
        assert.equal(pullRequest.title, source.pullRequest.title, `${url}: title as written`);
      }
    }
  }
  assert.ok(listedUrls.size > 0, "the contributions section lists pull requests");
  for (const [url, source] of byUrl) {
    if (isShownContribution(contributionVerdict({ ...source, memberRepositories, isOwnOrganisation }))) {
      assert.ok(listedUrls.has(url), `${logName(url, "a fetched pull request")} passes every rule and is listed`);
    }
  }
});

test("owners whose only pull requests are open appear with the Open label, listed nowhere", async () => {
  const { result, curated, data } = await partitionReal();
  const isOwnOrganisation = isOwnOrganisationFrom(curated.ownOrganisationSha256);
  const memberRepositories = curated.members.flatMap((entry) => entry.repositories);
  const listed = result.contributions.flatMap((entry) => entry.repositories.flatMap((repo) =>
    repo.pullRequests.map((pullRequest) => ({ owner: repo.name.split("/")[0].toLowerCase(), ...pullRequest }))));
  let checked = 0;
  for (const owner of OPEN_ONLY_OWNERS) {
    const sources = [...prsByTitle(data).values()].filter(({ repository }) => repository.owner.toLowerCase() === owner.toLowerCase())
      .filter((source) => isShownContribution(contributionVerdict({ ...source, memberRepositories, isOwnOrganisation })));
    for (const { pullRequest } of sources) {
      checked += 1;
      const shown = listed.find((candidate) => candidate.url === pullRequest.url);
      const label = logName(pullRequest.url, "a fetched pull request");
      assert.ok(shown, `${label} of ${owner} is listed`);
      assert.equal(shown.status, pullRequest.merged ? "Merged" : "Open", `${label}: status`);
    }
  }
  assert.ok(checked > 0, `the data holds pull requests of ${OPEN_ONLY_OWNERS.join(", ")}`);
  assert.ok(!("openContributionOwners" in curated), "the curated file lists no third-party owner");
});

test("on the real data, excludedOwnOrganisation equals the pull requests rule (c) alone drops", async () => {
  const { result, curated, data } = await partitionReal();
  const isOwnOrganisation = isOwnOrganisationFrom(curated.ownOrganisationSha256);
  const memberRepositories = curated.members.flatMap((entry) => entry.repositories);
  let alone = 0;
  let any = 0;
  for (const source of prsByTitle(data).values()) {
    const verdict = contributionVerdict({ ...source, memberRepositories, isOwnOrganisation });
    if (verdict.ownOrganisation) {
      any += 1;
      const wouldShow = source.pullRequest.merged || source.pullRequest.state !== "CLOSED";
      if (wouldShow && isShownContribution({ ...verdict, ownOrganisation: false })) {
        alone += 1;
      }
    }
  }
  assert.ok(Number.isInteger(result.excludedOwnOrganisation), "excludedOwnOrganisation is an integer");
  assert.equal(result.excludedOwnOrganisation, alone, `excludedOwnOrganisation is ${alone}; rule (c) fires on ${any}`);
});

test("pages are unique, one per member and one per contribution, and uvccamera stays with saki4510t", async () => {
  const { result, curated } = await partitionReal();
  const slugs = result.pages.map((page) => page.slug);
  assert.equal(new Set(slugs).size, slugs.length, "page slugs are unique");
  for (const slug of slugs) {
    assert.match(slug, SLUG_PATTERN);
  }
  const memberPages = result.pages.filter((page) => page.section === "member").map((page) => page.slug).sort();
  assert.deepEqual(memberPages, expectedMembers(curated).map((entry) => entry.slug).sort());
  const contributionPages = result.pages.filter((page) => page.section === "contribution").map((page) => page.slug).sort();
  assert.deepEqual(contributionPages, result.contributions.map((entry) => entry.slug).sort());
  const uvccamera = result.contributions.find((entry) => entry.slug === "uvccamera");
  assert.ok(uvccamera, "a contribution page keeps the slug uvccamera");
  assert.ok(uvccamera.repositories.some((repo) => sameRepository(repo.name, "saki4510t/UVCCamera")), "uvccamera holds saki4510t/UVCCamera");
});
