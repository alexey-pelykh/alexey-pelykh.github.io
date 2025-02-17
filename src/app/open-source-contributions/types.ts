export type OpenSourcePullRequest = {
  number: number;
  title: string;
  description: string;
  url: string;
  merged: boolean;
};

export type OpenSourceRepository = {
  name: string,
  title: string;
  description: string;
  url: string;
  pullRequests: OpenSourcePullRequest[];
};

export type OpenSourceProject = {
  title: string;
  description: string;
  url: string;
  slug: string;
  repositories: OpenSourceRepository[];
};

export type OpenSourceContributions = {
  projects: OpenSourceProject[];
};
