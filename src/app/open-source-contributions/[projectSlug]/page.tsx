import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { SITE_URL } from "@/lib/constants";
import { getOpenSource } from "@/lib/open-source";
import type { Contribution, ListedPullRequest, ListedRepository } from "../types";

const SECTION_PATH = "/open-source-contributions/";
const SECTION_TITLE = "Open-Source Projects and Contributions";

const LINK_CLASS = "text-blue-600 dark:text-blue-400 print:text-blue-800 hover:underline";

type Params = Promise<{ projectSlug: string }>;

// A page exists for each contribution only: the cards of the "My open-source projects" section link to each project's
// own site, so no member has a page here.
function findContribution(slug: string): Contribution | undefined {
  return getOpenSource().contributions.find((candidate) => candidate.slug === slug);
}

function canonicalOf(slug: string): string {
  return `${SITE_URL}${SECTION_PATH}${slug}/`;
}

export async function generateStaticParams() {
  return getOpenSource().pages.map((page) => ({ projectSlug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { projectSlug } = await params;
  const contribution = findContribution(projectSlug);
  if (!contribution) {
    return {};
  }
  const title = contribution.title;
  return {
    title: `Alexey Pelykh - Contributions to ${title}`,
    description: `Pull requests Alexey Pelykh sent to ${title}.`,
    alternates: {
      canonical: canonicalOf(projectSlug),
    },
  };
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

function PullRequestList({ repository }: { repository: ListedRepository }) {
  return (
    <ul className="space-y-1">
      {repository.pullRequests.map((pullRequest) => (
        <li key={pullRequest.url} className="flex items-start gap-2">
          <StatusLabel status={pullRequest.status} />
          <span className="text-gray-700 dark:text-gray-300">
            <a href={pullRequest.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {pullRequest.title}
            </a>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {" "}(opened <time dateTime={pullRequest.createdAt}>{pullRequest.createdAt.slice(0, 10)}</time>)
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function RepositoryHeading({ repository }: { repository: ListedRepository }) {
  return (
    <h2 className="text-xl font-semibold mb-1">
      <a href={repository.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        {repository.name}
      </a>
    </h2>
  );
}

function ContributionPage({ contribution }: { contribution: Contribution }) {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Contributions to{" "}
        <a href={contribution.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          {contribution.title}
        </a>
      </h1>
      {contribution.description && (
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{contribution.description}</p>
      )}
      <div className="space-y-8">
        {contribution.repositories.map((repository) => (
          <section key={repository.name}>
            <RepositoryHeading repository={repository} />
            {repository.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{repository.description}</p>
            )}
            <PullRequestList repository={repository} />
          </section>
        ))}
      </div>
    </>
  );
}

export default async function OpenSourceProjectPage({ params }: { params: Params }) {
  const { projectSlug } = await params;
  const contribution = findContribution(projectSlug);
  if (!contribution) {
    notFound();
  }
  const title = contribution.title;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Alexey Pelykh", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: SECTION_TITLE, item: `${SITE_URL}${SECTION_PATH}` },
      { "@type": "ListItem", position: 3, name: title, item: canonicalOf(projectSlug) },
    ],
  };

  return (
    <main className="container bg-white dark:bg-black mx-auto px-4 py-8">
      {/* The title can come from a GitHub display name, so "<" is escaped and no fetched text can end the script. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumb items={[{ label: SECTION_TITLE, href: SECTION_PATH }]} current={title} />
      <ContributionPage contribution={contribution} />
    </main>
  );
}
