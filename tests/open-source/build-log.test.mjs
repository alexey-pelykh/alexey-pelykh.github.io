// The build's own-organisation log line. `npm run build` writes no log file, so this test reads the build's
// captured output: run `mkdir -p gen && npm run build 2>&1 | tee gen/build.log` first, or point OSS_BUILD_LOG at the captured output.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { OUT, ROOT, partitionReal } from "./lib/fixtures.mjs";

const BUILD_LOG = process.env.OSS_BUILD_LOG ? path.resolve(process.env.OSS_BUILD_LOG) : path.join(ROOT, "gen", "build.log");
const LINE = /^\s*\[open-source\] own-organisation pull requests excluded: (\d+)\s*$/;

test("the build prints the own-organisation exclusion count, naming no organisation and no repository", async () => {
  assert.ok(fs.existsSync(BUILD_LOG), `no captured build output at ${BUILD_LOG}: run \`mkdir -p gen && npm run build 2>&1 | tee gen/build.log\` first`);
  const page = path.join(OUT, "open-source-contributions", "index.html");
  assert.ok(fs.existsSync(page), `no built page at ${page}: run the build first`);
  // The log is written to the end of the build, after the pages, so an older log comes from an earlier build.
  assert.ok(fs.statSync(BUILD_LOG).mtimeMs >= fs.statSync(page).mtimeMs, `${BUILD_LOG} is older than ${page}: capture the output of the build that wrote out/`);
  const output = fs.readFileSync(BUILD_LOG, "utf8");
  assert.match(output, /Exporting|Generating static pages/, `${BUILD_LOG} is the output of a Next.js build`);
  const lines = output.split("\n").filter((line) => line.includes("[open-source] own-organisation"));
  assert.ok(lines.length > 0, `the build output holds the line "[open-source] own-organisation pull requests excluded: {N}"`);
  const { result } = await partitionReal();
  for (const line of lines) {
    const match = line.match(LINE);
    assert.ok(match, `the line holds the count and nothing else: ${line}`);
    assert.equal(Number(match[1]), result.excludedOwnOrganisation, `the count equals partition()'s excludedOwnOrganisation`);
  }
});
