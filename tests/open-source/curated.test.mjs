// The committed curated file, src/content/open-source-projects.json.
import assert from "node:assert/strict";
import test from "node:test";
import {
  ALLOWED_MEMBER_KEYS,
  CARD_KEYS,
  DORMANT_SINCE,
  FORK_UPSTREAMS,
  NEVER_MEMBER_REPOSITORIES,
  NOTABLE,
  OWN_ORGANISATION_SHA256,
  PROMOTION_KEYS,
  REQUIRED_CARD_KEYS,
  REQUIRED_MEMBER_KEYS,
  SLUG_PATTERN,
  expectedCards,
  expectedMembers,
  memberBySlug,
  readCurated,
  siteUrl,
  stringsOf,
  uvcCameraSlug,
} from "./lib/fixtures.mjs";

test("the curated file has only the three top-level keys", () => {
  const curated = readCurated();
  assert.deepEqual(Object.keys(curated).sort(), ["members", "notable", "ownOrganisationSha256"]);
  assert.ok(Array.isArray(curated.members), "members is an array");
  assert.ok(Array.isArray(curated.notable), "notable is an array");
});

test("the member slugs equal exactly the 43 expected members, each with its repositories", () => {
  const curated = readCurated();
  const uvcSlug = uvcCameraSlug(curated);
  assert.ok(uvcSlug, "a member holds alexey-pelykh/UVCCamera");
  assert.notEqual(uvcSlug, "uvccamera", "the UVCCamera member does not take the slug `uvccamera`");
  const expected = expectedMembers(curated);
  assert.equal(expected.length, 43);
  const actualSlugs = curated.members.map((member) => member.slug).sort();
  assert.deepEqual(actualSlugs, expected.map((member) => member.slug).sort());
  for (const member of expected) {
    const actual = memberBySlug(curated, member.slug);
    assert.deepEqual(
      [...actual.repositories].sort(),
      [...member.repositories].sort(),
      `repositories of ${member.slug}`,
    );
  }
});

test("every member has kind \"project\"", () => {
  const curated = readCurated();
  for (const member of curated.members) {
    assert.equal(member.kind, "project", `kind of ${member.slug}`);
  }
});

test("member slugs match ^[a-z0-9-]+$ and are unique", () => {
  const curated = readCurated();
  const slugs = curated.members.map((member) => member.slug);
  for (const slug of slugs) {
    assert.match(slug, SLUG_PATTERN);
  }
  assert.equal(new Set(slugs).size, slugs.length, "member slugs are unique");
});

test("no repository is listed by two members", () => {
  const curated = readCurated();
  const seen = new Map();
  for (const member of curated.members) {
    for (const repository of member.repositories) {
      const key = repository.toLowerCase();
      assert.ok(!seen.has(key), `${repository} is listed by ${seen.get(key)} and ${member.slug}`);
      seen.set(key, member.slug);
    }
  }
});

test("no never-member repository is a member repository", () => {
  const curated = readCurated();
  const repositories = curated.members.flatMap((member) => member.repositories);
  for (const repository of repositories) {
    const key = repository.toLowerCase();
    assert.ok(!NEVER_MEMBER_REPOSITORIES.some((never) => never.toLowerCase() === key), `${repository} is never a member`);
    assert.doesNotMatch(key, /\.github\.io$/, `${repository}: no *.github.io repository is a member`);
    assert.doesNotMatch(key, /\/\.github$/, `${repository}: no .github repository is a member`);
    assert.doesNotMatch(key, /\/homebrew-tap$/, `${repository}: no homebrew tap is a member`);
    assert.doesNotMatch(key, /\/patch$/, `${repository}: no patch repository is a member`);
  }
});

test("every member holds only the allowed keys, and the required ones", () => {
  const curated = readCurated();
  for (const member of curated.members) {
    for (const key of Object.keys(member)) {
      assert.ok(ALLOWED_MEMBER_KEYS.has(key), `${member.slug} holds the key ${key}, which is not allowed`);
    }
    for (const key of REQUIRED_MEMBER_KEYS) {
      assert.ok(key in member, `${member.slug} lacks the key ${key}`);
    }
    assert.ok(Array.isArray(member.repositories) && member.repositories.length > 0, `repositories of ${member.slug}`);
    for (const repository of member.repositories) {
      assert.match(repository, /^[^/\s]+\/[^/\s]+$/, `${member.slug}: ${repository} is owner/repo`);
    }
  }
});

test("exactly six cards, in the owner's order, each with the fields its card reads", () => {
  const curated = readCurated();
  const cards = curated.members.filter((member) => "cardOrder" in member);
  assert.equal(cards.length, 6);
  const ordered = [...cards].sort((a, b) => a.cardOrder - b.cardOrder);
  assert.deepEqual(ordered.map((member) => member.slug), expectedCards(curated).map((card) => card.slug));
  assert.deepEqual(ordered.map((member) => member.cardOrder), [1, 2, 3, 4, 5, 6]);
  for (const card of cards) {
    for (const key of REQUIRED_CARD_KEYS) {
      assert.ok(key in card, `the card ${card.slug} lacks ${key}`);
    }
  }
});

test("every card links to the project's own site, and its text is the pinned text", () => {
  const curated = readCurated();
  for (const expected of expectedCards(curated)) {
    const card = memberBySlug(curated, expected.slug);
    assert.ok(card, `${expected.slug} is a member`);
    assert.equal(siteUrl(card.url), siteUrl(expected.url), `url of ${expected.slug}`);
    assert.equal(card.name, expected.name, `name of ${expected.slug}`);
    assert.equal(card.summary, expected.summary, `summary of ${expected.slug}`);
    assert.equal(card.caveat, expected.caveat, `caveat of ${expected.slug}`);
    assert.equal(card.upstream, expected.upstream, `upstream of ${expected.slug}`);
  }
});

test("the UVCCamera card does not take the slug uvccamera and says nothing about the README's version", () => {
  const curated = readCurated();
  const uvcSlug = uvcCameraSlug(curated);
  assert.notEqual(uvcSlug, "uvccamera", "uvccamera stays the contribution page's slug");
  const text = stringsOf(memberBySlug(curated, uvcSlug)).map(([, value]) => value).join(" ");
  assert.doesNotMatch(text, /README|0\.1\.0|0\.0\.13/, text);
});

test("the PCRE4J and Puppeteer-Capture cards keep the Notable names and link targets as written", () => {
  const curated = readCurated();
  for (const [slug, name, url] of [["pcre4j", "PCRE4J", "https://pcre4j.org/"], ["puppeteer-capture", "Puppeteer-Capture", "https://pptr-capture.org/"]]) {
    const member = memberBySlug(curated, slug);
    assert.equal(member.name, name, `name of ${slug}`);
    assert.equal(member.url, url, `url of ${slug}, which the homepage Notable list links`);
  }
});

test("a member without a card holds only its name and repositories, so no page text hides in the file", () => {
  const curated = readCurated();
  for (const member of curated.members.filter((candidate) => !("cardOrder" in candidate))) {
    for (const key of CARD_KEYS) {
      assert.ok(!(key in member), `${member.slug} has no card and holds ${key}`);
    }
  }
});

test("a card that is a fork states its upstream", () => {
  const curated = readCurated();
  for (const member of curated.members.filter((candidate) => "cardOrder" in candidate)) {
    const forkOf = member.repositories.map((repository) => FORK_UPSTREAMS[repository]).find(Boolean);
    if (forkOf) {
      assert.equal(member.upstream, forkOf, `upstream of ${member.slug}`);
    } else {
      assert.ok(!("upstream" in member), `${member.slug} is no fork and holds upstream`);
    }
  }
});

// The fetch still reads these issue keys from the curated file and stores whether each is closed; the page no longer
// promotes a member to a card.
test("only remoteclaw carries promoteToCardWhenClosed, with the two pinned issues", () => {
  const curated = readCurated();
  for (const member of curated.members) {
    if (member.slug === "remoteclaw") {
      assert.deepEqual([...member.promoteToCardWhenClosed].sort(), [...PROMOTION_KEYS].sort());
      assert.ok(!("cardOrder" in member), "remoteclaw has no card");
    } else {
      assert.ok(!("promoteToCardWhenClosed" in member), `${member.slug} holds promoteToCardWhenClosed`);
    }
  }
});

test("each dormant member states the year of its last push, and only those members say dormant", () => {
  const curated = readCurated();
  const dormant = {};
  for (const member of curated.members) {
    for (const [at, value] of stringsOf(member)) {
      const match = value.match(/dormant since (\d{4})/i);
      if (match) {
        assert.ok(!(member.slug in dormant), `${member.slug} says dormant twice (${at})`);
        dormant[member.slug] = match[1];
      }
    }
  }
  assert.deepEqual(dormant, DORMANT_SINCE);
});

test("ownOrganisationSha256 holds exactly the 33 pinned hashes, as lowercase hex SHA-256", () => {
  const curated = readCurated();
  assert.ok(Array.isArray(curated.ownOrganisationSha256), "ownOrganisationSha256 is an array");
  for (const value of curated.ownOrganisationSha256) {
    assert.match(value, /^[0-9a-f]{64}$/, `${value} is lowercase hex SHA-256`);
  }
  assert.equal(new Set(curated.ownOrganisationSha256).size, curated.ownOrganisationSha256.length, "no hash repeats");
  assert.deepEqual([...curated.ownOrganisationSha256].sort(), [...OWN_ORGANISATION_SHA256].sort());
});

test("the notable list holds the twelve entries, the first two by member slug", () => {
  const curated = readCurated();
  assert.equal(curated.notable.length, 12);
  assert.equal(curated.notable[0].member, "pcre4j");
  assert.equal(curated.notable[1].member, "puppeteer-capture");
  for (const [index, entry] of curated.notable.entries()) {
    assert.ok("description" in entry, `notable[${index}] holds a description`);
    if (index < 2) {
      assert.deepEqual(Object.keys(entry).sort(), ["description", "member"], `keys of notable[${index}]`);
    } else {
      assert.deepEqual(Object.keys(entry).sort(), ["description", "name", "url"], `keys of notable[${index}]`);
      assert.equal(entry.url, NOTABLE[index].links[0][1], `url of notable[${index}]`);
    }
  }
});

