/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://alexey-pelykh.com",
  output: "export",
  generateRobotsTxt: true,
  additionalPaths: async () => [{
    loc: "/resume.pdf",
  }],
};
