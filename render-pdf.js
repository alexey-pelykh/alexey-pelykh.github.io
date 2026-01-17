const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const util = require("node:util");
const serveHandler = require("serve-handler");
const puppeteer = require("puppeteer");

(async () => {
  const genDir = path.join(__dirname, "gen");
  if (!fs.existsSync(genDir)) {
    fs.mkdirSync(genDir, { recursive: true });
  }

  const server = http.createServer((request, response) => {
    return serveHandler(request, response, {
      public: path.join(__dirname, "out"),
    });
  });
  const listen = util.promisify(server.listen.bind(server));
  await listen();

  const address = server.address();

  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-web-security",
    ],
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${address.port}`, {
    waitUntil: "networkidle0",
  });
  const pdfPath = path.join(genDir, "resume.pdf");

  await page.pdf({
    path: pdfPath,
    margin: {
      top: "1cm",
      right: "1cm",
      bottom: "1cm",
      left: "1cm",
    },
    format: "A4",
  });
  await browser.close();

  console.log(`Generated: ${pdfPath}`);

  const close = util.promisify(server.close.bind(server));
  await close();
})();
