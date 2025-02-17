/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://alexey-pelykh.com",
  output: "export",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/pcre4j/*", "/puppeteer-capture/*", "/UVCCamera/*"],
      },
    ],
  },
  additionalPaths: async () => [{
    loc: "/resume.pdf",
  }],
};
