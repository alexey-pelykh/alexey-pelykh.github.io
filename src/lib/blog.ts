import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  pillar: string;
  tags: string[];
  image: string;
  readingTime: number;
}

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
  format: "md" | "mdx";
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);

  return String(result);
}

export async function getAllPosts(): Promise<Post[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(CONTENT_DIR);
  } catch {
    return [];
  }

  const files = entries.filter(
    (f) => f.endsWith(".md") || f.endsWith(".mdx"),
  );

  const posts = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      const raw = await fs.readFile(filePath, "utf-8");
      const { data, content } = matter(raw);

      const frontmatter: PostFrontmatter = {
        title: data.title,
        slug: data.slug,
        date: data.date,
        excerpt: data.excerpt,
        pillar: data.pillar,
        tags: data.tags ?? [],
        image: data.image ?? "",
        readingTime: data.readingTime ?? calculateReadingTime(content),
      };

      const format = filename.endsWith(".mdx") ? "mdx" as const : "md" as const;

      return { frontmatter, content, format };
    }),
  );

  return posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.frontmatter.slug === slug);
}
