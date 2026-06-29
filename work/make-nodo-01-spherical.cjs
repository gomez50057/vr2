const { chromium } = require("playwright");
const { existsSync, readFileSync } = require("fs");
const path = require("path");

const root = process.cwd();
const sourcePath = path.join(root, "work", "nodo-01-entrada.before-4x3.png");
const fallbackPath = path.join(root, "public", "vr", "renders", "nodo-01-entrada.png");
const outputPath = path.join(root, "public", "vr", "renders", "nodo-01-entrada.png");

(async () => {
  const source = readFileSync(existsSync(sourcePath) ? sourcePath : fallbackPath);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2048, height: 1024 } });
  const src = `data:image/png;base64,${source.toString("base64")}`;

  await page.setContent(`
    <canvas width="2048" height="1024"></canvas>
    <img src="${src}" alt="" style="display:none">
    <script>
      const canvas = document.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.querySelector("img");
      img.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.filter = "blur(26px) brightness(0.72)";
        ctx.drawImage(img, -130, -160, 2308, 1344);
        ctx.filter = "none";

        // ponytail: fake equirectangular texture; replace with real 2:1 360 render when available.
        ctx.drawImage(img, 270, 300, 1508, 424);

        const top = ctx.createLinearGradient(0, 0, 0, 310);
        top.addColorStop(0, "rgba(5,18,30,.56)");
        top.addColorStop(1, "rgba(5,18,30,0)");
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, 2048, 310);

        const bottom = ctx.createLinearGradient(0, 714, 0, 1024);
        bottom.addColorStop(0, "rgba(5,18,30,0)");
        bottom.addColorStop(1, "rgba(5,18,30,.56)");
        ctx.fillStyle = bottom;
        ctx.fillRect(0, 714, 2048, 310);
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
