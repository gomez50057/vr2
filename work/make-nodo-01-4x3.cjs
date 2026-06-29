const { chromium } = require("playwright");
const { readFileSync } = require("fs");
const path = require("path");

const root = process.cwd();
const input = path.join(root, "work", "nodo-01-entrada.before-vertical-fit.png");
const fallback = path.join(root, "public", "vr", "renders", "nodo-01-entrada.png");
const output = path.join(root, "public", "vr", "renders", "nodo-01-entrada.png");

(async () => {
  const source = readFileSync(require("fs").existsSync(input) ? input : fallback);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2048, height: 1536 } });
  const src = `data:image/png;base64,${source.toString("base64")}`;

  await page.setContent(`
    <canvas width="2048" height="1536"></canvas>
    <img src="${src}" alt="" style="display:none">
    <script>
      const canvas = document.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.querySelector("img");
      img.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.filter = "blur(22px) brightness(0.82)";
        ctx.drawImage(img, -90, -150, 2228, 1836);
        ctx.filter = "none";

        // ponytail: 4:3 placeholder for vertical review; replace with real 360 render later.
        ctx.drawImage(img, 0, 256, 2048, 1024);

        const top = ctx.createLinearGradient(0, 0, 0, 280);
        top.addColorStop(0, "rgba(5,18,30,.34)");
        top.addColorStop(1, "rgba(5,18,30,0)");
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, 2048, 280);

        const bottom = ctx.createLinearGradient(0, 1256, 0, 1536);
        bottom.addColorStop(0, "rgba(5,18,30,0)");
        bottom.addColorStop(1, "rgba(5,18,30,.34)");
        ctx.fillStyle = bottom;
        ctx.fillRect(0, 1256, 2048, 280);
      };
    </script>
  `, { waitUntil: "domcontentloaded" });

  await page.locator("img").evaluate((img) =>
    img.complete ? true : new Promise((resolve) => img.addEventListener("load", resolve, { once: true })),
  );
  await page.waitForTimeout(200);
  await page.locator("canvas").screenshot({ path: output });
  await browser.close();
})();
