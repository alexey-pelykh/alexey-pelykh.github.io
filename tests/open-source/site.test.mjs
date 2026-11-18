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
  CURATED_PATH,
  DATA_PATH,
  NOTABLE,
  OTHER_PROJECTS,
  OUT,
  PARTITION_PATH,
  ROOT,
  SITE_URL,
  expectedCards,
  expectedMembers,
  listFiles,
  pageExists,
  partitionReal,
  readPage,
  sameRepository,
  siteUrl,
  stringsOf,
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

function hrefPath(href) {
  if (!href) return "";
  return href.startsWith(SITE_URL) ? href.slice(SITE_URL.length) : href;
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
  for (const marker of [...findAll(root, hasAttr("data-oss-card")), ...findAll(root, hasAttr("data-oss-other-projects"))]) {
    assert.ok(isInside(marker, first), "every card and the GitHub link sit in the first section");
  }
  assert.equal(findAll(root, (element) => element.tag === "input" && (element.attrs.type ?? "").toLowerCase() === "checkbox").length, 0, "no checkbox");
  assert.equal(findAll(root, attr("role", "switch")).length, 0, "no switch");
});

// ---------------------------------------------------------------------------------------------------------

function projectsSection(root) {
  const heading = findAll(root, byTag("h2")).find((element) => normalize(textOf(element)) === "My open-source projects");
  assert.ok(heading, "the page has the heading My open-source projects");
  const section = closest(heading, byTag("section"));
  assert.ok(section, "the heading sits in a <section>");
  return { heading, section };
}

function cardElement(root, slug) {
  const element = findFirst(root, attr("data-oss-card", slug));
  assert.ok(element, `the card ${slug} is on the page`);
  return element;
}

function opensInNewTab(link) {
  const rel = (link.attrs.rel ?? "").split(/\s+/);
  return link.attrs.target === "_blank" && rel.includes("noopener");
}

test("My open-source projects shows the six cards in the owner's order, then the GitHub link, and nothing else", async () => {
  const { page, curated } = await context();
  const { heading, section } = projectsSection(page.root);
  const cards = expectedCards(curated);
  assert.deepEqual(findAll(section, hasAttr("data-oss-card")).map((element) => element.attrs["data-oss-card"]), cards.map((card) => card.slug));
  assert.deepEqual(findAll(page.root, hasAttr("data-oss-card")).length, cards.length, "no card outside the section");
  for (const marker of ["data-oss-row", "data-oss-group"]) {
    assert.equal(findAll(page.root, hasAttr(marker)).length, 0, `no ${marker} on the page`);
  }
  const items = findAll(section, byTag("li"));
  assert.equal(items.length, cards.length, "the section's only list items are the six cards");
  for (const item of items) {
    assert.ok("data-oss-card" in item.attrs, "every list item of the section is a card");
  }
  // Nothing in the section but the heading, one intro line, the cards and the GitHub link: its text is exactly theirs.
  const others = findAll(section, hasAttr("data-oss-other-projects"));
  assert.equal(others.length, 1, "one GitHub link line");
  const intro = section.children.filter((child) => child.type === "element" && child.tag === "p" && !("data-oss-other-projects" in child.attrs));
  assert.equal(intro.length, 1, "one intro line");
  const parts = [heading, intro[0], ...items, others[0]].map((element) => normalize(textOf(element)));
  assert.equal(normalize(textOf(section)), normalize(parts.join("")), "the section holds nothing but the heading, the intro, the cards and the GitHub link");
  for (const link of findAll(section, byTag("a"))) {
    assert.ok(!hrefPath(link.attrs.href).startsWith(`/${SECTION}/`), `the section links to the page ${link.attrs.href}`);
  }
  const text = normalize(textOf(section));
  for (const member of expectedMembers(curated).filter((candidate) => !cards.some((card) => card.slug === candidate.slug))) {
    const name = curated.members.find((candidate) => candidate.slug === member.slug).name;
    assert.ok(!text.includes(name), `the section names ${name}, which has no card`);
  }
  for (const phrase of ["Brainbean", "dataplug", "Pelykh.Common", "puppeteer-java", "dormant since 2015", "scaffold"]) {
    assert.ok(!text.includes(phrase), `the section says "${phrase}"`);
  }
});

test("each card's main link opens the project's own site in a new tab, and any other link is its repository or upstream", async () => {
  const { page, curated } = await context();
  for (const card of expectedCards(curated)) {
    const element = cardElement(page.root, card.slug);
    const heading = findFirst(element, byTag("h3"));
    assert.ok(heading, `${card.slug} has an <h3>`);
    const primary = findFirst(heading, byTag("a"));
    assert.ok(primary, `${card.slug}: the name is a link`);
    assert.equal(normalize(textOf(primary)), card.name, `${card.slug}: link text`);
    assert.equal(siteUrl(primary.attrs.href), siteUrl(card.url), `${card.slug}: the main link goes to the project's own site`);
    assert.ok(opensInNewTab(primary), `${card.slug}: the main link opens in a new tab`);
    const repository = `https://github.com/${card.repositories[0]}`;
    const allowed = new Set([siteUrl(card.url), repository, ...(card.upstream ? [`https://github.com/${card.upstream}`] : [])]);
    for (const link of findAll(element, byTag("a"))) {
      assert.ok(allowed.has(siteUrl(link.attrs.href)), `${card.slug} links to ${link.attrs.href}`);
      assert.ok(opensInNewTab(link), `${card.slug}: ${link.attrs.href} opens in a new tab`);
      if (normalize(textOf(link)) === "GitHub") {
        assert.equal(link.attrs.href, repository, `${card.slug}: the GitHub link goes to its repository`);
      }
    }
  }
});

test("the cards carry their pinned text: the four kept as they were, lhremote, and UVCCamera as a hard fork", async () => {
  const { page, curated } = await context();
  for (const card of expectedCards(curated)) {
    const text = normalize(textOf(cardElement(page.root, card.slug)));
    assert.ok(text.includes(card.summary), `${card.slug} shows "${card.summary}": ${text}`);
    if (card.caveat) {
      assert.ok(text.includes(card.caveat), `${card.slug} shows "${card.caveat}": ${text}`);
    }
  }
  const qontoctl = normalize(textOf(cardElement(page.root, "qontoctl")));
  assert.match(qontoctl, /unofficial/i);
  assert.ok(qontoctl.includes("not affiliated with Qonto"), qontoctl);
  assert.ok(normalize(textOf(cardElement(page.root, "webp-android-backport"))).includes("dormant since 2016"), "the webp-android-backport card states its era");
  const uvc = expectedCards(curated).find((card) => card.name === "UVCCamera");
  const uvcElement = cardElement(page.root, uvc.slug);
  const uvcText = normalize(textOf(uvcElement));
  assert.ok(uvcText.includes("Hard fork of saki4510t/UVCCamera"), uvcText);
  const upstream = findAll(uvcElement, byTag("a")).find((link) => normalize(textOf(link)) === "saki4510t/UVCCamera");
  assert.ok(upstream, "saki4510t/UVCCamera is a link");
  assert.equal(upstream.attrs.href, "https://github.com/saki4510t/UVCCamera");
  assert.doesNotMatch(uvcText, /README|0\.1\.0|0\.0\.13/, "the UVCCamera card carries no note on the README's version");
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

test("after the cards, one link reads \"See my other projects on GitHub\" and opens the GitHub profile in a new tab", async () => {
  const { page } = await context();
  const { section } = projectsSection(page.root);
  const lines = findAll(section, hasAttr("data-oss-other-projects"));
  assert.equal(lines.length, 1, "one GitHub link line");
  const links = findAll(lines[0], byTag("a"));
  assert.equal(links.length, 1, "the line holds one link");
  const [link] = links;
  assert.equal(normalize(textOf(link)), OTHER_PROJECTS.text);
  assert.equal(link.attrs.href, OTHER_PROJECTS.url);
  assert.ok(opensInNewTab(link), "the link opens in a new tab");
  const order = findAll(page.root, () => true);
  const lastCard = findAll(section, hasAttr("data-oss-card")).at(-1);
  assert.ok(order.indexOf(link) > order.indexOf(lastCard), "the link follows the last card");
  const linksToProfile = findAll(page.root, byTag("a")).filter((candidate) => siteUrl(candidate.attrs.href) === OTHER_PROJECTS.url);
  assert.equal(linksToProfile.length, 1, "the page links the GitHub profile once");
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

test("no member has a page, every contribution has one, and the sitemap lists exactly the contribution pages", async () => {
  const { result, curated } = await context();
  for (const member of expectedMembers(curated)) {
    assert.ok(!pageExists(path.join(SECTION, member.slug)), `${member.slug} has no page`);
  }
  for (const entry of result.contributions) {
    assert.ok(pageExists(path.join(SECTION, entry.slug)), `the page of ${entry.slug} exists`);
  }
  const directories = fs.readdirSync(path.join(OUT, SECTION), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  assert.deepEqual(directories.sort(), result.contributions.map((entry) => entry.slug).sort(), "the section's directories are the contribution pages");
  const sitemap = fs.readFileSync(path.join(OUT, "sitemap-0.xml"), "utf8");
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replace(/\/$/, ""))
    .filter((url) => url.startsWith(`${SITE_URL}/${SECTION}/`));
  assert.deepEqual(listed.sort(), result.contributions.map((entry) => `${SITE_URL}/${SECTION}/${entry.slug}`).sort(), "the sitemap lists the contribution pages and no member page");
  const uvccamera = readPage(path.join(SECTION, "uvccamera"));
  assert.ok(normalize(textOf(uvccamera.root)).includes("saki4510t/UVCCamera") ||
    findAll(uvccamera.root, byTag("a")).some((link) => (link.attrs.href ?? "").includes("github.com/saki4510t/UVCCamera")),
  "the uvccamera contribution page holds saki4510t/UVCCamera");
});

test("every contribution page shows its pull request titles as written", async () => {
  const { result } = await context();
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
  for (const marker of [...findAll(root, hasAttr("data-oss-card")), ...findAll(root, hasAttr("data-pr-status"))]) {
    const item = closest(marker, byTag("li"));
    assert.ok(item && ["ul", "ol"].includes(item.parent.tag), `${label}: ${JSON.stringify(marker.attrs)} is an <li> of a <ul> or <ol>`);
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

function memberPullRequests(data, member) {
  return allDataPullRequests(data).filter(({ repository }) =>
    member.repositories.some((name) => sameRepository(name, repository.name)));
}

function allowedYears(card, data) {
  const years = new Set();
  for (const [, value] of stringsOf(card)) {
    yearsIn(value).forEach((year) => years.add(year));
  }
  for (const { repository, pullRequest } of memberPullRequests(data, card)) {
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

test("every year and every star or fork count on a card traces to its source", async () => {
  const { page, curated, data } = await context();
  // A count traces when a curated string, apart from the hashes and URLs, holds it as a whole number, or when a
  // fetched string, such as a pull request title, shows the same count. The fetched data holds no star or fork count
  // field, and its only numbers are pull request numbers, so no fetched number traces a count.
  const curatedNumbers = new Set(stringsOf({ ...curated, ownOrganisationSha256: [] })
    .filter(([, value]) => !/^https?:\/\//.test(value))
    .flatMap(([, value]) => value.match(/(?<![0-9A-Za-z.,])[0-9][0-9,.]*k?(?![0-9A-Za-z])/g) ?? []));
  const fetchedCounts = new Set(stringsOf(data).flatMap(([, value]) => countsIn(normalize(value))));
  const traced = (count) => curatedNumbers.has(count) || fetchedCounts.has(count);
  for (const card of curated.members.filter((member) => "cardOrder" in member)) {
    const allowed = allowedYears(card, data);
    const element = cardElement(page.root, card.slug);
    for (const year of yearsIn(textOf(element))) {
      assert.ok(allowed.has(year), `${card.slug}: the card shows ${year}, which no curated or fetched value of it holds`);
    }
    for (const count of countsIn(normalize(textOf(element)))) {
      assert.ok(traced(count), `${card.slug}: the card shows the count ${count}, which no source holds`);
    }
  }
});
