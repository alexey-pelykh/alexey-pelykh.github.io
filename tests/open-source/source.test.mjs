// Source-level checks under src/.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { NOTABLE_DESCRIPTIONS, OWN_ORGANISATION_SHA256, ROOT, expectedMembers, listFiles, readCurated, sha256Hex } from "./lib/fixtures.mjs";

const SRC = path.join(ROOT, "src");
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"]);
const CURATED_RELATIVE = path.join("src", "content", "open-source-projects.json");
const LOADER_RELATIVE = path.join("src", "lib", "open-source.ts");
const INDEX_PAGE = path.join(SRC, "app", "open-source-contributions", "page.tsx");
const PROJECT_PAGE = path.join(SRC, "app", "open-source-contributions", "[projectSlug]", "page.tsx");
const HOME_PAGE = path.join(SRC, "app", "page.tsx");
const PARTITION_RELATIVE = path.join("src", "lib", "open-source-partition.ts");

function codeFiles() {
  return listFiles(SRC)
    .filter((file) => CODE_EXTENSIONS.has(path.extname(file)))
    .filter((file) => !file.startsWith(path.join(SRC, "content", "blog") + path.sep));
}

test("no identifier SOCIAL_PROFILES remains under src/, and the renamed constant names sameAs", () => {
  for (const file of listFiles(SRC)) {
    const text = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(text, /\bSOCIAL_PROFILES\b/, `${path.relative(ROOT, file)} still names SOCIAL_PROFILES`);
  }
  const constants = fs.readFileSync(path.join(SRC, "lib", "constants.ts"), "utf8");
  const exported = [...constants.matchAll(/export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)/g)].map((match) => match[1]);
  const renamed = exported.filter((name) => /SAME_AS|sameAs/.test(name));
  assert.ok(renamed.length >= 1, `constants.ts exports a constant whose name holds SAME_AS or sameAs: ${exported.join(", ")}`);
  for (const url of ["https://github.com/alexey-pelykh", "https://linkedin.com/in/alexey-pelykh"]) {
    assert.ok(constants.includes(url), `constants.ts still lists ${url}`);
  }
});

test("src/app/page.tsx holds no hard-coded Notable entry and reads the curated source", () => {
  const home = fs.readFileSync(HOME_PAGE, "utf8");
  for (const description of NOTABLE_DESCRIPTIONS) {
    assert.ok(!home.includes(description), `page.tsx hard-codes "${description}"`);
  }
  for (const url of ["https://pcre4j.org/", "https://pptr-capture.org/", "5fe2123647c15089c3a905137bea87b16973c896", "en.wikipedia.org/wiki/OMAP"]) {
    assert.ok(!home.includes(url), `page.tsx hard-codes ${url}`);
  }
  assert.match(home, /lib\/open-source["']|content\/open-source-projects(\.json)?["']/, "page.tsx reads the curated source");
});

test("the open-source pages read their data through src/lib/open-source.ts only", () => {
  for (const file of [INDEX_PAGE, PROJECT_PAGE]) {
    const text = fs.readFileSync(file, "utf8");
    const relative = path.relative(ROOT, file);
    assert.match(text, /from\s+["'](@\/lib\/open-source|(\.\.\/)+lib\/open-source)["']/, `${relative} imports src/lib/open-source.ts`);
    for (const forbidden of ["open-source-contributions.json", "open-source-projects.json", "open-source-partition", "node:fs", "\"fs\""]) {
      assert.ok(!text.includes(forbidden), `${relative} reads ${forbidden} itself`);
    }
  }
  const loader = fs.readFileSync(path.join(ROOT, LOADER_RELATIVE), "utf8");
  assert.match(loader, /open-source-partition/, "the loader calls the partition seam");
  assert.match(loader, /open-source-projects/, "the loader reads the curated file");
});

test("neither the loader nor partition() reads an owner list; only the fetch reads expected-contribution-owners.json", () => {
  for (const relative of [LOADER_RELATIVE, PARTITION_RELATIVE]) {
    const text = fs.readFileSync(path.join(ROOT, relative), "utf8");
    assert.doesNotMatch(text, /expected-contribution-owners/, `${relative} reads expected-contribution-owners.json`);
  }
  for (const file of listFiles(SRC)) {
    const text = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(text, /openContributionOwners|contributionOwners/, `${path.relative(ROOT, file)} names an owner allowlist`);
  }
  const loader = fs.readFileSync(path.join(ROOT, LOADER_RELATIVE), "utf8");
  assert.match(loader, /ownOrganisationSha256/, "the loader reads ownOrganisationSha256");
  assert.match(loader, /node:crypto|["']crypto["']/, "the loader hashes with node:crypto");
  assert.match(loader, /isOwnOrganisation/, "the loader passes isOwnOrganisation to partition()");
});

// Comments with the line each starts and ends on: // lines (a run of them merged) and /* */ blocks.
function commentsOf(source) {
  const lines = source.split("\n");
  const comments = [];
  for (const match of source.matchAll(/\/\*[\s\S]*?\*\//g)) {
    const start = source.slice(0, match.index).split("\n").length - 1;
    comments.push({ start, end: start + match[0].split("\n").length - 1, text: match[0] });
  }
  let run = null;
  lines.forEach((line, index) => {
    const match = line.match(/(?:^|[^:"'`])\/\/(.*)$/);
    if (match) {
      if (run && run.end === index - 1) {
        run.end = index;
        run.text += ` ${match[1]}`;
      } else {
        run = { start: index, end: index, text: match[1] };
        comments.push(run);
      }
    }
  });
  return comments;
}

test("a comment beside the code reading ownOrganisationSha256 says where the hashes come from and to add a new one", () => {
  const loader = fs.readFileSync(path.join(ROOT, LOADER_RELATIVE), "utf8");
  const comments = commentsOf(loader);
  const codeOnly = loader
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .split("\n")
    .map((line) => line.replace(/(^|[^:"'`])\/\/.*$/, "$1"));
  const codeLines = codeOnly
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /ownOrganisationSha256/.test(line))
    .map(({ index }) => index);
  assert.ok(codeLines.length > 0, "the loader has code that reads ownOrganisationSha256");
  const beside = comments.filter((comment) => codeLines.some((index) => comment.end >= index - 6 && comment.start <= index + 2));
  const text = beside.map((comment) => comment.text).join(" ");
  assert.ok(beside.length > 0, "a comment sits beside the code that reads ownOrganisationSha256");
  assert.match(text, /SHA-?256/i, `the comment says the values are SHA-256 hashes: ${text}`);
  assert.match(text, /lower-?case/i, `the comment says the logins are lowercased: ${text}`);
  assert.match(text, /organi[sz]ation/i, `the comment says they are his organisations: ${text}`);
  assert.match(text, /catalog/i, `the comment names the HQ catalogue as the source: ${text}`);
  assert.match(text, /\bnew\b[^.]*organi[sz]ation|organi[sz]ation[^.]*\bnew\b/i, `the comment covers a new organisation: ${text}`);
  assert.match(text, /\badd/i, `the comment says a new hash must be added: ${text}`);
  const hashes = new Set(OWN_ORGANISATION_SHA256);
  for (const comment of comments) {
    for (const token of comment.text.match(/[A-Za-z0-9][A-Za-z0-9._-]*/g) ?? []) {
      for (const candidate of new Set([token, token.replace(/[._-]+$/, "")])) {
        assert.ok(!hashes.has(sha256Hex(candidate.toLowerCase())), `a comment in ${LOADER_RELATIVE} names an organisation at line ${comment.start + 1}`);
      }
    }
  }
});

test("no file under src/ but the curated file and its loader names a member repository", () => {
  const curated = readCurated();
  const repositories = expectedMembers(curated).flatMap((member) => member.repositories).map((name) => name.toLowerCase());
  for (const file of codeFiles()) {
    const relative = path.relative(ROOT, file);
    if (relative === CURATED_RELATIVE || relative === LOADER_RELATIVE) {
      continue;
    }
    const text = fs.readFileSync(file, "utf8").toLowerCase();
    for (const repository of repositories) {
      assert.ok(!text.includes(repository), `${relative} names the member repository ${repository}`);
    }
  }
});

test("the project page escapes \"<\" in the JSON-LD it inlines, so no fetched title can end the script", () => {
  const page = fs.readFileSync(PROJECT_PAGE, "utf8");
  const inlined = page.match(/dangerouslySetInnerHTML=\{\{\s*__html:[^}]*\}\}/g) ?? [];
  assert.ok(inlined.length > 0, "the project page inlines JSON-LD");
  // A site whose expression holds a brace escapes the pattern above, so every site must be one it found.
  assert.equal(inlined.length, page.split("dangerouslySetInnerHTML").length - 1, "every inlined site is checked");
  for (const site of inlined) {
    assert.match(site, /JSON\.stringify\([^)]*\)\.replace\(\/<\/g, "\\\\u003c"\)/, `the inlined JSON escapes "<": ${site}`);
  }
});
