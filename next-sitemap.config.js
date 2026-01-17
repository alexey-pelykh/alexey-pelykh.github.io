/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://alexey-pelykh.com",
  output: "export",
  generateRobotsTxt: true,
  exclude: ['/feedback*'],
  additionalPaths: async () => [{
    loc: "/resume.pdf",
  }],
};
