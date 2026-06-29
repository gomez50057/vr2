const { chromium } = require("playwright");
const { readFileSync } = require("fs");
const path = require("path");

const root = process.cwd();
const input = path.join(root, "public", "vr", "renders", "nodo-01-entrada.png");
const output = input;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2048, height: 1024 } });
  const src = `data:image/png;base64,${readFileSync(input).toString("base64")}`;

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

        ctx.filter = "blur(18px) brightness(0.8)";
        ctx.drawImage(img, -70, -36, 2188, 1096);
        ctx.filter = "none";

        // ponytail: vertical squeeze keeps the 2:1 panorama but prevents the art from clipping in Cardboard.
        ctx.drawImage(img, 0, 128, 2048, 768);

        const gradientTop = ctx.createLinearGradient(0, 0, 0, 180);
        gradientTop.addColorStop(0, "rgba(6,19,30,.38)");
        gradientTop.addColorStop(1, "rgba(6,19,30,0)");
        ctx.fillStyle = gradientTop;
        ctx.fillRect(0, 0, 2048, 180);

        const gradientBottom = ctx.createLinearGradient(0, 844, 0, 1024);
        gradientBottom.addColorStop(0, "rgba(6,19,30,0)");
        gradientBottom.addColorStop(1, "rgba(6,19,30,.38)");
        ctx.fillStyle = gradientBottom;
        ctx.fillRect(0, 844, 2048, 180);
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
