const http = require("node:http");
const path = require("node:path");
const util = require("node:util");
const serveHandler = require("serve-handler");
const puppeteer = require("puppeteer");

(async () => {
  const server = http.createServer((request, response) => {
    return serveHandler(request, response, {
      public: path.join(__dirname, "out"),
    });
  });
  const listen = util.promisify(server.listen.bind(server));
  await listen();

  const address = server.address();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:${address.port}`, {
    waitUntil: "networkidle0",
  });
  await page.pdf({
    path: path.join(__dirname, "out", "resume.pdf"),
    printBackground: true,
    margin: {
      top: "1cm",
      right: "1cm",
      bottom: "1cm",
      left: "1cm",
    },
    format: "A4",
  });
  await browser.close();

  const close = util.promisify(server.close.bind(server));
  await close();
})();
