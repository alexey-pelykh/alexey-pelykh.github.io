// Shared paths, loaders and the pinned expectations of the "My open-source projects" section.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseHtml } from "./html.mjs";

export const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export const CURATED_PATH = path.join(ROOT, "src", "content", "open-source-projects.json");
export const DATA_PATH = path.join(ROOT, "data", "open-source-contributions.json");
export const EXPECTED_OWNERS_PATH = path.join(ROOT, "expected-contribution-owners.json");
export const PARTITION_PATH = path.join(ROOT, "src", "lib", "open-source-partition.ts");
export const FETCH_SCRIPT_PATH = path.join(ROOT, "retrieve-open-source-contributions.js");
export const OUT = path.join(ROOT, "out");
export const SITE_URL = "https://alexey-pelykh.com";
export const CONTRIBUTOR = "alexey-pelykh";
export const SLUG_PATTERN = /^[a-z0-9-]+$/;
export const PROMOTION_KEYS = ["remoteclaw/remoteclaw#3233", "remoteclaw/remoteclaw#3234"];
export const EXCLUSION_KEYS = [
  "appcypher/awesome-mcp-servers#774",
  "punkpeye/awesome-mcp-servers#2169",
  "MunGell/awesome-for-beginners#1905",
  "up-for-grabs/up-for-grabs.net#5558",
];
// The lowercase hex SHA-256 of each of his organisation logins, lowercased before hashing, as the curated file
// carries them in ownOrganisationSha256. The list names no organisation; one that owns a member repository is
// named anyway by that repository's URL.
export const OWN_ORGANISATION_SHA256 = [
  "0edf73b2c12201d7ec4ea6797c30274b649feb34b62d39583db7927438eeb484",
  "124cebbb02000e9122e2bb5694b5f9e11c19a5f1a30e6164bb52541254241a81",
  "219d3ed7bf846559e52e5948e11281e0f178051a1e19c4c8deeae7ef2e9c2633",
  "21aa04c36e6e3060afdb77859ba2e7c51b30b752777878ee9f49c3288f689ebc",
  "3202cd424efe3bddbf0dabe2a4b2ed4be00aeac71b4abf3b9bd055dc3d3534be",
  "41941483a08c9c822fd2c4ffa9717482cee920c918e7d115879bbba2199a1dd1",
  "4cd8c9c16b200cb817b9fd4671741e1f18ab8f30ea6970f846337e2ad5827675",
  "4e330f761ed56fc5bde6900025d35f56585824cc91b7b8698637204ec21c4a56",
  "594e4de279fc622c0c9a08f46ee6c4d9905a63eb55429036eddf10828299fef0",
  "5cb733c55ecc959ddb30d9d9b89c5e32d86600f81c0c85931fea199661ac7853",
  "6bb89b57e6d919a62fe05ed756b08d3404d1db19ab8acf587d17809e21fa0e20",
  "709280c79850c0c4f23ca13feecf54e5795d9ee34a178467d63126b3a3aa4fdf",
  "71db07710f331cf2f879a3b40553e7bf055fcb729df8794d39af782b294edfa9",
  "746f85f531abcde8ce347828604b0ccfc9118b74897817d6ae71abcef09c0ba4",
  "79d8130662bea5e2407880dc4551f52a2253ea5bb3e3bf8ad575d4cd0df5ff7b",
  "8cc0c930b5fc71d185a6abe9773aa67237de35cfe3ff5a4d07c49fbacf8c91bc",
  "91c5e222be03d7c1874baef89f84758b2f9f4e5fe1068aa2b48b7b460bf2cdae",
  "9a697f33a7975e731537c4b723f911d3d12b5ad403f07ba4284d834b39cde3a0",
  "ab6fa9dd0fde033bb8e6ac1187bd374a3dce2923229fbed26e33957d03d6070b",
  "aeda27ee72887422239fa4fe4aeb3901e146d24e941ee6301b2cea7b5505bca3",
  "b34fe95b1dee374d3b6bdb79d32da460fcbe18b44cefac17f9a0555c59ebe22e",
  "ba93efce6fe7756c85764c8fa19eaa14394a293e54d5075474eae1b73e858822",
  "cf2571bf80bc6e907b8b0d9531979833e3f0c20b0ebcec4e5c3e1163a1f67b2b",
  "cfe022f20da257ca0ff866d5f145d3d7cdb89a2b77b5c48cebcfcd9fb01c3bae",
  "d9a99784242581da324232555dcfefc67fd66e708c4ee6c320d1060c05d8361a",
  "dbfd905a5dc86fe3bbe5bb90627fe0fc3988fe8a0cab72243a8ac5cbee0cc920",
  "df8485405c55c848867883a760adcb4e7243d7252f2b308b0b75ca65a8eef10b",
  "e522961427ba3165d822a7356905f4b26e830e96c7aa06bc592547b7104665b2",
  "ebb88d70425ce0d31cba9401d0052628414d0942ad5d3b70df74cee0417762c4",
  "ebcee953888401b2dd35de435cb401be3c1a30008c2cfadd96881f38db0e33b6",
  "f2795f8a716615bf2ce7140dc3846580af53ac956e130a817ad2a0fe2fec7da3",
  "f6d22758f64d18beac15e1405a0598aea5b9b38b7b8a3d4ae3abac5c2192ecca",
  "fafa2ad379366f9131e5f049eaf480e9c15283fe10f9113e99501c1beaed5fe4",
];

// Third-party owners whose only pull requests are open today: shown with the "Open" label without being listed
// anywhere, because the contribution rule shows a pull request that is still open.
export const OPEN_ONLY_OWNERS = ["CompVis", "KhronosGroup", "odoo", "dancormier", "gotosleep"];

// A CI log of a public repository is public, so under CI a message about the fetched data names a repository or a
// pull request by its position in the data, never by its name: the data holds repositories the pages never show.
export function logName(name, position) {
  return process.env.CI ? position : name;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function readCurated() {
  return readJson(CURATED_PATH);
}

export function readData() {
  return readJson(DATA_PATH);
}

export function sha256Hex(text) {
  return createHash("sha256").update(text).digest("hex");
}

// The own-organisation test as the loader runs it: the SHA-256 of owner.toLowerCase() is in the list.
export function isOwnOrganisationFrom(hashes) {
  const set = new Set(hashes);
  return (owner) => set.has(sha256Hex(String(owner).toLowerCase()));
}

// The rules (a) to (e) a pull request must all pass to be shown among the contributions.
export function contributionVerdict({ repository, pullRequest, memberRepositories, isOwnOrganisation, contributor = CONTRIBUTOR }) {
  const owner = repository.owner ?? repository.name.split("/")[0];
  return {
    member: memberRepositories.some((name) => sameRepository(name, repository.name)),
    contributorOwned: owner.toLowerCase() === contributor.toLowerCase(),
    ownOrganisation: isOwnOrganisation(owner),
    isPrivate: repository.isPrivate !== false,
    selfMerged: Boolean(pullRequest.merged) && pullRequest.mergedBy === contributor,
  };
}

export function isShownContribution(verdict) {
  return !verdict.member && !verdict.contributorOwned && !verdict.ownOrganisation && !verdict.isPrivate && !verdict.selfMerged;
}

export async function loadPartition() {
  const module = await import(pathToFileURL(PARTITION_PATH).href);
  if (typeof module.partition !== "function") {
    throw new Error(`${PARTITION_PATH} exports no function named partition`);
  }
  return module.partition;
}

export async function partitionReal({ issueStates } = {}) {
  const partition = await loadPartition();
  const curated = readCurated();
  const data = readData();
  const input = {
    curated,
    data: issueStates ? { ...data, issueStates } : data,
    isOwnOrganisation: isOwnOrganisationFrom(curated.ownOrganisationSha256),
    contributor: CONTRIBUTOR,
  };
  return { result: partition(input), curated, data };
}

export function readPage(relativeDirectory) {
  const file = path.join(OUT, relativeDirectory, "index.html");
  const html = fs.readFileSync(file, "utf8");
  return { file, html, root: parseHtml(html) };
}

export function pageExists(relativeDirectory) {
  return fs.existsSync(path.join(OUT, relativeDirectory, "index.html"));
}

export function listFiles(directory) {
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(full);
      } else if (entry.isFile()) {
        files.push(full);
      }
    }
  };
  visit(directory);
  return files;
}

export function sameRepository(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

// The six cards, in display order, as the owner chose them on 2026-11-18. Each url is the project's own site, which the
// card's main link opens; webp-android-backport has no site, so its url is its repository. The UVCCamera member's slug
// is free except that it is not `uvccamera`, a contribution page's slug, so it is null here and read from the curated
// file by its repository.
export const CARDS = [
  {
    slug: "puppeteer-capture",
    repositories: ["alexey-pelykh/puppeteer-capture"],
    cardOrder: 1,
    name: "Puppeteer-Capture",
    url: "https://pptr-capture.org/",
    summary: "Stream capture for Chromium. PostHog built its session-replay-to-MP4 rasterizer on puppeteer-capture.",
  },
  {
    slug: "pcre4j",
    repositories: ["alexey-pelykh/pcre4j"],
    cardOrder: 2,
    name: "PCRE4J",
    url: "https://pcre4j.org/",
    summary: "PCRE2 library bindings for Java, with 100% coverage of the PCRE2 API. On Maven Central as org.pcre4j:lib.",
  },
  {
    slug: "qontoctl",
    repositories: ["alexey-pelykh/qontoctl"],
    cardOrder: 3,
    name: "QontoCtl",
    url: "https://qontoctl.org",
    summary: "CLI and MCP server for the Qonto banking API.",
    caveat: "Unofficial: not affiliated with Qonto, and not endorsed or supported by it.",
  },
  {
    slug: "webp-android-backport",
    repositories: ["alexey-pelykh/webp-android-backport"],
    cardOrder: 4,
    name: "webp-android-backport",
    url: "https://github.com/alexey-pelykh/webp-android-backport",
    summary: "WebP format support for Android <4.0. 515 stars and 114 forks on GitHub as of November 2026.",
    caveat: "Published, not maintained: dormant since 2016.",
    dormant: true,
  },
  {
    slug: "lhremote",
    repositories: ["alexey-pelykh/lhremote"],
    cardOrder: 5,
    name: "lhremote",
    url: "https://lhremote.org",
    summary: "CLI and MCP server for LinkedHelper automation.",
  },
  {
    slug: null,
    repositories: ["alexey-pelykh/UVCCamera"],
    cardOrder: 6,
    name: "UVCCamera",
    url: "https://uvccamera.org",
    summary: "USB Video Class (UVC) camera library for Android, plus a Flutter plugin.",
    upstream: "saki4510t/UVCCamera",
  },
];

// Where the line after the cards sends a visitor, and its text.
export const OTHER_PROJECTS = { text: "See my other projects on GitHub", url: "https://github.com/alexey-pelykh" };

// The members without a card. Each one is listed only so its repositories stay out of the contributions section: it
// has no card, no row and no page.
export const OTHER_MEMBERS = [
  { slug: "linkedctl", repositories: ["alexey-pelykh/linkedctl"] },
  { slug: "ttctl", repositories: ["alexey-pelykh/ttctl"] },
  { slug: "remoteclaw", repositories: ["remoteclaw/remoteclaw"] },
  { slug: "puppeteer-java", repositories: ["alexey-pelykh/puppeteer-java"] },
  { slug: "redux-trivial-actions", repositories: ["alexey-pelykh/redux-trivial-actions"] },
  { slug: "ffmpeg-static", repositories: ["alexey-pelykh/ffmpeg-static"] },
  { slug: "sessiometer", repositories: ["alexey-pelykh/sessiometer"] },
  { slug: "getreceipt", repositories: ["alexey-pelykh/getreceipt"] },
  { slug: "ccctl", repositories: ["alexey-pelykh/ccctl"] },
  { slug: "oca-review-independence", repositories: ["alexey-pelykh/oca-review-independence"] },
  { slug: "gripeventsctl", repositories: ["alexey-pelykh/gripeventsctl"] },
  {
    slug: "dataplug",
    repositories: [
      "dataplug-io/dataplug", "dataplug-io/dataplug-cli", "dataplug-io/dataplug-testsuite", "dataplug-io/dataplug-csv",
      "dataplug-io/dataplug-flatters", "dataplug-io/dataplug-http", "dataplug-io/dataplug-json", "dataplug-io/dataplug-sql",
      "dataplug-io/dataplug-xml", "dataplug-io/bigquery-dataplug", "dataplug-io/breezyhr-dataplug", "dataplug-io/csv-dataplug",
      "dataplug-io/hubspot-dataplug", "dataplug-io/jira-dataplug", "dataplug-io/sql-dataplug", "dataplug-io/swedbank-dataplug",
      "dataplug-io/tempo-dataplug", "dataplug-io/toggl-dataplug", "dataplug-io/xero-dataplug",
    ],
  },
  { slug: "pelykh-common", repositories: ["alexey-pelykh/Pelykh.Common"] },
  ...[
    "base-linux-build-environment", "android-bare-build-environment", "android-ndk-build-environment",
    "android-nondk-build-environment", "android-system-build-environment", "nodejs-build-environment",
    "php-build-environment", "ruby-build-environment", "docker-asterisk", "docker-freepbx",
    "docker-auth0-ad-ldap-connector", "docker-gcds", "payoneer-client", "payoneer-mobile-api",
    "payoneer-mobile-api-python", "swedbank-ee-client", "asicjs", "xmlencjs", "authgate-js", "object-mapping",
    "npm-node-horseman", "jekyll-multilang", "ValueAnimation", "BrowserStackTool",
  ].map((repository) => ({ slug: repository.toLowerCase(), repositories: [`brainbeanapps/${repository}`] })),
];

export const FORK_UPSTREAMS = {
  "remoteclaw/remoteclaw": "openclaw/openclaw",
  "alexey-pelykh/UVCCamera": "saki4510t/UVCCamera",
  "alexey-pelykh/redux-trivial-actions": "brainbeanapps/redux-trivial-actions",
};

// Repositories that are never members. Names that must not be written in a committed file are left out of this list.
export const NEVER_MEMBER_REPOSITORIES = [
  "osmandapp/OsmAnd-core",
  "alexey-pelykh/flutter-patch",
  "alexey-pelykh/remotion-test-two-gltfs",
  "alexey-pelykh/reproduce-pylint-pep420-cyclic-import-false-positive",
  "brainbeanapps/redux-trivial-actions",
  "qontoctl/homebrew-tap",
  "sessiometer/homebrew-tap",
  "ccctl/patch",
  "alexey-pelykh/alexey-pelykh",
  "alexey-pelykh/alexey-pelykh.github.io",
];

// The keys every member holds, the keys only a card may hold, and the one key the fetch reads.
export const REQUIRED_MEMBER_KEYS = ["slug", "name", "kind", "repositories"];
export const CARD_KEYS = new Set(["cardOrder", "url", "summary", "caveat", "upstream"]);
export const REQUIRED_CARD_KEYS = ["cardOrder", "url", "summary"];
export const ALLOWED_MEMBER_KEYS = new Set([...REQUIRED_MEMBER_KEYS, ...CARD_KEYS, "promoteToCardWhenClosed"]);

export function uvcCameraSlug(curated) {
  const member = curated.members.find((candidate) =>
    (candidate.repositories ?? []).some((repository) => repository === "alexey-pelykh/UVCCamera"));
  return member?.slug;
}

// The six cards with the UVCCamera slug read from the curated file.
export function expectedCards(curated) {
  const uvcSlug = uvcCameraSlug(curated);
  return CARDS.map((card) => ({ ...card, slug: card.slug ?? uvcSlug }));
}

export function expectedMembers(curated) {
  return [...expectedCards(curated), ...OTHER_MEMBERS];
}

export function memberBySlug(curated, slug) {
  return curated.members.find((member) => member.slug === slug);
}

// A URL without its trailing slash, so https://pcre4j.org/ and https://pcre4j.org compare equal.
export function siteUrl(url) {
  return String(url ?? "").replace(/\/+$/, "");
}

// The members that carry a "dormant since" caveat, and the year of their last push in the owner's project catalogue.
export const DORMANT_SINCE = {
  "webp-android-backport": "2016",
};

// The homepage Notable list as rendered at HEAD c36ed49 (src/app/page.tsx:317-338).
const pullsBy = (repository) => `https://github.com/${repository}/pulls?q=is%3Apr+author%3Aalexey-pelykh`;
export const NOTABLE = [
  { text: "PCRE4J – Perl-compatible regular expressions for Java;", links: [["PCRE4J", "https://pcre4j.org/"]] },
  { text: "Puppeteer-Capture – a pixel-perfect stream capture for Chromium;", links: [["Puppeteer-Capture", "https://pptr-capture.org/"]] },
  {
    text: "Linux Kernel – 1MBaud+ serial port speed support for OMAP platform;",
    links: [
      ["Linux Kernel", "https://github.com/torvalds/linux/commit/5fe2123647c15089c3a905137bea87b16973c896"],
      ["OMAP", "https://en.wikipedia.org/wiki/OMAP"],
    ],
  },
  { text: "Pylint – Implicit Namespace Packages (PEP 420) support;", links: [["Pylint", pullsBy("pylint-dev/pylint")]] },
  { text: "Google Yapf – fixes for lambdas, dictionaries and argument lists;", links: [["Google Yapf", pullsBy("google/yapf")]] },
  { text: "Google Filament – GLTF extras support, build improvements;", links: [["Google Filament", pullsBy("google/filament")]] },
  { text: "Apache Commons Collections – Cartesian product iterator;", links: [["Apache Commons Collections", pullsBy("apache/commons-collections")]] },
  { text: "OCA's Project – project roles support and related modules;", links: [["OCA's Project", pullsBy("OCA/project")]] },
  {
    text: "OCA's Timesheet – utilization analysis and report, granular billing control, timesheet approval strategies;",
    links: [["OCA's Timesheet", pullsBy("OCA/timesheet")]],
  },
  { text: "OCA's Jira Connector – Tempo Timesheets support;", links: [["OCA's Jira Connector", pullsBy("OCA/connector-jira")]] },
  { text: "OCA's HR – advanced accrual time-off module, multi-currency contracts;", links: [["OCA's HR", pullsBy("OCA/hr")]] },
  {
    text: "OCA's Bank Statements – online bank statements support for PayPal, Wise.com, Braintree, statements auto-split module, etc;",
    links: [["OCA's Bank Statements", pullsBy("OCA/bank-statement-import")]],
  },
];

export const NOTABLE_DESCRIPTIONS = [
  "Perl-compatible regular expressions for Java",
  "a pixel-perfect stream capture for Chromium",
  "1MBaud+ serial port speed support for",
  "Implicit Namespace Packages (PEP 420) support",
  "fixes for lambdas, dictionaries and argument lists",
  "GLTF extras support, build improvements",
  "Cartesian product iterator",
  "project roles support and related modules",
  "utilization analysis and report, granular billing control, timesheet approval strategies",
  "Tempo Timesheets support",
  "advanced accrual time-off module, multi-currency contracts",
  "online bank statements support for PayPal, Wise.com, Braintree, statements auto-split module, etc",
];

// Every string value inside a JSON value, with the path that leads to it.
export function stringsOf(value, at = "$") {
  if (typeof value === "string") {
    return [[at, value]];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => stringsOf(item, `${at}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => [[`${at}.${key}#key`, key], ...stringsOf(item, `${at}.${key}`)]);
  }
  return [];
}

export function yearsIn(text) {
  return [...String(text).matchAll(/(?<![0-9])(19[5-9][0-9]|20[0-9][0-9])(?![0-9])/g)].map((match) => match[1]);
}
