const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "outputs", "playwright");
fs.mkdirSync(outDir, { recursive: true });

const tour = JSON.parse(fs.readFileSync(path.join(root, "public", "vr", "data", "tour.json"), "utf8"));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("http://127.0.0.1:3000/recorrido-vr", { waitUntil: "networkidle" });
  await page.waitForSelector("a-scene", { timeout: 30000 });
  await page.waitForSelector("a-sky", { state: "attached", timeout: 30000 });

  const results = [];

  for (const node of tour.nodes) {
    await page.getByRole("button", { name: new RegExp(node.title, "i") }).click();
    await page.waitForTimeout(900);

    const skySrc = await page.locator("a-sky").evaluate((el) => el.getAttribute("src") || "");
    const currentTitle = await page.locator("h1").innerText();

    results.push({
      id: node.id,
      title: currentTitle,
      expectedAsset: node.panorama,
      skyUsesAsset: skySrc === node.panorama,
    });
  }

  await page.screenshot({
    path: path.join(outDir, "recorrido-vr-7-vistas.png"),
    fullPage: true,
  });

  await browser.close();

  console.log(JSON.stringify({ consoleErrors, results }, null, 2));
  if (consoleErrors.length) process.exit(1);
  if (results.some((result) => !result.skyUsesAsset)) process.exit(1);
})();
