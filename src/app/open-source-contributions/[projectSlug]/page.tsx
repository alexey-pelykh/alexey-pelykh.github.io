import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";
import githubMarkWhite from "../../github-mark-white.svg";
import githubMark from "../../github-mark.svg";
import type { OpenSourceContributions } from "../types";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ projectSlug: string }>
  },
): Promise<Metadata> {
  const { projectSlug } = await params;

  const openSourceContributions: OpenSourceContributions = await fs.readFile(
    path.join(process.cwd(), "data", "open-source-contributions.json"),
    "utf-8",
  ).then(JSON.parse);

  const { title } = openSourceContributions.projects.find(
    (project) => project.slug === projectSlug,
  )!;

  return {
    title: `Alexey Pelykh - Open Source Contributions - ${title}`,
    description: "Software architect | Solving challenges | Engineer of innovation | Actualizer of crazy ideas",
  };
}

export default async function OpenSourceProjectPage(
  {
    params,
  }: {
    params: Promise<{ projectSlug: string }>
  },
) {
  const { projectSlug } = await params;

  const openSourceContributions: OpenSourceContributions = await fs.readFile(
    path.join(process.cwd(), "data", "open-source-contributions.json"),
    "utf-8",
  ).then(JSON.parse);

  const { title, description, url, repositories } = openSourceContributions.projects.find(
    (project) => project.slug === projectSlug,
  )!;

  return (
    <main className="container bg-white dark:bg-black mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
        Alexey Pelykh&apos;s Open Source Contributions to <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="capitalize font-semibold text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline"
        >
          {title}
        </a>
      </h1>
      {description && (
        <p className="text-lg text-gray-600 mb-2">{description}</p>
      )}
      {repositories.length == 1 && repositories[0].url === url
      ? (
        <div>
          {repositories[0].pullRequests.map(({
            number: pullRequestNumber,
            title: pullRequestTitle,
            url: pullRequestUrl,
          }) => (
            <div
              key={`${repositories[0].name}-${pullRequestNumber}`}
              className="flex items-center justify-start mb-1"
            >
              <a
                href={pullRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline"
              >
                <img
                  className="pe-2"
                  src={`https://img.shields.io/github/pulls/detail/state/${repositories[0].name}/${pullRequestNumber}`}
                />
              </a>
              <a
                href={pullRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline"
              >
                {pullRequestTitle}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {repositories.map((
            {
              name: repositoryName,
              description: repositoryDescription,
              url: repositoryUrl,
              pullRequests: repositoryPullRequests,
            },
            repositoryIndex,
          ) => (
            <div
              key={repositoryName}
              className="pt-2"
            >
              {repositoryIndex > 0 && (
                <hr className="mt-2 mb-4 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
              )}
              <div className="flex items-center mb-2">
                <Link
                  id={repositoryName}
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bg font-semibold text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline mr-2"
                >
                  {repositoryName}
                </Link>
                <a
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View on GitHub"
                >
                  <Image
                    alt="GitHub"
                    className="rounded-md dark:hidden block"
                    width={24}
                    height={24}
                    src={githubMark}
                  />
                  <Image
                    alt="GitHub"
                    className="rounded-md hidden dark:block"
                    width={24}
                    height={24}
                    src={githubMarkWhite}
                  />
                </a>
              </div>
              {repositoryDescription && (
                <p className="text-sm text-gray-600 mb-2">{repositoryDescription}</p>
              )}
              {repositoryPullRequests.map(({
                number: pullRequestNumber,
                title: pullRequestTitle,
                url: pullRequestUrl,
              }) => (
                <div
                  key={`${repositoryName}-${pullRequestNumber}`}
                  className="flex items-center justify-start mb-1"
                >
                  <a
                    href={pullRequestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline"
                  >
                    <img
                      className="pe-2"
                      src={`https://img.shields.io/github/pulls/detail/state/${repositoryName}/${pullRequestNumber}`}
                    />
                  </a>
                  <a
                    href={pullRequestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline"
                  >
                    {pullRequestTitle}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    }
    </main>
  );
}

export async function generateStaticParams() {
  const openSourceContributions: OpenSourceContributions = await fs.readFile(
    path.join(process.cwd(), "data", "open-source-contributions.json"),
    "utf-8",
  ).then(JSON.parse);

  return openSourceContributions.projects.map((openSourceProject) => ({
    projectSlug: openSourceProject.slug,
  }));
}
