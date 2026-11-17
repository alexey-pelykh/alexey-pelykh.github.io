// Shape checks for the fetched data, shared by the data test and the fetch-script test.
import assert from "node:assert/strict";
import { PROMOTION_KEYS, logName } from "./fixtures.mjs";

export const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export function assertIsoDate(value, label) {
  assert.equal(typeof value, "string", `${label} is a string`);
  assert.match(value, ISO_8601, `${label} is ISO 8601`);
  assert.ok(!Number.isNaN(Date.parse(value)), `${label} parses`);
}

export function assertPullRequestShape(pullRequest, label) {
  for (const key of ["description", "body", "bodyHTML", "bodyText"]) {
    assert.ok(!(key in pullRequest), `${label} holds no ${key}`);
  }
  assert.equal(typeof pullRequest.number, "number", `${label}: number`);
  assert.equal(typeof pullRequest.title, "string", `${label}: title`);
  assert.equal(typeof pullRequest.url, "string", `${label}: url`);
  assert.equal(typeof pullRequest.merged, "boolean", `${label}: merged`);
  assert.ok(["OPEN", "MERGED", "CLOSED"].includes(pullRequest.state), `${label}: state ${pullRequest.state}`);
  assertIsoDate(pullRequest.createdAt, `${label}: createdAt`);
  for (const key of ["mergedAt", "closedAt"]) {
    assert.ok(key in pullRequest, `${label} holds ${key}`);
    if (pullRequest[key] !== null) {
      assertIsoDate(pullRequest[key], `${label}: ${key}`);
    }
  }
  assert.ok("mergedBy" in pullRequest, `${label} holds mergedBy`);
  assert.ok(pullRequest.mergedBy === null || typeof pullRequest.mergedBy === "string", `${label}: mergedBy is a login or null`);
  if (pullRequest.merged) {
    assert.notEqual(pullRequest.mergedAt, null, `${label}: a merged pull request has mergedAt`);
  }
}

export function assertDataShape(data) {
  assert.equal(typeof data.contributor, "string", "contributor");
  assert.ok(Array.isArray(data.projects), "projects");
  assert.ok(data.issueStates && typeof data.issueStates === "object", "issueStates");
  for (const key of PROMOTION_KEYS) {
    assert.ok(key in data.issueStates, `issueStates holds ${key}`);
    assert.deepEqual(Object.keys(data.issueStates[key]), ["closed"], `issueStates[${key}] holds only closed`);
    assert.equal(typeof data.issueStates[key].closed, "boolean", `issueStates[${key}].closed is a boolean`);
  }
  data.projects.forEach((project, projectIndex) => {
    assert.equal(typeof project.slug, "string", `slug of ${logName(project.title, `projects[${projectIndex}]`)}`);
    project.repositories.forEach((repository, repositoryIndex) => {
      const label = logName(repository.name, `projects[${projectIndex}].repositories[${repositoryIndex}]`);
      assert.equal(typeof repository.name, "string", "repository name");
      assert.equal(typeof repository.owner, "string", `${label}: owner`);
      // A boolean, so a failure prints no owner login.
      assert.ok(repository.owner === repository.name.split("/")[0], `${label}: owner matches the name`);
      assert.equal(typeof repository.isPrivate, "boolean", `${label}: isPrivate`);
      for (const pullRequest of repository.pullRequests) {
        assertPullRequestShape(pullRequest, `${label}#${pullRequest.number}`);
      }
    });
  });
}
