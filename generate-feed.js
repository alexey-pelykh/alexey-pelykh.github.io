const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

const SITE_URL = "https://alexey-pelykh.com";
const CONTENT_DIR = path.join(__dirname, "src", "content", "blog");
const OUT_DIR = path.join(__dirname, "out", "blog");

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr) {
  return new Date(dateStr).toUTCString();
}

function getAllPosts() {
  let entries;
  try {
    entries = fs.readdirSync(CONTENT_DIR);
  } catch {
    return [];
  }

  const files = entries.filter(
    (f) => f.endsWith(".md") || f.endsWith(".mdx"),
  );

  const posts = files.map((filename) => {
    const filePath = path.join(CONTENT_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    return {
      title: data.title,
      slug: data.slug,
      date: data.date,
      excerpt: data.excerpt,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function generateRss(posts) {
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid>${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${toRfc822(post.date)}</pubDate>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Alexey Pelykh - Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Technical blog by Alexey Pelykh</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

const posts = getAllPosts();
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const feedPath = path.join(OUT_DIR, "feed.xml");
fs.writeFileSync(feedPath, generateRss(posts), "utf-8");
console.log(`Generated: ${feedPath} (${posts.length} posts)`);
