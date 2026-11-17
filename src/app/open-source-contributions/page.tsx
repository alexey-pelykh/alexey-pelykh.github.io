import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { SITE_URL } from "@/lib/constants";
import { getGroup, getMember, getOpenSource } from "@/lib/open-source";
import type { Contribution, CuratedMember, ListedPullRequest } from "./types";

const SECTION_PATH = "/open-source-contributions/";
const PAGE_TITLE = "Open-Source Projects and Contributions";
const PAGE_DESCRIPTION =
  "Open-source projects Alexey Pelykh wrote or maintains, earlier projects of organisations he ran, and his pull requests to projects other people maintain.";
// How many pull requests of one contribution the index lists before it links to that contribution's own page.
const PULL_REQUESTS_ON_INDEX = 5;

const LINK_CLASS = "text-blue-600 dark:text-blue-400 print:text-blue-800 hover:underline";

export const metadata: Metadata = {
  title: `Alexey Pelykh - ${PAGE_TITLE}`,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}${SECTION_PATH}`,
  },
};

function pagePath(slug: string): string {
  return `${SECTION_PATH}${slug}/`;
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function StatusLabel({ status }: { status: ListedPullRequest["status"] }) {
  const merged = status === "Merged";
  return (
    <span
      data-pr-status={merged ? "merged" : "open"}
      className={
        merged
          ? "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200"
          : "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
      }
    >
      {status}
    </span>
  );
}

function Upstream({ upstream }: { upstream: string }) {
  return (
    <>
      Fork of{" "}
      <a href={`https://github.com/${upstream}`} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        {upstream}
      </a>
      .
    </>
  );
}

function Card({ member }: { member: CuratedMember }) {
  return (
    <li
      data-oss-card={member.slug}
      className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        <Link href={pagePath(member.slug)} className={LINK_CLASS}>
          {member.name}
        </Link>
      </h3>
      <p className="text-gray-700 dark:text-gray-300">{member.summary}</p>
      {member.upstream && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <Upstream upstream={member.upstream} />
        </p>
      )}
      {member.caveat && <p className="text-sm text-gray-600 dark:text-gray-400">{member.caveat}</p>}
      <p className="text-sm mt-auto">
        <a href={member.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          {displayUrl(member.url)}
        </a>
      </p>
    </li>
  );
}

function Row({ member }: { member: CuratedMember }) {
  return (
    <li data-oss-row={member.slug} className="text-gray-700 dark:text-gray-300">
      <Link href={pagePath(member.slug)} className={`font-semibold ${LINK_CLASS}`}>
        {member.name}
      </Link>
      {member.years && <span className="text-gray-600 dark:text-gray-400"> ({member.years})</span>}
      {" "}&ndash; {member.summary}
      {member.upstream && (
        <span className="text-gray-600 dark:text-gray-400">
          {" "}
          <Upstream upstream={member.upstream} />
        </span>
      )}
      {member.caveat && <span className="text-gray-600 dark:text-gray-400"> {member.caveat}</span>}
    </li>
  );
}

function GroupRow({ id, slugs }: { id: string; slugs: string[] }) {
  const group = getGroup(id);
  if (!group) {
    throw new Error(`Unknown open-source group ${id}`);
  }
  return (
    <li data-oss-group={id} className="text-gray-700 dark:text-gray-300">
      <p>
        <a href={group.url} target="_blank" rel="noopener noreferrer" className={`font-semibold ${LINK_CLASS}`}>
          {group.label}
        </a>
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Published, not maintained. Each repository shows the year of its last push.
      </p>
      <ul className="mt-1 ml-5 list-disc space-y-0.5 text-sm">
        {slugs.map((slug) => {
          const member = getMember(slug);
          if (!member) {
            throw new Error(`Unknown open-source member ${slug}`);
          }
          return (
            <li key={slug}>
              <Link href={pagePath(slug)} className={LINK_CLASS}>
                {member.name}
              </Link>
              {member.years && <span className="text-gray-600 dark:text-gray-400"> ({member.years})</span>}
              {" "}&ndash; {member.summary}
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function ContributionEntry({ contribution }: { contribution: Contribution }) {
  const pullRequests = contribution.repositories
    .flatMap((repository) => repository.pullRequests.map((pullRequest) => ({ repository, pullRequest })))
    .sort((a, b) => (Date.parse(b.pullRequest.createdAt) || 0) - (Date.parse(a.pullRequest.createdAt) || 0));
  const showRepository = contribution.repositories.length > 1;
  return (
    <li className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      <h3 className="text-lg font-semibold">
        <Link href={pagePath(contribution.slug)} className={LINK_CLASS}>
          {contribution.title}
        </Link>
      </h3>
      {contribution.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{contribution.description}</p>
      )}
      <ul className="space-y-1">
        {pullRequests.slice(0, PULL_REQUESTS_ON_INDEX).map(({ repository, pullRequest }) => (
          <li key={pullRequest.url} className="flex items-start gap-2">
            <StatusLabel status={pullRequest.status} />
            <span className="text-gray-700 dark:text-gray-300">
              <a href={pullRequest.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                {pullRequest.title}
              </a>
              {showRepository && <span className="text-sm text-gray-600 dark:text-gray-400"> ({repository.name})</span>}
            </span>
          </li>
        ))}
      </ul>
      {pullRequests.length > PULL_REQUESTS_ON_INDEX && (
        <p className="mt-2 text-sm">
          <Link href={pagePath(contribution.slug)} className={LINK_CLASS}>
            All {pullRequests.length} pull requests to {contribution.title}
          </Link>
        </p>
      )}
    </li>
  );
}

export default function OpenSourceContributionsIndexPage() {
  const { cards, rows, contributions } = getOpenSource();
  const memberOf = (slug: string) => {
    const member = getMember(slug);
    if (!member) {
      throw new Error(`Unknown open-source member ${slug}`);
    }
    return member;
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Alexey Pelykh", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: PAGE_TITLE, item: `${SITE_URL}${SECTION_PATH}` },
    ],
  };

  return (
    <main className="container bg-white dark:bg-black mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Breadcrumb items={[]} current={PAGE_TITLE} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">{PAGE_TITLE}</h1>

      <section aria-labelledby="my-projects" className="mb-12">
        <h2 id="my-projects" className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My open-source projects
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Projects I wrote or maintain, and earlier projects of organisations I ran.
        </p>
        <ul className="grid gap-4 md:grid-cols-2 mb-8">
          {cards.map(({ slug }) => (
            <Card key={slug} member={memberOf(slug)} />
          ))}
        </ul>
        <ul className="space-y-3">
          {rows.map((row) =>
            row.kind === "group"
              ? <GroupRow key={`group-${row.id}`} id={row.id} slugs={row.slugs} />
              : <Row key={row.slug} member={memberOf(row.slug)} />,
          )}
        </ul>
      </section>

      <section aria-labelledby="contributions">
        <h2 id="contributions" className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Contributions to other projects
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Pull requests I sent to projects other people maintain.
        </p>
        <ul className="space-y-4">
          {contributions.map((contribution) => (
            <ContributionEntry key={contribution.slug} contribution={contribution} />
          ))}
        </ul>
      </section>
    </main>
  );
}
