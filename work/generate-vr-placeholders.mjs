import { mkdir, writeFile } from "node:fs/promises";

const outDir = new URL("../public/vr/renders/", import.meta.url);

function windows(x, y, w, h, cols = 4, rows = 3) {
  const gap = 16;
  const winW = (w - gap * (cols + 1)) / cols;
  const winH = Math.min(42, (h - gap * (rows + 1)) / rows);
  let svg = "";

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const wx = x + gap + col * (winW + gap);
      const wy = y + gap + row * (winH + gap);
      svg += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${winW.toFixed(1)}" height="${winH.toFixed(1)}" rx="4" fill="#1f3442" opacity=".78"/>`;
      svg += `<rect x="${(wx + 4).toFixed(1)}" y="${(wy + 4).toFixed(1)}" width="${Math.max(4, winW - 8).toFixed(1)}" height="5" fill="#c8f2ff" opacity=".28"/>`;
    }
  }

  return svg;
}

function building({ x, y, w, h, fill, rows = 3, cols = 4 }) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${Math.max(18, h * 0.08)}" rx="8" fill="#eef2f0" opacity=".22"/>
    ${windows(x + w * 0.08, y + h * 0.16, w * 0.84, h * 0.58, cols, rows)}
    <rect x="${x + w * 0.38}" y="${y + h * 0.72}" width="${w * 0.24}" height="${h * 0.28}" fill="#31424d" opacity=".9"/>
  `;
}

function trees(items) {
  return items
    .map(
      ([x, y, s]) => `
      <rect x="${x}" y="${y}" width="${16 * s}" height="${72 * s}" fill="#5d432e"/>
      <circle cx="${x + 8 * s}" cy="${y - 10 * s}" r="${42 * s}" fill="#3e7652"/>
      <circle cx="${x - 18 * s}" cy="${y + 4 * s}" r="${30 * s}" fill="#4f8e60"/>
      <circle cx="${x + 34 * s}" cy="${y + 7 * s}" r="${28 * s}" fill="#5b9c69"/>
    `,
    )
    .join("");
}

function lamps(items, color = "#ffe08a") {
  return items
    .map(
      ([x, y]) => `
      <rect x="${x}" y="${y}" width="8" height="160" rx="4" fill="#25313a"/>
      <circle cx="${x + 4}" cy="${y - 8}" r="16" fill="${color}"/>
      <circle cx="${x + 4}" cy="${y - 8}" r="42" fill="${color}" opacity=".16"/>
    `,
    )
    .join("");
}

function road(accent = "#f4d35e") {
  return `
    <rect y="620" width="2048" height="404" fill="#303941"/>
    <path d="M710 1024 930 620h190l220 404z" fill="#20282f"/>
    <path d="M1014 670h18l18 354h-54z" fill="${accent}" opacity=".88"/>
    <path d="M0 812h760l-50 78H0z" fill="#49545b" opacity=".72"/>
    <path d="M2048 812h-760l50 78h710z" fill="#49545b" opacity=".72"/>
  `;
}

function plaza() {
  return `
    <rect y="620" width="2048" height="404" fill="#8b826f"/>
    <ellipse cx="1024" cy="780" rx="520" ry="160" fill="#5f8d65"/>
    <ellipse cx="1024" cy="764" rx="350" ry="96" fill="#77a77d"/>
    <circle cx="1024" cy="626" r="34" fill="#f7d56b"/>
    <g stroke="#d2c5a5" stroke-width="3" opacity=".34">
      <path d="M0 728h2048"/>
      <path d="M0 830h2048"/>
      <path d="M0 932h2048"/>
      <path d="M360 620l-190 404"/>
      <path d="M790 620l-70 404"/>
      <path d="M1258 620l70 404"/>
      <path d="M1688 620l190 404"/>
    </g>
  `;
}

function crossing(accent = "#f4d35e") {
  return `
    <rect y="620" width="2048" height="404" fill="#2f3840"/>
    <path d="M830 1024h380l-80-404H910z" fill="#202831"/>
    <path d="M0 758h2048v96H0z" fill="#57636b"/>
    <g fill="#f4f1e6" opacity=".9">
      <rect x="742" y="724" width="92" height="26"/>
      <rect x="870" y="724" width="92" height="26"/>
      <rect x="998" y="724" width="92" height="26"/>
      <rect x="1126" y="724" width="92" height="26"/>
      <rect x="1254" y="724" width="92" height="26"/>
    </g>
    <rect x="1010" y="456" width="34" height="164" fill="#1f2930"/>
    <circle cx="1027" cy="486" r="15" fill="#ef4444"/>
    <circle cx="1027" cy="532" r="15" fill="${accent}"/>
    <circle cx="1027" cy="578" r="15" fill="#22c55e"/>
  `;
}

function facade() {
  return `
    <rect y="640" width="2048" height="384" fill="#3f4548"/>
    <path d="M740 1024h570l-112-384H854z" fill="#e8e1cf"/>
    <rect x="560" y="250" width="928" height="390" rx="10" fill="#cfc4ad"/>
    <rect x="620" y="205" width="808" height="64" rx="8" fill="#eee3cf"/>
    <rect x="640" y="314" width="116" height="240" fill="#2c4250"/>
    <rect x="804" y="314" width="116" height="240" fill="#2c4250"/>
    <rect x="968" y="314" width="116" height="240" fill="#2c4250"/>
    <rect x="1132" y="314" width="116" height="240" fill="#2c4250"/>
    <rect x="1296" y="314" width="116" height="240" fill="#2c4250"/>
    <rect x="920" y="555" width="208" height="85" fill="#6d5f4d"/>
  `;
}

const scenes = [
  {
    file: "nodo-01-entrada.svg",
    title: "Entrada principal",
    sky: ["#72a9c9", "#dceced", "#f4f0df"],
    ground: road("#ffd166"),
    buildings: [
      { x: 90, y: 360, w: 290, h: 260, fill: "#a7b4ba", cols: 3 },
      { x: 470, y: 295, w: 320, h: 325, fill: "#8fa1aa", rows: 4 },
      { x: 910, y: 250, w: 310, h: 370, fill: "#d6c6aa", rows: 4 },
      { x: 1300, y: 330, w: 300, h: 290, fill: "#aeb9c0" },
      { x: 1680, y: 376, w: 270, h: 244, fill: "#c9bb9d", cols: 3 },
    ],
    trees: [
      [410, 564, 0.9],
      [1545, 568, 0.9],
    ],
  },
  {
    file: "nodo-02-calle-principal.svg",
    title: "Calle principal",
    sky: ["#669fc3", "#d7e8e7", "#f1eee1"],
    ground: road("#f4d35e"),
    buildings: [
      { x: 30, y: 315, w: 320, h: 305, fill: "#94a4ad", rows: 4 },
      { x: 410, y: 238, w: 335, h: 382, fill: "#c8bda5", rows: 5 },
      { x: 1260, y: 255, w: 340, h: 365, fill: "#91a3ad", rows: 5 },
      { x: 1688, y: 332, w: 310, h: 288, fill: "#cfc2a3", rows: 3 },
    ],
    trees: [
      [780, 560, 0.75],
      [1210, 560, 0.75],
    ],
  },
  {
    file: "nodo-03-plaza.svg",
    title: "Plaza",
    sky: ["#78acd0", "#d7efec", "#f6efd9"],
    ground: plaza(),
    buildings: [
      { x: 70, y: 365, w: 285, h: 255, fill: "#b5bec2", rows: 3 },
      { x: 440, y: 305, w: 315, h: 315, fill: "#cbbda3", rows: 4 },
      { x: 1290, y: 325, w: 315, h: 295, fill: "#aab8bd", rows: 4 },
      { x: 1700, y: 385, w: 270, h: 235, fill: "#d8c9a8", rows: 3 },
    ],
    trees: [
      [850, 520, 1.15],
      [1165, 535, 1.05],
      [370, 565, 0.72],
      [1610, 565, 0.72],
    ],
  },
  {
    file: "nodo-04-cruce-urbano.svg",
    title: "Cruce urbano",
    sky: ["#6699bd", "#d9e8ea", "#f0efe3"],
    ground: crossing("#facc15"),
    buildings: [
      { x: 70, y: 310, w: 355, h: 310, fill: "#a2aeb6", rows: 4 },
      { x: 520, y: 270, w: 325, h: 350, fill: "#c6b8a0", rows: 5 },
      { x: 1210, y: 270, w: 325, h: 350, fill: "#93a5af", rows: 5 },
      { x: 1620, y: 320, w: 330, h: 300, fill: "#cec1a2", rows: 4 },
    ],
    trees: [
      [450, 560, 0.7],
      [1560, 560, 0.7],
    ],
  },
  {
    file: "nodo-05-fachada-institucional.svg",
    title: "Fachada institucional",
    sky: ["#76a8cb", "#dcebea", "#f3ecdb"],
    ground: facade(),
    buildings: [
      { x: 80, y: 420, w: 300, h: 220, fill: "#9eabb3", rows: 2 },
      { x: 1660, y: 420, w: 300, h: 220, fill: "#9eabb3", rows: 2 },
    ],
    trees: [
      [455, 545, 1.0],
      [1568, 545, 1.0],
    ],
  },
];

function render(scene) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" viewBox="0 0 2048 1024">
  <defs>
    <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${scene.sky[0]}"/>
      <stop offset=".58" stop-color="${scene.sky[1]}"/>
      <stop offset="1" stop-color="${scene.sky[2]}"/>
    </linearGradient>
    <radialGradient id="sun" cx="54%" cy="18%" r="36%">
      <stop offset="0" stop-color="#fff8d7" stop-opacity=".72"/>
      <stop offset=".42" stop-color="#fff8d7" stop-opacity=".18"/>
      <stop offset="1" stop-color="#fff8d7" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 .12"/></feComponentTransfer>
    </filter>
  </defs>
  <!-- Placeholder temporal de alta calidad: reemplazar por render equirectangular 360 real. -->
  <rect width="2048" height="1024" fill="url(#sky)"/>
  <rect width="2048" height="1024" fill="url(#sun)"/>
  <path d="M0 595c230-58 412-62 646-26 290 45 480 34 738-28 244-58 426-58 664 6v108H0z" fill="#d7dfdc" opacity=".45"/>
  ${scene.ground}
  <g>${scene.buildings.map(building).join("")}</g>
  ${trees(scene.trees)}
  ${lamps([
    [240, 486],
    [1820, 486],
    [735, 500],
    [1305, 500],
  ])}
  <rect y="0" width="2048" height="1024" filter="url(#grain)" opacity=".58"/>
  <text x="1024" y="940" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" opacity=".32">${scene.title} · render temporal 360</text>
</svg>`;
}

await mkdir(outDir, { recursive: true });
await Promise.all(
  scenes.map((scene) => writeFile(new URL(scene.file, outDir), render(scene), "utf8")),
);
