// Reads the curated open-source projects and the fetched contributions at build time, and splits them through
// partition(). The open-source pages and the homepage's Notable list read their data from here only.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import curatedFile from "@/content/open-source-projects.json";
import type {
  CuratedFile,
  CuratedMember,
  NotableDescriptionPart,
  OpenSourceContributions,
  Partition,
} from "@/app/open-source-contributions/types";
import { partition } from "./open-source-partition";

export const CONTRIBUTOR = "alexey-pelykh";

const curated = curatedFile as CuratedFile;

// Each value of ownOrganisationSha256 is the SHA-256 hex digest of the lowercase login of one of his organisations,
// as the HQ catalogue lists them, so the list names none of them (a member repository's URL still names the
// organisation that owns it). When he gets a new organisation, add the SHA-256 of its lowercase login to that list,
// or its pull requests show up as contributions.
const ownOrganisationHashes = new Set(curated.ownOrganisationSha256);

function isOwnOrganisation(owner: string): boolean {
  return ownOrganisationHashes.has(createHash("sha256").update(owner.toLowerCase()).digest("hex"));
}

function readContributions(): OpenSourceContributions {
  const file = path.join(process.cwd(), "data", "open-source-contributions.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as OpenSourceContributions;
}

let cached: Partition | undefined;

// `next build` loads this module in several worker processes, so a module-level flag alone prints the count once per
// worker. The first process to create this marker prints it. `next build` empties .next (all but its cache) when it
// starts, so each build prints the count once.
function claimCountLine(): boolean {
  const dir = path.join(process.cwd(), ".next");
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "open-source-count-logged"), "", { flag: "wx" });
    return true;
  } catch (error) {
    // Another process printed the line already. On any other error, print it rather than lose it.
    return (error as NodeJS.ErrnoException).code !== "EEXIST";
  }
}

export function getOpenSource(): Partition {
  if (!cached) {
    cached = partition({ curated, data: readContributions(), isOwnOrganisation, contributor: CONTRIBUTOR });
    if (claimCountLine()) {
      // A count only: the build log of a public repository is public, so it names no organisation and no repository.
      console.log(`[open-source] own-organisation pull requests excluded: ${cached.excludedOwnOrganisation}`);
    }
  }
  return cached;
}

export function getMember(slug: string): CuratedMember | undefined {
  return curated.members.find((member) => member.slug === slug);
}

export type NotableEntry = {
  name: string;
  url: string;
  description: NotableDescriptionPart[];
};

// The link target of a Notable entry, for a page that links the same work outside the Notable list.
export function getNotableUrl(name: string): string {
  const entry = getNotable().find((notable) => notable.name === name);
  if (!entry) {
    throw new Error(`The Notable list holds no entry named ${name}`);
  }
  return entry.url;
}

// The homepage's Notable list, from the curated file alone, so the homepage does not need the fetched data.
export function getNotable(): NotableEntry[] {
  return curated.notable.map((entry) => {
    if ("member" in entry) {
      const member = getMember(entry.member);
      if (!member) {
        throw new Error(`The Notable list names the unknown member ${entry.member}`);
      }
      if (!member.url) {
        throw new Error(`The Notable list names ${entry.member}, which is no card and has no url`);
      }
      return { name: member.name, url: member.url, description: [entry.description] };
    }
    return {
      name: entry.name,
      url: entry.url,
      description: typeof entry.description === "string" ? [entry.description] : entry.description,
    };
  });
}
