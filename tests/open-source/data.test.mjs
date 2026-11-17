// The fetched data, data/open-source-contributions.json, as the changed fetch writes it.
import assert from "node:assert/strict";
import test from "node:test";
import { assertDataShape } from "./lib/data-shape.mjs";
import { CONTRIBUTOR, EXCLUSION_KEYS, logName, readData } from "./lib/fixtures.mjs";

test("every pull request has its dates and mergedBy and no body", () => {
  const data = readData();
  assertDataShape(data);
  assert.equal(data.contributor, CONTRIBUTOR);
});

test("the fetch keeps only what it kept before, minus the self-merge skip", () => {
  const data = readData();
  const excluded = new Set(EXCLUSION_KEYS.map((key) => key.toLowerCase()));
  data.projects.forEach((project, projectIndex) => {
    project.repositories.forEach((repository, repositoryIndex) => {
      const label = logName(repository.name, `projects[${projectIndex}].repositories[${repositoryIndex}]`);
      assert.equal(repository.isPrivate, false, `${label}: no private repository`);
      assert.notEqual(repository.name.toLowerCase(), "alexey-pelykh/alexey-pelykh.github.io", "no pull request to the website repository");
      for (const pullRequest of repository.pullRequests) {
        const key = `${repository.name}#${pullRequest.number}`;
        const keyLabel = `${label}#${pullRequest.number}`;
        assert.ok(!excluded.has(key.toLowerCase()), `${keyLabel} is an exclusion key`);
        assert.ok(pullRequest.merged || pullRequest.state === "OPEN", `${keyLabel}: no closed-unmerged pull request`);
        if (repository.owner === "OCA") {
          assert.ok(!pullRequest.title.includes("[UPD]"), `${keyLabel}: no OCA [UPD] pull request`);
        }
      }
    });
  });
  const selfMerged = data.projects
    .flatMap((project) => project.repositories)
    .flatMap((repository) => repository.pullRequests)
    .filter((pullRequest) => pullRequest.merged && pullRequest.mergedBy === CONTRIBUTOR);
  assert.ok(selfMerged.length > 0, "pull requests merged by the contributor are kept");
});
