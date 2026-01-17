const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const util = require("node:util");
const serveHandler = require("serve-handler");
const puppeteer = require("puppeteer");

const BREAKPOINTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

const PAGES = [
  { name: "home", path: "/" },
];

(async () => {
  const outputDir = path.join(__dirname, "gen", "screenshots");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const server = http.createServer((request, response) => {
    return serveHandler(request, response, {
      public: path.join(__dirname, "out"),
    });
  });
  const listen = util.promisify(server.listen.bind(server));
  await listen();

  const address = server.address();
  const baseUrl = `http://localhost:${address.port}`;

  console.log(`Server running at ${baseUrl}`);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-web-security"],
    headless: "new",
  });

  for (const page of PAGES) {
    for (const breakpoint of BREAKPOINTS) {
      const browserPage = await browser.newPage();
      await browserPage.setViewport({
        width: breakpoint.width,
        height: breakpoint.height,
        deviceScaleFactor: 2,
      });

      const url = `${baseUrl}${page.path}`;
      console.log(`Capturing ${page.name} at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})...`);

      await browserPage.goto(url, { waitUntil: "networkidle0" });

      const filename = `${page.name}-${breakpoint.name}.png`;
      await browserPage.screenshot({
        path: path.join(outputDir, filename),
        fullPage: true,
      });

      console.log(`  Saved: gen/screenshots/${filename}`);
      await browserPage.close();
    }
  }

  await browser.close();

  const close = util.promisify(server.close.bind(server));
  await close();

  console.log("\nDesign review screenshots complete!");
  console.log(`Output directory: ${outputDir}`);
})();
