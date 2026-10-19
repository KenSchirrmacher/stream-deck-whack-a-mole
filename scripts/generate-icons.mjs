/**
 * Generates PNG icons for the Whack-a-Mole plugin (plugin, category, and action icons).
 * Run: node scripts/generate-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "com.homedeck.whackamole.sdPlugin", "imgs");

// All icon bodies below are authored on a fixed 72x72 design grid. Rendering with
// width/height = target size but viewBox always "0 0 72 72" lets SVG scale every
// coordinate (not just stroke-width) proportionally, so artwork fills the canvas
// at any requested size instead of staying pinned to its original 72px position.
const GRID = 72;

function svgIcon(body, size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${GRID} ${GRID}">
  <rect width="${GRID}" height="${GRID}" rx="${GRID * 0.18}" fill="#101014"/>
  ${body}
</svg>`);
}

async function writeIcon(dir, name, body, sizes = [72, 144]) {
  const folder = path.join(root, dir);
  fs.mkdirSync(folder, { recursive: true });
  for (const [index, size] of sizes.entries()) {
    const svg = svgIcon(body, size);
    const out = path.join(folder, `${name}${index === 1 ? "@2x" : ""}.png`);
    await sharp(svg).png().toFile(out);
  }
}

// Same mole character and palette as the in-game key art (src/game/render.ts), just
// cropped to a head-only portrait so it reads clearly at plugin-icon size.
const pluginBody = `
  <circle cx="24" cy="22" r="9" fill="#B9834F"/>
  <circle cx="48" cy="22" r="9" fill="#B9834F"/>
  <circle cx="36" cy="38" r="21" fill="#B9834F"/>
  <circle cx="28" cy="34" r="5" fill="#FFFFFF"/>
  <circle cx="44" cy="34" r="5" fill="#FFFFFF"/>
  <circle cx="29" cy="35" r="2.5" fill="#2A2112"/>
  <circle cx="45" cy="35" r="2.5" fill="#2A2112"/>
  <ellipse cx="36" cy="45" rx="5" ry="3.5" fill="#E7A9C2"/>
  <path d="M30 50 Q36 55 42 50" stroke="#6B4A2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="36" cy="64" rx="22" ry="5" fill="#1A1B22"/>`;

const categoryBody = `
  <circle cx="36" cy="36" r="20" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  <text x="36" y="42" fill="#FFFFFF" font-family="Segoe UI, sans-serif" font-size="18" font-weight="700" text-anchor="middle">W</text>`;

const moleCellBody = `
  <ellipse cx="36" cy="54" rx="18" ry="5" fill="#1A1B22"/>
  <circle cx="36" cy="38" r="14" fill="#23242C"/>`;

await writeIcon("plugin", "plugin-icon", pluginBody, [256, 512]);
await writeIcon("plugin", "category-icon", categoryBody, [28, 56]);
await writeIcon("actions/mole-cell", "icon", moleCellBody);

console.log("Icons generated in com.homedeck.whackamole.sdPlugin/imgs/");
