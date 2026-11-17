import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { SITE_URL } from "@/lib/constants";
import { getGroup, getOpenSource } from "@/lib/open-source";
import type { Contribution, ListedPullRequest, ListedRepository, MemberDetail } from "../types";

const SECTION_PATH = "/open-source-contributions/";
const SECTION_TITLE = "Open-Source Projects and Contributions";

const LINK_CLASS = "text-blue-600 dark:text-blue-400 print:text-blue-800 hover:underline";

type Params = Promise<{ projectSlug: string }>;

type Subject =
  | { section: "member"; detail: MemberDetail }
  | { section: "contribution"; contribution: Contribution };

function findSubject(slug: string): Subject | undefined {
  const { members, contributions } = getOpenSource();
  if (members[slug]) {
    return { section: "member", detail: members[slug] };
  }
  const contribution = contributions.find((candidate) => candidate.slug === slug);
  return contribution ? { section: "contribution", contribution } : undefined;
}

function titleOf(subject: Subject): string {
  return subject.section === "member" ? subject.detail.member.name : subject.contribution.title;
}

function canonicalOf(slug: string): string {
  return `${SITE_URL}${SECTION_PATH}${slug}/`;
}

export async function generateStaticParams() {
  return getOpenSource().pages.map((page) => ({ projectSlug: page.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { projectSlug } = await params;
  const subject = findSubject(projectSlug);
  if (!subject) {
    return {};
  }
  const title = titleOf(subject);
  return {
    title: `Alexey Pelykh - ${subject.section === "member" ? title : `Contributions to ${title}`}`,
    description: subject.section === "member"
      ? subject.detail.member.summary
      : `Pull requests Alexey Pelykh sent to ${title}.`,
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

function RepositoryHeading({ repository, level }: { repository: ListedRepository; level: "h2" | "h3" }) {
  const Heading = level;
  return (
    <Heading className={level === "h2" ? "text-xl font-semibold mb-1" : "text-lg font-semibold mb-1"}>
      <a href={repository.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        {repository.name}
      </a>
    </Heading>
  );
}

function MemberPage({ detail }: { detail: MemberDetail }) {
  const { member, repositories } = detail;
  const group = member.group ? getGroup(member.group) : undefined;
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{member.name}</h1>
      <div className="space-y-2 text-gray-700 dark:text-gray-300 mb-8">
        <p className="text-lg">{member.summary}</p>
        {member.upstream && (
          <p>
            Fork of{" "}
            <a href={`https://github.com/${member.upstream}`} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {member.upstream}
            </a>
            .
          </p>
        )}
        {member.caveat && <p>{member.caveat}</p>}
        {group && (
          <p>
            From{" "}
            <a href={group.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {group.label}
            </a>
            . Published, not maintained.
          </p>
        )}
        {member.years && (
          <p className="text-gray-600 dark:text-gray-400">
            {group ? "Last push" : "Years"}: {member.years}
          </p>
        )}
        <p>
          <a href={member.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            {member.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        </p>
      </div>

      {member.repositories.length > 1 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Repositories</h2>
          <ul className="ml-5 list-disc space-y-0.5">
            {member.repositories.map((repository) => (
              <li key={repository}>
                <a href={`https://github.com/${repository}`} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                  {repository}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {repositories.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">My pull requests</h2>
          <div className="space-y-6">
            {repositories.map((repository) => (
              <div key={repository.name}>
                <RepositoryHeading repository={repository} level="h3" />
                <PullRequestList repository={repository} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
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
            <RepositoryHeading repository={repository} level="h2" />
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
  const subject = findSubject(projectSlug);
  if (!subject) {
    notFound();
  }
  const title = titleOf(subject);

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
      {subject.section === "member"
        ? <MemberPage detail={subject.detail} />
        : <ContributionPage contribution={subject.contribution} />}
    </main>
  );
}
