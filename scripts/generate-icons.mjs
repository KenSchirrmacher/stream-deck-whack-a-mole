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

function svgIcon(body, size = 72) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#101014"/>
  ${body}
</svg>`);
}

async function writeIcon(dir, name, body, sizes = [72, 144]) {
  const folder = path.join(root, dir);
  fs.mkdirSync(folder, { recursive: true });
  for (const [index, size] of sizes.entries()) {
    const scale = size / sizes[0];
    const svg = svgIcon(body.replace(/stroke-width="(\d+)"/g, (_, w) => `stroke-width="${Number(w) * scale}"`), size);
    const out = path.join(folder, `${name}${index === 1 ? "@2x" : ""}.png`);
    await sharp(svg).png().toFile(out);
  }
}

const pluginBody = `
  <circle cx="36" cy="40" r="16" fill="#FFC107"/>
  <circle cx="29" cy="36" r="2.5" fill="#2A2112"/>
  <circle cx="43" cy="36" r="2.5" fill="#2A2112"/>
  <path d="M29 46 Q36 51 43 46" stroke="#2A2112" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="36" cy="58" rx="20" ry="5" fill="#1A1B22"/>`;

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
