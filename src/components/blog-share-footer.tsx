import { LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/constants";

interface BlogShareProps {
  slug: string;
  title: string;
  linkedin_url?: string;
  devto_url?: string;
}

function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 530"
      fill="currentColor"
      className={className}
    >
      <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
    </svg>
  );
}

function shareLinks({ slug, title, linkedin_url }: BlogShareProps) {
  const postUrl = `${SITE_URL}/blog/${slug}/`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);

  return {
    linkedin: linkedin_url
      ? { href: linkedin_url, label: "Discuss on LinkedIn" }
      : {
          href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          label: "LinkedIn",
        },
    x: {
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      label: "X",
    },
    bluesky: {
      href: `https://bsky.app/intent/compose?text=${encodedTitle}+${encodedUrl}`,
      label: "Bluesky",
    },
  };
}

export function BlogShareSidebar(props: BlogShareProps) {
  const links = shareLinks(props);

  return (
    <aside className="hidden xl:block absolute -left-14 top-0 h-full">
      <div className="sticky top-24 flex flex-col gap-2">
        <a
          href={links.linkedin.href}
          target="_blank"
          rel="noopener noreferrer"
          title={links.linkedin.label}
          className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <LinkedInLogoIcon className="h-5 w-5" />
        </a>
        <a
          href={links.x.href}
          target="_blank"
          rel="noopener noreferrer"
          title={links.x.label}
          className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <TwitterLogoIcon className="h-5 w-5" />
        </a>
        <a
          href={links.bluesky.href}
          target="_blank"
          rel="noopener noreferrer"
          title={links.bluesky.label}
          className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <BlueskyIcon className="h-4 w-4" />
        </a>
        {props.devto_url && (
          <a
            href={props.devto_url}
            target="_blank"
            rel="noopener noreferrer"
            title="Discuss on dev.to"
            className="flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            DEV
          </a>
        )}
      </div>
    </aside>
  );
}

export function BlogShareFooter(props: BlogShareProps) {
  const links = shareLinks(props);

  return (
    <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
      <div className="mb-6">
        <p className="text-sm italic text-gray-600 dark:text-gray-400">
          If this sparked something, DM me on{" "}
          <a
            href="https://www.linkedin.com/in/alexey-pelykh/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-500 hover:underline"
          >
            LinkedIn
          </a>
          {" "}&mdash; I&apos;m always curious to hear other perspectives.
        </p>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Share this post
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a
            href={links.linkedin.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInLogoIcon className="mr-1.5 h-4 w-4" />
            {links.linkedin.label}
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={links.x.href} target="_blank" rel="noopener noreferrer">
            <TwitterLogoIcon className="mr-1.5 h-4 w-4" />
            {links.x.label}
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href={links.bluesky.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BlueskyIcon className="mr-1.5 h-3.5 w-3.5" />
            {links.bluesky.label}
          </a>
        </Button>
        {props.devto_url && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={props.devto_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discuss on dev.to
            </a>
          </Button>
        )}
      </div>
    </footer>
  );
}
