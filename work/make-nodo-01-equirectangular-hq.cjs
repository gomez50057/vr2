const { chromium } = require("playwright");
const { readFileSync } = require("fs");
const path = require("path");

const root = process.cwd();
const sourcePath = path.join(root, "work", "nodo-01-entrada.before-4x3.png");
const outputPath = path.join(root, "public", "vr", "renders", "nodo-01-entrada.png");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 4096, height: 2048 } });
  const src = `data:image/png;base64,${readFileSync(sourcePath).toString("base64")}`;

  await page.setContent(`
    <canvas width="4096" height="2048"></canvas>
    <img src="${src}" alt="" style="display:none">
    <script>
      const canvas = document.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.querySelector("img");
      img.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, 4096, 2048);
      };
    </script>
  `, { waitUntil: "domcontentloaded" });

  await page.locator("img").evaluate((img) =>
    img.complete ? true : new Promise((resolve) => img.addEventListener("load", resolve, { once: true })),
  );
  await page.waitForTimeout(200);
  await page.locator("canvas").screenshot({ path: outputPath });
  await browser.close();
})();
