import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { SITE_URL } from "@/lib/constants";
import { getOpenSource } from "@/lib/open-source";
import type { Contribution, CuratedCard, ListedPullRequest } from "./types";

const SECTION_PATH = "/open-source-contributions/";
const PAGE_TITLE = "Open-Source Projects and Contributions";
const PAGE_DESCRIPTION =
  "Open-source projects Alexey Pelykh wrote or maintains, and his pull requests to projects other people maintain.";
// Where the section sends a visitor for the projects that have no card.
const OTHER_PROJECTS_URL = "https://github.com/alexey-pelykh";
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

function ExternalLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className ?? LINK_CLASS}>
      {children}
    </a>
  );
}

// A card links to the project's own site. A project whose site is not its repository also gets a GitHub link.
// Below the md breakpoint the cards read as a plain list divided by rules. From md up they are bordered cards in two columns.
// The two layouts use disjoint max-md: and md: classes, because a divide reset at md would also strip the cards' own borders.
function Card({ card }: { card: CuratedCard }) {
  const repositoryUrl = `https://github.com/${card.repositories[0]}`;
  const siteIsRepository = displayUrl(card.url).toLowerCase() === displayUrl(repositoryUrl).toLowerCase();
  return (
    <li
      data-oss-card={card.slug}
      className="flex flex-col gap-2 max-md:py-4 max-md:first:pt-0 md:p-4 md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-800"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        <ExternalLink href={card.url}>{card.name}</ExternalLink>
      </h3>
      <p className="text-gray-700 dark:text-gray-300">{card.summary}</p>
      {card.upstream && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hard fork of <ExternalLink href={`https://github.com/${card.upstream}`}>{card.upstream}</ExternalLink>.
        </p>
      )}
      {card.caveat && <p className="text-sm text-gray-600 dark:text-gray-400">{card.caveat}</p>}
      <p className="text-sm mt-auto">
        <ExternalLink href={card.url}>{displayUrl(card.url)}</ExternalLink>
        {!siteIsRepository && (
          <>
            {" "}&middot;{" "}
            <ExternalLink href={repositoryUrl}>GitHub</ExternalLink>
          </>
        )}
      </p>
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
  const { cards, contributions } = getOpenSource();

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
          Projects I wrote or maintain.
        </p>
        <ul className="mb-4 max-md:divide-y max-md:divide-gray-200 max-md:dark:divide-gray-800 md:grid md:grid-cols-2 md:gap-4">
          {cards.map((card) => (
            <Card key={card.slug} card={card} />
          ))}
        </ul>
        <p data-oss-other-projects className="text-gray-700 dark:text-gray-300">
          <ExternalLink href={OTHER_PROJECTS_URL}>See my other projects on GitHub</ExternalLink>
        </p>
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
