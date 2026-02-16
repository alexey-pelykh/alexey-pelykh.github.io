import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, renderMarkdown } from "@/lib/blog";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.frontmatter.title} - Alexey Pelykh`,
    description: post.frontmatter.excerpt,
    openGraph: post.frontmatter.image
      ? { images: [post.frontmatter.image] }
      : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  let renderedContent: React.ReactNode;

  if (post.format === "mdx") {
    const { default: MDXContent } = await evaluate(post.content, {
      ...runtime,
      remarkPlugins: [remarkGfm],
    });
    renderedContent = <MDXContent />;
  } else {
    const html = await renderMarkdown(post.content);
    renderedContent = <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <main className="container bg-white dark:bg-black mx-auto px-4 py-8 max-w-prose print:hidden">
      <nav className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </nav>
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {post.frontmatter.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={post.frontmatter.date}>
              {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span>{post.frontmatter.readingTime} min read</span>
          </div>
          {post.frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        <div className="prose dark:prose-invert max-w-none">
          {renderedContent}
        </div>
      </article>
    </main>
  );
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.frontmatter.slug,
  }));
}
