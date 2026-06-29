const { chromium } = require("playwright");
const path = require("path");

const root = process.cwd();
const out = path.join(root, "public", "vr", "renders");

const views = [
  {
    file: "cruce-urbano-avenida-inteligente.png",
    title: "Cruce urbano",
    subtitle: "Avenida inteligente",
    body: `
      <rect width="4096" height="2048" fill="#0f2437"/>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#10253f"/>
        <stop offset=".48" stop-color="#6f86a0"/>
        <stop offset=".78" stop-color="#e99258"/>
        <stop offset="1" stop-color="#26323a"/>
      </linearGradient>
      <rect width="4096" height="2048" fill="url(#sky)"/>
      <circle cx="2950" cy="640" r="210" fill="#ffd37b" opacity=".9"/>
      <path d="M0 1260 C800 1030 1220 1120 2048 1010 C2840 900 3300 1030 4096 820 L4096 2048 L0 2048 Z" fill="#202b31"/>
      <path d="M0 1500 L4096 1160 L4096 2048 L0 2048 Z" fill="#2d3538"/>
      <path d="M1740 2048 L1980 1050 L2110 1050 L2360 2048 Z" fill="#111920"/>
      <path d="M0 1710 L4096 1360" stroke="#e8d36b" stroke-width="18" opacity=".72"/>
      <path d="M0 1810 L4096 1460" stroke="#f5f0da" stroke-width="8" opacity=".5"/>
      <g fill="#f7f3e4" opacity=".92">
        <rect x="1790" y="1390" width="95" height="24"/>
        <rect x="1920" y="1378" width="95" height="24"/>
        <rect x="2050" y="1366" width="95" height="24"/>
        <rect x="2180" y="1354" width="95" height="24"/>
        <rect x="2310" y="1342" width="95" height="24"/>
      </g>
      <g fill="#1b3348">
        <rect x="270" y="790" width="280" height="470" rx="22"/>
        <rect x="640" y="670" width="330" height="590" rx="26"/>
        <rect x="3050" y="700" width="360" height="560" rx="28"/>
        <rect x="3500" y="820" width="300" height="440" rx="22"/>
      </g>
      <g fill="#bfe7ff" opacity=".78">
        ${Array.from({ length: 8 }, (_, i) => `<rect x="${310 + i * 26}" y="850" width="9" height="300" rx="4"/>`).join("")}
        ${Array.from({ length: 10 }, (_, i) => `<rect x="${705 + i * 26}" y="740" width="9" height="400" rx="4"/>`).join("")}
        ${Array.from({ length: 11 }, (_, i) => `<rect x="${3120 + i * 26}" y="775" width="9" height="390" rx="4"/>`).join("")}
      </g>
      <g stroke="#f7c948" stroke-width="12" opacity=".9">
        <path d="M700 1320 C1200 1160 1500 1180 1880 1070"/>
        <path d="M2250 1070 C2670 990 3120 1060 3620 930"/>
      </g>
      <g>
        <rect x="1990" y="730" width="52" height="310" rx="20" fill="#141b22"/>
        <circle cx="2016" cy="790" r="23" fill="#ef4444"/>
        <circle cx="2016" cy="870" r="23" fill="#facc15"/>
        <circle cx="2016" cy="950" r="23" fill="#22c55e"/>
      </g>
      <text x="2048" y="1900" text-anchor="middle" font-family="Arial" font-size="52" fill="#fff" opacity=".55">${"Cruce urbano - avenida inteligente"}</text>
    `,
  },
  {
    file: "fachada-institucional-principal.png",
    title: "Fachada institucional",
    subtitle: "Acceso principal",
    body: `
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#28405d"/>
        <stop offset=".55" stop-color="#b7c4c9"/>
        <stop offset="1" stop-color="#e1b377"/>
      </linearGradient>
      <rect width="4096" height="2048" fill="url(#sky)"/>
      <circle cx="3020" cy="520" r="190" fill="#ffe08a" opacity=".8"/>
      <path d="M0 1220 C780 1060 1280 1120 2048 980 C2820 840 3240 1000 4096 870 L4096 2048 L0 2048 Z" fill="#28323a"/>
      <rect x="1120" y="570" width="1850" height="850" rx="32" fill="#cdbf9e"/>
      <rect x="1035" y="500" width="2020" height="120" rx="28" fill="#eee2c8"/>
      <rect x="1180" y="650" width="1730" height="80" fill="#a28f72" opacity=".55"/>
      <g fill="#243948">
        ${Array.from({ length: 8 }, (_, i) => `<rect x="${1280 + i * 190}" y="790" width="92" height="260" rx="8"/>`).join("")}
      </g>
      <rect x="1860" y="1080" width="360" height="340" rx="22" fill="#5c5044"/>
      <path d="M960 1420 L3130 1420 L3500 2048 L600 2048 Z" fill="#e6ddca"/>
      <g stroke="#c4b393" stroke-width="9" opacity=".8">
        <path d="M1120 1545 L2980 1545"/>
        <path d="M1010 1700 L3090 1700"/>
        <path d="M900 1870 L3200 1870"/>
      </g>
      <g fill="#314f39">
        <rect x="730" y="1270" width="42" height="270"/>
        <circle cx="750" cy="1200" r="135"/>
        <rect x="3320" y="1270" width="42" height="270"/>
        <circle cx="3340" cy="1200" r="135"/>
      </g>
      <g fill="#f8d36b" opacity=".95">
        <circle cx="1040" cy="1490" r="22"/>
        <circle cx="3050" cy="1490" r="22"/>
        <circle cx="1550" cy="1775" r="18"/>
        <circle cx="2550" cy="1775" r="18"/>
      </g>
      <text x="2048" y="410" text-anchor="middle" font-family="Arial" font-size="68" fill="#24313a" font-weight="700">Fachada institucional</text>
      <text x="2048" y="1900" text-anchor="middle" font-family="Arial" font-size="52" fill="#fff" opacity=".55">Acceso principal</text>
    `,
  },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 4096, height: 2048 } });

  for (const view of views) {
    await page.setContent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="4096" height="2048" viewBox="0 0 4096 2048">
        ${view.body}
      </svg>
    `);
    await page.locator("svg").screenshot({ path: path.join(out, view.file) });
  }

  await browser.close();
})();
