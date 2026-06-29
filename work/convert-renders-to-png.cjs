const { chromium } = require("playwright");
const { readFileSync } = require("fs");
const path = require("path");

const root = process.cwd();
const names = [
  "nodo-01-entrada",
  "nodo-02-calle-principal",
  "nodo-03-plaza",
  "nodo-04-cruce-urbano",
  "nodo-05-fachada-institucional",
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2048, height: 1024 } });

  for (const name of names) {
    const svgPath = path.join(root, "public", "vr", "renders", `${name}.svg`);
    const pngPath = path.join(root, "public", "vr", "renders", `${name}.png`);
    const svgUrl = `data:image/svg+xml;base64,${readFileSync(svgPath).toString("base64")}`;

    await page.setContent(`
      <style>
        html, body { margin: 0; width: 2048px; height: 1024px; overflow: hidden; background: #000; }
        img { display: block; width: 2048px; height: 1024px; }
      </style>
      <img src="${svgUrl}" alt="">
    `);
    await page.locator("img").evaluate((img) => {
      if (img.complete && img.naturalWidth > 0) return true;
      return new Promise((resolve, reject) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", reject, { once: true });
      });
    });
    await page.screenshot({ path: pngPath });
  }

  await browser.close();
})();
