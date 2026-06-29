const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const renderDir = path.join(root, "public", "vr", "renders");
const backupDir = path.join(root, "work", "render-backups-before-4096");
const files = [
  "plaza-civica-torre-reloj.png",
  "calle-peatonal-comercial.png",
  "estacion-transporte-elevado.png",
  "mirador-urbano-panoramico.png",
];

fs.mkdirSync(backupDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 4096, height: 2048 } });

  for (const file of files) {
    const sourcePath = path.join(renderDir, file);
    const backupPath = path.join(backupDir, file);

    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(sourcePath, backupPath);
    }

    const sourceData = fs.readFileSync(sourcePath).toString("base64");
    const url = `data:image/png;base64,${sourceData}`;
    await page.setContent(`
      <style>
        html, body { margin: 0; width: 4096px; height: 2048px; overflow: hidden; background: #111; }
        canvas { display: block; width: 4096px; height: 2048px; }
      </style>
      <canvas width="4096" height="2048"></canvas>
      <img crossorigin="anonymous" hidden />
      <script>
        const img = document.querySelector("img");
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        img.onload = () => {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, 4096, 2048);
          window.readyForCapture = true;
        };
        img.onerror = () => {
          window.readyForCapture = "error";
        };
        img.src = "${url}";
      </script>
    `);

    await page.waitForFunction(() => window.readyForCapture === true, { timeout: 10000 });
    await page.locator("canvas").screenshot({ path: sourcePath });
  }

  await browser.close();
})();
