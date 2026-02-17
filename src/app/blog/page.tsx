import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Blog - Alexey Pelykh",
  description: "Blog posts by Alexey Pelykh",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="container bg-white dark:bg-black mx-auto px-4 py-8 max-w-3xl">
      <Breadcrumb items={[]} current="Blog" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Blog
      </h1>
      {posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <article key={post.frontmatter.slug}>
              <Link
                href={`/blog/${post.frontmatter.slug}/`}
                className="block group"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {post.frontmatter.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <time dateTime={post.frontmatter.date}>
                    {new Date(post.frontmatter.date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </time>
                  <span>{post.frontmatter.readingTime} min read</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {post.frontmatter.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
