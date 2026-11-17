// The built site under out/.
// Run after `npm run build` over freshly fetched data.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  accessibleName,
  byTag,
  classesOf,
  closest,
  findAll,
  findFirst,
  isAriaHidden,
  isInside,
  normalize,
  textOf,
} from "./lib/html.mjs";
import {
  BRAINBEAN,
  BRAINBEAN_GROUP_ID,
  CARDS,
  CURATED_PATH,
  DATA_PATH,
  NOTABLE,
  OUT,
  PARTITION_PATH,
  PROMOTION_KEYS,
  ROOT,
  ROWS,
  SITE_URL,
  expectedMembers,
  listFiles,
  memberBySlug,
  pageExists,
  partitionReal,
  readPage,
  sameRepository,
  stringsOf,
  uvcCameraSlug,
  yearsIn,
} from "./lib/fixtures.mjs";

const SECTION = "open-source-contributions";

function indexPage() {
  return readPage(SECTION);
}

function attr(name, value) {
  return (element) => element.attrs[name] === value;
}

function hasAttr(name) {
  return (element) => name in element.attrs;
}

function main(root) {
  const element = findFirst(root, byTag("main"));
  assert.ok(element, "the page has a <main>");
  return element;
}

function allDataPullRequests(data) {
  return data.projects.flatMap((project) => project.repositories.flatMap((repository) =>
    repository.pullRequests.map((pullRequest) => ({ repository, pullRequest }))));
}

function memberPullRequests(data, member) {
  return allDataPullRequests(data).filter(({ repository }) =>
    member.repositories.some((name) => sameRepository(name, repository.name)));
}

function bothClosed(data) {
  return PROMOTION_KEYS.every((key) => data.issueStates?.[key]?.closed === true);
}

function hrefPath(href) {
  if (!href) return "";
  return href.startsWith(SITE_URL) ? href.slice(SITE_URL.length) : href;
}

function isPageLink(link, slug) {
  const target = hrefPath(link.attrs.href);
  return target === `/${SECTION}/${slug}/` || target === `/${SECTION}/${slug}`;
}

function linksToPage(element, slug) {
  return findAll(element, byTag("a")).some((link) => isPageLink(link, slug));
}

let cached;
async function context() {
  if (!cached) {
    const { result, curated, data } = await partitionReal();
    const page = indexPage();
    cached = { result, curated, data, page };
  }
  return cached;
}

function projectPageDirectories(result) {
  return result.pages.map((page) => path.join(SECTION, page.slug));
}

// ---------------------------------------------------------------------------------------------------------

test("the built pages are newer than every source they were built from", () => {
  const shared = [
    CURATED_PATH,
    DATA_PATH,
    PARTITION_PATH,
    path.join(ROOT, "src", "lib", "open-source.ts"),
    path.join(ROOT, "src", "lib", "constants.ts"),
    path.join(ROOT, "src", "components", "breadcrumb.tsx"),
    path.join(ROOT, "src", "app", "layout.tsx"),
  ];
  const pages = [
    [path.join(OUT, SECTION, "index.html"), [...shared, ...listFiles(path.join(ROOT, "src", "app", "open-source-contributions"))]],
    [path.join(OUT, "index.html"), [...shared, path.join(ROOT, "src", "app", "page.tsx")]],
  ];
  for (const [page, sources] of pages) {
    const built = fs.statSync(page).mtimeMs;
    for (const source of sources) {
      assert.ok(fs.statSync(source).mtimeMs <= built, `${path.relative(ROOT, source)} changed after ${path.relative(ROOT, page)} was built: rebuild before testing`);
    }
  }
});

test("one h1, the first h2 \"My open-source projects\" in the first section of main, contributions in a second section, no toggle", async () => {
  const { page } = await context();
  const { root } = page;
  assert.equal(findAll(root, byTag("h1")).length, 1, "exactly one <h1>");
  const mainElement = main(root);
  const sections = findAll(mainElement, byTag("section"));
  assert.ok(sections.length >= 2, "main holds at least two sections");
  const first = sections[0];
  const firstH2 = findFirst(root, byTag("h2"));
  assert.ok(firstH2, "the page has an <h2>");
  assert.equal(normalize(textOf(firstH2)), "My open-source projects");
  assert.ok(isInside(firstH2, first), "the first <h2> sits inside the first <section> of <main>");
  const second = sections.find((section) => section !== first && !isInside(section, first));
  assert.ok(second, "a second <section> follows the first");
  assert.ok(findFirst(second, byTag("h2")), "the second section has its own <h2>");
  const statuses = findAll(root, hasAttr("data-pr-status"));
  assert.ok(statuses.length > 0, "the index lists pull requests");
  for (const status of statuses) {
    assert.ok(isInside(status, second), "every listed pull request sits in the second section");
  }
  for (const marker of [...findAll(root, hasAttr("data-oss-card")), ...findAll(root, hasAttr("data-oss-row")), ...findAll(root, hasAttr("data-oss-group"))]) {
    assert.ok(isInside(marker, first), "every card and row sits in the first section");
  }
  assert.equal(findAll(root, (element) => element.tag === "input" && (element.attrs.type ?? "").toLowerCase() === "checkbox").length, 0, "no checkbox");
  assert.equal(findAll(root, attr("role", "switch")).length, 0, "no switch");
});

// ---------------------------------------------------------------------------------------------------------

test("the cards, in order, with remoteclaw a row while either issue is open", async () => {
  const { page, data } = await context();
  const cards = findAll(page.root, hasAttr("data-oss-card")).map((element) => element.attrs["data-oss-card"]);
  const expected = CARDS.map((card) => card.slug);
  if (bothClosed(data)) {
    assert.deepEqual(cards, [...expected, "remoteclaw"]);
    assert.equal(findAll(page.root, attr("data-oss-row", "remoteclaw")).length, 0, "remoteclaw is no row");
  } else {
    assert.deepEqual(cards, expected);
    assert.equal(findAll(page.root, attr("data-oss-row", "remoteclaw")).length, 1, "remoteclaw is a row");
  }
  const webp = findFirst(page.root, attr("data-oss-card", "webp-android-backport"));
  assert.ok(normalize(textOf(webp)).includes("dormant since 2016"), "the webp-android-backport card states its era");
});

test("every member that is not a card is a row or sits in the group row, and nothing else is", async () => {
  const { page, curated } = await context();
  const expected = expectedMembers(curated);
  const memberSlugs = new Set(expected.map((member) => member.slug));
  const cards = new Set(findAll(page.root, hasAttr("data-oss-card")).map((element) => element.attrs["data-oss-card"]));
  const group = findFirst(page.root, attr("data-oss-group", BRAINBEAN_GROUP_ID));
  const rows = findAll(page.root, hasAttr("data-oss-row"));
  for (const slug of [...cards, ...rows.map((row) => row.attrs["data-oss-row"])]) {
    assert.ok(memberSlugs.has(slug), `${slug} is a curated member`);
  }
  for (const member of expected.filter((candidate) => !cards.has(candidate.slug))) {
    const ownRows = rows.filter((row) => row.attrs["data-oss-row"] === member.slug);
    if (member.group) {
      assert.ok(group && linksToPage(group, member.slug), `${member.slug} sits in the group row`);
      assert.ok(ownRows.every((row) => isInside(row, group)), `${member.slug} has no row outside the group`);
    } else {
      assert.equal(ownRows.length, 1, `${member.slug} is one row`);
    }
  }
});

test("dataplug is one row and the Brainbean Apps group holds its 24 members, each with its year", async () => {
  const { page, curated } = await context();
  const { root } = page;
  assert.equal(findAll(root, attr("data-oss-row", "dataplug")).length, 1, "one dataplug row");
  const dataplugNames = ROWS.find((row) => row.slug === "dataplug").repositories.map((name) => name.split("/")[1].toLowerCase());
  for (const row of findAll(root, hasAttr("data-oss-row"))) {
    const slug = row.attrs["data-oss-row"];
    assert.ok(slug === "dataplug" || !dataplugNames.includes(slug), `${slug}: no dataplug-io repository has a row of its own`);
  }
  const groups = findAll(root, attr("data-oss-group", BRAINBEAN_GROUP_ID));
  assert.equal(groups.length, 1, "exactly one Brainbean Apps group");
  const [group] = groups;
  const text = normalize(textOf(group));
  assert.match(text, /Brainbean Apps/);
  assert.match(text, /founded/i);
  assert.match(text, /2015\s*[–-]\s*2018/);
  assert.doesNotMatch(text, /2015\s*[–-]\s*2020/);
  assert.doesNotMatch(text, /ran[^.;]*until\s+2020/i);
  assert.ok(!text.toLowerCase().includes("brainbeanapps/redux-trivial-actions"), "the archived copy is not in the group");
  assert.ok(!linksToPage(group, "redux-trivial-actions"), "redux-trivial-actions is not in the group");

  const brainbeanSlugs = new Set(BRAINBEAN.map((member) => member.slug));
  const brainbeanRepositories = new Set(BRAINBEAN.map((member) => member.repositories[0].toLowerCase()));
  for (const link of findAll(group, byTag("a"))) {
    const target = hrefPath(link.attrs.href);
    const pageMatch = target.match(new RegExp(`^/${SECTION}/([^/]+)/?$`));
    if (pageMatch) {
      assert.ok(brainbeanSlugs.has(pageMatch[1]), `the group links to ${pageMatch[1]}, no Brainbean member`);
    }
    const repositoryMatch = (link.attrs.href ?? "").match(/^https:\/\/github\.com\/([^/?#]+)\/([^/?#]+)\/?$/);
    if (repositoryMatch) {
      const name = `${repositoryMatch[1]}/${repositoryMatch[2]}`.toLowerCase();
      assert.ok(brainbeanRepositories.has(name), `the group links to the repository ${name}`);
    }
  }
  for (const member of BRAINBEAN) {
    const link = findAll(group, byTag("a")).find((candidate) => isPageLink(candidate, member.slug));
    assert.ok(link, `the group links to the page of ${member.slug}`);
    const item = closest(link, byTag("li")) ?? link.parent;
    assert.ok(yearsIn(textOf(item)).includes(member.year), `${member.slug} shows ${member.year}`);
  }
  assert.ok(memberBySlug(curated, "redux-trivial-actions"), "redux-trivial-actions stays a member");
});

function entryElement(root, slug) {
  return findFirst(root, attr("data-oss-card", slug)) ?? findFirst(root, attr("data-oss-row", slug));
}

test("the qontoctl card says it is unofficial and not affiliated with Qonto", async () => {
  const { page } = await context();
  const text = normalize(textOf(findFirst(page.root, attr("data-oss-card", "qontoctl"))));
  assert.match(text, /unofficial/i);
  assert.ok(text.includes("not affiliated with Qonto"), text);
});

test("the Puppeteer-Capture card claims no exclusivity or invention", async () => {
  const { page } = await context();
  const text = normalize(textOf(findFirst(page.root, attr("data-oss-card", "puppeteer-capture"))));
  for (const phrase of ["only option", "my technique", "i invented"]) {
    assert.ok(!text.toLowerCase().includes(phrase), `the card says "${phrase}"`);
  }
  if (text.includes("PostHog")) {
    assert.ok(text.includes("PostHog built its session-replay-to-MP4 rasterizer on puppeteer-capture."), text);
  }
});

test("forks state their upstream and dormant members say published, not maintained", async () => {
  const { page, curated } = await context();
  const { root } = page;
  const uvcSlug = uvcCameraSlug(curated);
  const upstreams = [["remoteclaw", "openclaw/openclaw"], [uvcSlug, "saki4510t/UVCCamera"], ["redux-trivial-actions", "brainbeanapps/redux-trivial-actions"]];
  for (const [slug, upstream] of upstreams) {
    const element = entryElement(root, slug);
    assert.ok(element, `${slug} has an entry`);
    assert.ok(normalize(textOf(element)).includes(upstream), `${slug} states its upstream ${upstream}`);
  }
  const statesDormancy = (text) => /published/i.test(text) && /not maintained/i.test(text);
  for (const member of expectedMembers(curated).filter((candidate) => candidate.dormant && !candidate.group)) {
    const element = entryElement(root, member.slug);
    assert.ok(element, `${member.slug} has an entry`);
    assert.ok(statesDormancy(normalize(textOf(element))), `${member.slug} says it is published and not maintained`);
  }
  const group = findFirst(root, attr("data-oss-group", BRAINBEAN_GROUP_ID));
  assert.ok(statesDormancy(normalize(textOf(group))), "the Brainbean Apps group says published and not maintained");
});

// ---------------------------------------------------------------------------------------------------------

function assertPullRequestLabels(root, pullRequestsByUrl, label) {
  const listed = new Set();
  for (const link of findAll(main(root), byTag("a"))) {
    const source = pullRequestsByUrl.get(link.attrs.href);
    if (!source) continue;
    listed.add(link.attrs.href);
    const item = closest(link, byTag("li"));
    assert.ok(item, `${label}: ${link.attrs.href} sits in a list item`);
    const statuses = findAll(item, hasAttr("data-pr-status"));
    assert.equal(statuses.length, 1, `${label}: ${link.attrs.href} carries one status`);
    const [status] = statuses;
    const expected = source.merged ? "merged" : "open";
    const word = source.merged ? "Merged" : "Open";
    const other = source.merged ? "Open" : "Merged";
    assert.equal(status.attrs["data-pr-status"], expected, `${label}: ${link.attrs.href} status`);
    const text = normalize(textOf(status));
    assert.ok(text.includes(word) && !text.includes(other), `${label}: ${link.attrs.href} reads "${word}", not "${text}"`);
    const hidden = classesOf(status).filter((name) => ["sr-only", "hidden", "invisible"].includes(name));
    assert.deepEqual(hidden, [], `${label}: the status label is visible`);
  }
  return listed;
}

test("every listed contribution reads Merged or Open as text, matching its data, and no shields.io badge remains", async () => {
  const { page, result, data } = await context();
  const byUrl = new Map(allDataPullRequests(data).map(({ pullRequest }) => [pullRequest.url, pullRequest]));
  const contributionUrls = new Set(result.contributions.flatMap((entry) =>
    entry.repositories.flatMap((repository) => repository.pullRequests.map((pullRequest) => pullRequest.url))));
  const contributionMap = new Map([...byUrl].filter(([url]) => contributionUrls.has(url)));
  const onIndex = assertPullRequestLabels(page.root, contributionMap, "index");
  assert.ok(onIndex.size > 0, "the index lists contributions");
  for (const status of findAll(page.root, hasAttr("data-pr-status"))) {
    const item = closest(status, byTag("li"));
    const links = findAll(item ?? status.parent, byTag("a")).filter((link) => contributionMap.has(link.attrs.href));
    assert.ok(links.length >= 1, "every status on the index belongs to a contribution");
  }
  for (const entry of result.contributions) {
    const { root } = readPage(path.join(SECTION, entry.slug));
    const ownUrls = new Set(entry.repositories.flatMap((repository) => repository.pullRequests.map((pullRequest) => pullRequest.url)));
    const listed = assertPullRequestLabels(root, new Map([...byUrl].filter(([url]) => ownUrls.has(url))), entry.slug);
    for (const url of ownUrls) {
      assert.ok(listed.has(url), `${entry.slug} lists ${url}`);
    }
  }
  for (const file of listFiles(path.join(OUT, SECTION)).filter((candidate) => candidate.endsWith("index.html"))) {
    const html = fs.readFileSync(file, "utf8");
    assert.ok(!html.includes("shields.io") && !html.includes("img.shields"), `${path.relative(OUT, file)} holds a shields.io badge`);
  }
});

test("a page exists for every member and contribution, titles appear as written, newest first", async () => {
  const { result, curated, data } = await context();
  for (const member of expectedMembers(curated)) {
    assert.ok(pageExists(path.join(SECTION, member.slug)), `the page of ${member.slug} exists`);
  }
  for (const entry of result.contributions) {
    assert.ok(pageExists(path.join(SECTION, entry.slug)), `the page of ${entry.slug} exists`);
  }
  const uvcSlug = uvcCameraSlug(curated);
  assert.notEqual(uvcSlug, "uvccamera");
  const uvccamera = readPage(path.join(SECTION, "uvccamera"));
  assert.ok(normalize(textOf(uvccamera.root)).includes("saki4510t/UVCCamera") ||
    findAll(uvccamera.root, byTag("a")).some((link) => (link.attrs.href ?? "").includes("github.com/saki4510t/UVCCamera")),
  "the uvccamera page holds saki4510t/UVCCamera");

  for (const member of curated.members) {
    const { root } = readPage(path.join(SECTION, member.slug));
    const text = textOf(main(root));
    const pullRequests = memberPullRequests(data, member);
    for (const { pullRequest } of pullRequests) {
      assert.ok(text.includes(pullRequest.title), `${member.slug} shows the title "${pullRequest.title}" as written`);
    }
    const order = findAll(main(root), byTag("a")).map((link) => link.attrs.href);
    for (const repository of new Set(pullRequests.map(({ repository: candidate }) => candidate))) {
      const expected = repository.pullRequests
        .slice()
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .map((pullRequest) => pullRequest.url);
      const shown = [...new Set(order.filter((href) => expected.includes(href)))];
      assert.deepEqual(shown, expected, `${member.slug}: every pull request of ${repository.name}, newest first`);
    }
  }
  for (const entry of result.contributions) {
    const { root } = readPage(path.join(SECTION, entry.slug));
    const text = textOf(main(root));
    for (const repository of entry.repositories) {
      for (const pullRequest of repository.pullRequests) {
        assert.ok(text.includes(pullRequest.title), `${entry.slug} shows the title "${pullRequest.title}" as written`);
      }
    }
  }
});

// ---------------------------------------------------------------------------------------------------------

test("the homepage Notable list renders the twelve entries as at HEAD c36ed49", () => {
  const { root } = readPage("");
  const heading = findAll(root, byTag("h2")).find((element) => normalize(textOf(element)).startsWith("Notable"));
  assert.ok(heading, "the homepage has the Notable heading");
  assert.equal(normalize(textOf(heading)), "Notable Open-Source Contributions");
  const headingLink = findFirst(heading, byTag("a"));
  assert.equal(headingLink.attrs.href, `${SITE_URL}/open-source-contributions/`);
  const lists = findAll(root, byTag("ul"));
  const allElements = findAll(root, () => true);
  const headingIndex = allElements.indexOf(heading);
  const list = lists.find((candidate) => allElements.indexOf(candidate) > headingIndex);
  assert.ok(list, "a list follows the Notable heading");
  const items = list.children.filter((child) => child.type === "element" && child.tag === "li");
  assert.equal(items.length, NOTABLE.length, "twelve entries");
  for (const [index, expected] of NOTABLE.entries()) {
    assert.equal(normalize(textOf(items[index])), expected.text, `entry ${index + 1} text`);
    const links = findAll(items[index], byTag("a")).map((link) => [normalize(textOf(link)), link.attrs.href]);
    assert.deepEqual(links, expected.links, `entry ${index + 1} links`);
  }
});

// ---------------------------------------------------------------------------------------------------------

const BANNED_LINK_NAMES = new Set(["", "here", "link", "click here", "more", "read more"]);
const LOW_CONTRAST_DARK = new Set(["dark:text-gray-500", "dark:text-gray-600", "dark:text-gray-700", "dark:text-gray-800"]);
const PLAIN_GREY = new Set(["text-gray-500", "text-gray-600", "text-gray-700"]);
const LIGHT_DARK = /^dark:text-(gray-(50|100|200|300|400)|white)$/;

function holdsText(element) {
  return normalize(textOf(element)).length > 0;
}

function breadcrumbItems(root) {
  const items = [];
  for (const script of findAll(root, (element) => element.tag === "script" && element.attrs.type === "application/ld+json")) {
    let json;
    try {
      json = JSON.parse(textOf({ ...script, tag: "div" }));
    } catch {
      continue;
    }
    const visit = (value) => {
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (value && typeof value === "object") {
        const type = value["@type"];
        if (type === "BreadcrumbList" || (Array.isArray(type) && type.includes("BreadcrumbList"))) {
          for (const element of value.itemListElement ?? []) {
            const item = typeof element.item === "string" ? element.item : element.item?.["@id"];
            if (item !== undefined) items.push(item);
          }
        }
        Object.values(value).forEach(visit);
      }
    };
    visit(json);
  }
  return items;
}

function assertPageQuality(directory, canonical) {
  const { root } = readPage(directory);
  const label = directory;
  assert.equal(findAll(root, byTag("h1")).length, 1, `${label}: one <h1>`);
  let previous = 0;
  for (const heading of findAll(root, (element) => /^h[1-6]$/.test(element.tag))) {
    const level = Number(heading.tag[1]);
    assert.ok(level <= previous + 1, `${label}: <${heading.tag}> "${normalize(textOf(heading))}" skips a level after h${previous}`);
    previous = level;
  }
  for (const marker of [
    ...findAll(root, hasAttr("data-oss-card")),
    ...findAll(root, hasAttr("data-oss-row")),
    ...findAll(root, hasAttr("data-oss-group")),
    ...findAll(root, hasAttr("data-pr-status")),
  ]) {
    const item = closest(marker, byTag("li"));
    assert.ok(item && ["ul", "ol"].includes(item.parent.tag), `${label}: ${JSON.stringify(marker.attrs)} is an <li> of a <ul> or <ol>`);
  }
  const group = findFirst(root, attr("data-oss-group", BRAINBEAN_GROUP_ID));
  if (group) {
    for (const member of BRAINBEAN) {
      const link = findAll(group, byTag("a")).find((candidate) => isPageLink(candidate, member.slug));
      const item = link && closest(link, byTag("li"));
      assert.ok(item && isInside(item, group) && ["ul", "ol"].includes(item.parent.tag), `${label}: ${member.slug} is an <li> of a list inside the group`);
    }
  }
  for (const link of findAll(root, byTag("a"))) {
    const name = accessibleName(link, root).toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
    assert.ok(!BANNED_LINK_NAMES.has(name), `${label}: the link to ${link.attrs.href} is named "${name}"`);
  }
  for (const element of findAll(root, (candidate) => candidate.attrs.class !== undefined)) {
    const classes = classesOf(element);
    const exempt = isAriaHidden(element) || !holdsText(element);
    if (exempt) continue;
    for (const name of classes) {
      assert.ok(!LOW_CONTRAST_DARK.has(name), `${label}: <${element.tag}> "${normalize(textOf(element)).slice(0, 40)}" uses ${name}`);
    }
    if (classes.some((name) => PLAIN_GREY.has(name))) {
      assert.ok(classes.some((name) => LIGHT_DARK.test(name)), `${label}: <${element.tag}> "${normalize(textOf(element)).slice(0, 40)}" uses ${classes.join(" ")} without a light dark: text class`);
    }
  }
  const canonicals = findAll(root, (element) => element.tag === "link" && element.attrs.rel === "canonical");
  assert.equal(canonicals.length, 1, `${label}: one canonical link`);
  assert.equal(canonicals[0].attrs.href, canonical, `${label}: canonical`);
  const nav = findAll(root, (element) => element.tag === "nav" && /breadcrumb/i.test(element.attrs["aria-label"] ?? ""));
  assert.equal(nav.length, 1, `${label}: one breadcrumb <nav>`);
  const items = breadcrumbItems(root);
  assert.ok(items.length >= 1, `${label}: a JSON-LD BreadcrumbList with item URLs`);
  for (const item of items) {
    assert.ok(item.endsWith("/"), `${label}: breadcrumb item ${item} ends with /`);
  }
}

test("the index has a sound outline, lists, named links, readable dark text, a canonical tag and a breadcrumb", () => {
  assertPageQuality(SECTION, `${SITE_URL}/${SECTION}/`);
});

test("every project page has a sound outline, lists, named links, readable dark text, a canonical tag and a breadcrumb", async () => {
  const { result } = await context();
  for (const directory of projectPageDirectories(result)) {
    const slug = path.basename(directory);
    assertPageQuality(directory, `${SITE_URL}/${SECTION}/${slug}/`);
  }
});

// ---------------------------------------------------------------------------------------------------------

function allowedYears(member, data, curated) {
  const years = new Set();
  const group = member.group && curated.groups.find((candidate) => candidate.id === member.group);
  for (const [, value] of [...stringsOf(member), ...(group ? stringsOf(group) : [])]) {
    yearsIn(value).forEach((year) => years.add(year));
  }
  for (const { repository, pullRequest } of memberPullRequests(data, member)) {
    for (const value of [pullRequest.title, pullRequest.createdAt, pullRequest.mergedAt, pullRequest.closedAt, repository.description, repository.title]) {
      yearsIn(value ?? "").forEach((year) => years.add(year));
    }
  }
  return years;
}

const COUNT_PATTERNS = [
  /★\s*([0-9][0-9,.]*k?)/gi,
  /([0-9][0-9,.]*k?)\s*(?:GitHub\s+)?stars?\b/gi,
  /([0-9][0-9,.]*k?)\s*forks?\b/gi,
];

function countsIn(text) {
  return COUNT_PATTERNS.flatMap((pattern) => [...text.matchAll(pattern)].map((match) => match[1]));
}

test("every year and every star or fork count on the index and member pages traces to its source", async () => {
  const { page, curated, data } = await context();
  // A count traces when a curated string, apart from the hashes and URLs, holds it as a whole number, or when a
  // fetched string, such as a pull request title, shows the same count. The fetched data holds no star or fork count
  // field, and its only numbers are pull request numbers, so no fetched number traces a count.
  const curatedNumbers = new Set(stringsOf({ ...curated, ownOrganisationSha256: [] })
    .filter(([, value]) => !/^https?:\/\//.test(value))
    .flatMap(([, value]) => value.match(/(?<![0-9A-Za-z.,])[0-9][0-9,.]*k?(?![0-9A-Za-z])/g) ?? []));
  const fetchedCounts = new Set(stringsOf(data).flatMap(([, value]) => countsIn(normalize(value))));
  const traced = (count) => curatedNumbers.has(count) || fetchedCounts.has(count);

  for (const member of curated.members) {
    const allowed = allowedYears(member, data, curated);
    const element = entryElement(page.root, member.slug);
    if (element) {
      for (const year of yearsIn(textOf(element))) {
        assert.ok(allowed.has(year), `${member.slug}: the index shows ${year}, which no curated or fetched value of it holds`);
      }
      for (const count of countsIn(normalize(textOf(element)))) {
        assert.ok(traced(count), `${member.slug}: the index shows the count ${count}, which no source holds`);
      }
    }
    const { root } = readPage(path.join(SECTION, member.slug));
    const text = textOf(main(root));
    for (const year of yearsIn(text)) {
      assert.ok(allowed.has(year), `${member.slug}: its page shows ${year}, which no curated or fetched value of it holds`);
    }
    for (const count of countsIn(normalize(text))) {
      assert.ok(traced(count), `${member.slug}: its page shows the count ${count}, which no source holds`);
    }
  }
  const group = findFirst(page.root, attr("data-oss-group", BRAINBEAN_GROUP_ID));
  if (group) {
    const groupAllowed = new Set(yearsIn(curated.groups.find((candidate) => candidate.id === BRAINBEAN_GROUP_ID).label));
    for (const member of BRAINBEAN) {
      allowedYears(memberBySlug(curated, member.slug), data, curated).forEach((year) => groupAllowed.add(year));
    }
    for (const year of yearsIn(textOf(group))) {
      assert.ok(groupAllowed.has(year), `the group shows ${year}, which no curated value of it holds`);
    }
  }
});
