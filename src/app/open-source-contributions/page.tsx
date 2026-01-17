import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";
import githubMarkWhite from "../github-mark-white.svg";
import githubMark from "../github-mark.svg";
import type { OpenSourceContributions } from "./types";

export const metadata: Metadata = {
  title: "Alexey Pelykh - Open Source Contributions",
  description: "Software architect | Solving challenges | Engineer of innovation | Actualizer of crazy ideas",
};

export default async function OpenSourceConstributionsIndexPage() {
  const openSourceContributions: OpenSourceContributions = await fs.readFile(
    path.join(process.cwd(), "data", "open-source-contributions.json"),
    "utf-8",
  ).then(JSON.parse);

  return (
    <main className="container bg-white dark:bg-black mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-8">
        Alexey Pelykh&apos;s Open Source Contributions
      </h1>
      {openSourceContributions.projects.map(({
        title: projectTitle,
        description: projectDescription,
        url: projectUrl,
        slug: projectSlug,
        repositories,
      }) => (
        <div key={projectSlug} className="shadow-md rounded-lg p-4 mb-6">
          <div className="flex items-center mb-1">
            <Link
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-semibold text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline mr-2"
            >
              {projectTitle}
            </Link>
            <a
              href={projectUrl}
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
          {projectDescription && (
            <p className="text-gray-600 mb-2">{projectDescription}</p>
          )}
          {repositories.length == 1 && repositories[0].url === projectUrl
            ? (
              <div>
                {repositories[0].pullRequests.slice(0, 5).map(({
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
                {repositories[0].pullRequests.length > 5 && (
                  <div className="ps-2 pt-2">
                    <a
                      href={`/open-source-contributions/${projectSlug}/`}
                      className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline"
                    >
                      &hellip; and {repositories[0].pullRequests.length - 5} more pull request{repositories[0].pullRequests.length === 6 ? "" : "s"} 🚀
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {repositories.slice(0, 3).map((
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
                    className="pt-2 ps-8"
                  >
                    {repositoryIndex > 0 && (
                      <hr className="mt-2 mb-4 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
                    )}
                    <div className="flex items-center mb-2">
                      <Link
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
                    {repositoryPullRequests.slice(0, 5).map(({
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
                    {repositoryPullRequests.length > 5 && (
                      <div className="ps-2">
                        <a
                          href={`/open-source-contributions/${projectSlug}/#${repositoryName}`}
                          className="text-sm text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline"
                        >
                          &hellip; and {repositoryPullRequests.length - 5} more pull request{repositoryPullRequests.length === 6 ? "" : "s"} 🚀
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                {repositories.length > 3 && (
                  <div className="ps-2 pt-2">
                    <a
                      href={`/open-source-contributions/${projectSlug}/`}
                      className="text-blue-600 dark:text-blue-500 print:text-blue-800 hover:underline"
                    >
                      &hellip; and {repositories.length - 3} more repositor{repositories.length === 4 ? "y" : "ies"} 🚀
                    </a>
                  </div>
                )}
              </div>
            )
          }
        </div>
      ))}
    </main>
  );
}
