import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve("public/sprites");
fs.mkdirSync(OUT_DIR, { recursive: true });

const WORKS = [
  {
    id: "pixel",
    name: "Pixel",
    shape: "chubby",
    color: "#b9b3ff",
    accent: "#5b46d6",
    eyeColor: "#8a4bd6",
    eyes: "happy",
    accessory: "halo",
    title: "Intelligence & Research Lead",
  },
  {
    id: "auditor",
    name: "Auditor",
    shape: "tall",
    color: "#fed7aa",
    accent: "#c2410c",
    eyeColor: "#431407",
    eyes: "classic",
    accessory: "monocle",
    title: "Funnel & Conversion Auditor",
  },
  {
    id: "scout",
    name: "Scout",
    shape: "round",
    color: "#bae6fd",
    accent: "#0284c7",
    eyeColor: "#0369a1",
    eyes: "star",
    accessory: "cap",
    title: "Market & SEO Radar",
  },
  {
    id: "architect",
    name: "Architect",
    shape: "cube",
    color: "#d9f99d",
    accent: "#65a30d",
    eyeColor: "#365314",
    eyes: "shades",
    accessory: "headphones",
    title: "Lead System Architect",
  },
  {
    id: "curator",
    name: "Curator",
    shape: "tall",
    color: "#e9d5ff",
    accent: "#9333ea",
    eyeColor: "#581c87",
    eyes: "classic",
    accessory: "wizard",
    title: "Knowledge Base Curator",
  },
  {
    id: "scribe",
    name: "Scribe",
    shape: "chubby",
    color: "#fbcfe8",
    accent: "#db2777",
    eyeColor: "#831843",
    eyes: "happy",
    accessory: "beret",
    title: "Client & Content Scribe",
  },
  {
    id: "creator",
    name: "Creator",
    shape: "round",
    color: "#ffa7c4",
    accent: "#d8195f",
    eyeColor: "#2b5fd9",
    eyes: "wink",
    accessory: "cap",
    title: "Creative Director",
  },
  {
    id: "bix",
    name: "Bix",
    shape: "round",
    color: "#f4efe6",
    accent: "#3b3842",
    eyeColor: "#c2410c",
    eyes: "classic",
    accessory: "headphones",
    title: "Operations & Reliability",
  },
  {
    id: "juniper",
    name: "Juniper",
    shape: "chubby",
    color: "#97e0b8",
    accent: "#1f8f5f",
    eyeColor: "#1f8f5f",
    eyes: "happy",
    accessory: "sprout",
    title: "Executive Assistant & Inbox",
  },
  {
    id: "atlas",
    name: "Atlas",
    shape: "tall",
    color: "#ffd98a",
    accent: "#e0492d",
    eyeColor: "#c2410c",
    eyes: "wide",
    accessory: "cap",
    title: "Travel & Logistics Planner",
  },
];

function mix(hex, other, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [p(hex), p(other)];
  if (a.some(Number.isNaN) || b.some(Number.isNaN)) return hex;
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
}

function renderWorkSvg(w, size = 128) {
  const isChubby = w.shape === "chubby";
  const isTall = w.shape === "tall";
  const isCube = w.shape === "cube";

  const rx = isChubby ? 42 : isTall ? 34 : isCube ? 38 : 37;
  const ry = isChubby ? 34 : isTall ? 44 : isCube ? 38 : 37;
  const cx = 64;
  const cy = 68;
  const eyeY = cy - 7;
  const ink = "#1c1622";

  // Eyes rendering
  let eyesMarkup = "";
  if (w.eyes === "happy") {
    eyesMarkup = `
      <path d="M${cx - 16} ${eyeY + 2} Q${cx - 10} ${eyeY - 6} ${cx - 4} ${eyeY + 2}" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M${cx + 4} ${eyeY + 2} Q${cx + 10} ${eyeY - 6} ${cx + 16} ${eyeY + 2}" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>
    `;
  } else if (w.eyes === "wink") {
    eyesMarkup = `
      <g>
        <ellipse cx="${cx - 10}" cy="${eyeY}" rx="5" ry="9" fill="${ink}"/>
        <ellipse cx="${cx - 10}" cy="${eyeY + 3.5}" rx="3.8" ry="4.8" fill="${w.eyeColor}"/>
        <ellipse cx="${cx - 10}" cy="${eyeY - 3.5}" rx="2.8" ry="3.5" fill="#fff"/>
      </g>
      <path d="M${cx + 4} ${eyeY + 2} Q${cx + 10} ${eyeY - 6} ${cx + 16} ${eyeY + 2}" fill="none" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>
    `;
  } else if (w.eyes === "shades") {
    eyesMarkup = `
      <path d="M${cx - 20} ${eyeY - 5} H${cx + 20} L${cx + 17} ${eyeY + 7} H${cx - 17} Z" fill="${ink}" rx="2"/>
      <path d="M${cx - 18} ${eyeY - 3} H${cx - 2} L${cx - 4} ${eyeY + 5} H${cx - 16} Z" fill="#38bdf8" opacity="0.85"/>
      <path d="M${cx + 2} ${eyeY - 3} H${cx + 18} L${cx + 16} ${eyeY + 5} H${cx + 4} Z" fill="#38bdf8" opacity="0.85"/>
      <line x1="${cx - 22}" y1="${eyeY - 2}" x2="${cx - 19}" y2="${eyeY - 2}" stroke="${ink}" stroke-width="2.5"/>
      <line x1="${cx + 19}" y1="${eyeY - 2}" x2="${cx + 22}" y2="${eyeY - 2}" stroke="${ink}" stroke-width="2.5"/>
    `;
  } else if (w.eyes === "star") {
    eyesMarkup = `
      <g>
        <ellipse cx="${cx - 10}" cy="${eyeY}" rx="5.5" ry="9" fill="${ink}"/>
        <ellipse cx="${cx - 10}" cy="${eyeY + 3.5}" rx="4" ry="4.8" fill="${w.eyeColor}"/>
        <polygon points="${cx - 10},${eyeY - 6} ${cx - 8.5},${eyeY - 3} ${cx - 5.5},${eyeY - 3} ${cx - 8},${eyeY - 1} ${cx - 7},${eyeY + 2} ${cx - 10},${eyeY} ${cx - 13},${eyeY + 2} ${cx - 12},${eyeY - 1} ${cx - 14.5},${eyeY - 3} ${cx - 11.5},${eyeY - 3}" fill="#fff"/>
      </g>
      <g>
        <ellipse cx="${cx + 10}" cy="${eyeY}" rx="5.5" ry="9" fill="${ink}"/>
        <ellipse cx="${cx + 10}" cy="${eyeY + 3.5}" rx="4" ry="4.8" fill="${w.eyeColor}"/>
        <polygon points="${cx + 10},${eyeY - 6} ${cx + 11.5},${eyeY - 3} ${cx + 14.5},${eyeY - 3} ${cx + 12},${eyeY - 1} ${cx + 13},${eyeY + 2} ${cx + 10},${eyeY} ${cx + 7},${eyeY + 2} ${cx + 8},${eyeY - 1} ${cx + 5.5},${eyeY - 3} ${cx + 8.5},${eyeY - 3}" fill="#fff"/>
      </g>
    `;
  } else {
    // classic
    eyesMarkup = `
      <g>
        <ellipse cx="${cx - 10}" cy="${eyeY}" rx="5" ry="9" fill="${ink}"/>
        <ellipse cx="${cx - 10}" cy="${eyeY + 3.5}" rx="3.8" ry="4.8" fill="${w.eyeColor}"/>
        <ellipse cx="${cx - 10}" cy="${eyeY - 3.5}" rx="2.8" ry="3.5" fill="#fff"/>
      </g>
      <g>
        <ellipse cx="${cx + 10}" cy="${eyeY}" rx="5" ry="9" fill="${ink}"/>
        <ellipse cx="${cx + 10}" cy="${eyeY + 3.5}" rx="3.8" ry="4.8" fill="${w.eyeColor}"/>
        <ellipse cx="${cx + 10}" cy="${eyeY - 3.5}" rx="2.8" ry="3.5" fill="#fff"/>
      </g>
    `;
  }

  // Accessories rendering
  let accessoryMarkup = "";
  if (w.accessory === "halo") {
    accessoryMarkup = `
      <ellipse cx="${cx}" cy="${cy - ry - 10}" rx="24" ry="6" fill="none" stroke="#f5c518" stroke-width="4.5" filter="drop-shadow(0 0 4px #fbbf24)"/>
    `;
  } else if (w.accessory === "monocle") {
    accessoryMarkup = `
      <circle cx="${cx + 10}" cy="${eyeY}" r="11" fill="none" stroke="#f59e0b" stroke-width="2.8"/>
      <path d="M${cx + 21} ${eyeY} C${cx + 26} ${eyeY + 12}, ${cx + 18} ${eyeY + 24}, ${cx + 12} ${eyeY + 30}" fill="none" stroke="#d97706" stroke-width="1.6" stroke-dasharray="2,2"/>
    `;
  } else if (w.accessory === "cap") {
    accessoryMarkup = `
      <path d="M${cx - 24} ${cy - ry + 4} Q${cx} ${cy - ry - 14} ${cx + 24} ${cy - ry + 4} Z" fill="${w.accent}"/>
      <path d="M${cx - 26} ${cy - ry + 4} Q${cx} ${cy - ry + 2} ${cx + 34} ${cy - ry - 1}" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="${cx + 14}" cy="${cy - ry + 2}" rx="14" ry="3.5" fill="${w.accent}"/>
    `;
  } else if (w.accessory === "headphones") {
    accessoryMarkup = `
      <path d="M${cx - rx + 3} ${cy - 2} C${cx - rx + 3} ${cy - ry - 16}, ${cx + rx - 3} ${cy - ry - 16}, ${cx + rx - 3} ${cy - 2}" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="${cx - rx - 4}" y="${cy - 12}" width="9" height="20" rx="4" fill="${w.accent}" stroke="${ink}" stroke-width="2.5"/>
      <rect x="${cx + rx - 5}" y="${cy - 12}" width="9" height="20" rx="4" fill="${w.accent}" stroke="${ink}" stroke-width="2.5"/>
    `;
  } else if (w.accessory === "wizard") {
    accessoryMarkup = `
      <path d="M${cx - 26} ${cy - ry + 5} L${cx} ${cy - ry - 32} L${cx + 26} ${cy - ry + 5} Z" fill="${w.accent}"/>
      <ellipse cx="${cx}" cy="${cy - ry + 5}" rx="30" ry="6" fill="${ink}"/>
      <polygon points="${cx},${cy - ry - 18} ${cx + 2},${cy - ry - 13} ${cx + 7},${cy - ry - 13} ${cx + 3},${cy - ry - 10} ${cx + 5},${cy - ry - 5} ${cx},${cy - ry - 8} ${cx - 5},${cy - ry - 5} ${cx - 3},${cy - ry - 10} ${cx - 7},${cy - ry - 13} ${cx - 2},${cy - ry - 13}" fill="#facc15"/>
    `;
  } else if (w.accessory === "beret") {
    accessoryMarkup = `
      <ellipse cx="${cx + 4}" cy="${cy - ry + 2}" rx="28" ry="10" fill="${w.accent}" transform="rotate(-8 ${cx} ${cy - ry})"/>
      <circle cx="${cx + 4}" cy="${cy - ry - 7}" r="2" fill="${ink}"/>
    `;
  } else if (w.accessory === "sprout") {
    accessoryMarkup = `
      <path d="M${cx} ${cy - ry + 4} Q${cx - 1} ${cy - ry - 14} ${cx} ${cy - ry - 16}" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
      <path d="M${cx} ${cy - ry - 16} Q${cx - 12} ${cy - ry - 22} ${cx - 10} ${cy - ry - 12} Q${cx - 4} ${cy - ry - 14} ${cx} ${cy - ry - 16} Z" fill="#22c55e" stroke="${ink}" stroke-width="2"/>
      <path d="M${cx} ${cy - ry - 16} Q${cx + 12} ${cy - ry - 22} ${cx + 10} ${cy - ry - 12} Q${cx + 4} ${cy - ry - 14} ${cx} ${cy - ry - 16} Z" fill="#22c55e" stroke="${ink}" stroke-width="2"/>
    `;
  } else if (w.accessory === "antenna") {
    accessoryMarkup = `
      <path d="M${cx} ${cy - ry + 4} L${cx} ${cy - ry - 14}" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy - ry - 16}" r="5" fill="${w.accent}" stroke="${ink}" stroke-width="2.5"/>
    `;
  }

  // Feet
  const footY = cy + ry - 4;
  const feetMarkup = `
    <ellipse cx="${cx - 17}" cy="${footY}" rx="12" ry="7" fill="${w.accent}" stroke="${ink}" stroke-width="2.8"/>
    <ellipse cx="${cx + 17}" cy="${footY}" rx="12" ry="7" fill="${w.accent}" stroke="${ink}" stroke-width="2.8"/>
  `;

  // Arms
  const armsMarkup = `
    <ellipse cx="${cx - rx + 3}" cy="${cy + 6}" rx="6" ry="10" fill="${w.color}" stroke="${ink}" stroke-width="2.8" transform="rotate(18 ${cx - rx + 3} ${cy + 6})"/>
    <ellipse cx="${cx + rx - 3}" cy="${cy + 6}" rx="6" ry="10" fill="${w.color}" stroke="${ink}" stroke-width="2.8" transform="rotate(-18 ${cx + rx - 3} ${cy + 6})"/>
  `;

  // Body
  const gradId = `grad_${w.id}`;
  let bodyMarkup = "";
  if (isCube) {
    bodyMarkup = `
      <rect x="${cx - rx}" y="${cy - ry}" width="${rx * 2}" height="${ry * 2}" rx="18" fill="url(#${gradId})" stroke="${ink}" stroke-width="3.5"/>
    `;
  } else {
    bodyMarkup = `
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${gradId})" stroke="${ink}" stroke-width="3.5"/>
    `;
  }

  // Blush & Smile
  const blushMarkup = `
    <ellipse cx="${cx - 19}" cy="${cy + 2}" rx="5" ry="3" fill="#ff4f8b" opacity="0.45"/>
    <ellipse cx="${cx + 19}" cy="${cy + 2}" rx="5" ry="3" fill="#ff4f8b" opacity="0.45"/>
    <path d="M${cx - 4.5} ${cy + 3} Q${cx} ${cy + 7} ${cx + 4.5} ${cy + 3}" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>
  `;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="${size}" height="${size}">
  <defs>
    <radialGradient id="${gradId}" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="${mix(w.color, "#ffffff", 0.5)}"/>
      <stop offset="55%" stop-color="${w.color}"/>
      <stop offset="100%" stop-color="${mix(w.color, "#000000", 0.15)}"/>
    </radialGradient>
    <filter id="shadow_${w.id}" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.12"/>
    </filter>
  </defs>

  <g filter="url(#shadow_${w.id})">
    ${accessoryMarkup}
    ${feetMarkup}
    ${armsMarkup}
    ${bodyMarkup}
    ${blushMarkup}
    ${eyesMarkup}
  </g>
</svg>
`.trim();
}

console.log(`[SPRITES] Generating SVG sprites into ${OUT_DIR}...`);

for (const w of WORKS) {
  const svg = renderWorkSvg(w, 256);
  const filePath = path.join(OUT_DIR, `${w.id}.svg`);
  fs.writeFileSync(filePath, svg, "utf8");
  console.log(`✓ Generated ${w.id}.svg (${w.name})`);
}

// Generate combined sprite sheet
const sheetWidth = WORKS.length * 128;
const sheetSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sheetWidth} 128" width="${sheetWidth}" height="128">
  <rect width="${sheetWidth}" height="128" fill="#fafafa" rx="12"/>
  ${WORKS.map((w, i) => `<g transform="translate(${i * 128}, 0)">${renderWorkSvg(w, 128)}<text x="64" y="122" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle" fill="#4b5563">${w.name}</text></g>`).join("\n")}
</svg>
`.trim();

fs.writeFileSync(path.join(OUT_DIR, "works-spritesheet.svg"), sheetSvg, "utf8");
console.log("✓ Generated works-spritesheet.svg");

// Write index.json
fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(WORKS, null, 2), "utf8");
console.log("✓ Generated sprites index.json");
