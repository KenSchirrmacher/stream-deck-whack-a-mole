import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const PHOTO = "C:/Users/kensc/Downloads/PXL_20261019_224225870.jpg";
const PLUGIN_ICON = "C:/users/kensc/OneDrive/Documents/GitHub/Stream Deck Whack-a-Mole/com.homedeck.whackamole.sdPlugin/imgs/plugin/plugin-icon@2x.png";
const OUT = "C:/Users/kensc/AppData/Local/Temp/claude/C--users-kensc-OneDrive-Documents-GitHub/c9391527-b74f-4f95-a256-95f796cb078e/scratchpad/marketplace";

fs.mkdirSync(OUT, { recursive: true });

// --- Icon: 288x288 from the existing plugin icon ---
await sharp(PLUGIN_ICON).resize(288, 288).png().toFile(path.join(OUT, "icon-288.png"));

// --- Thumbnail: 1920x960 (2:1) banner, cropped from the device photo ---
await sharp(PHOTO)
  .resize(1920, 960, { fit: "cover", position: "attention" })
  .jpeg({ quality: 90 })
  .toFile(path.join(OUT, "thumbnail-1920x960.jpg"));

// --- Gallery 1: full device photo, fit to 1920x960 (2:1, matches gallery spec) ---
await sharp(PHOTO)
  .resize(1920, 960, { fit: "cover", position: "attention" })
  .jpeg({ quality: 92 })
  .toFile(path.join(OUT, "gallery-1-device-photo.jpg"));

// --- Reproduce the plugin's own key art (same code as src/game/render.ts) ---
const GRASS = "#3D8361";
const GRASS_DARK = "#346F53";
const DIRT_MOUND = "#8A5A2B";
const HOLE = "#1C1208";
const MOLE_BODY = "#B9834F";
const MOLE_BELLY = "#E7C08C";
const SIZE = 144;

function wrap(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect width="${SIZE}" height="${SIZE}" rx="18" fill="${GRASS}"/>
    <ellipse cx="72" cy="128" rx="70" ry="14" fill="${GRASS_DARK}" opacity="0.5"/>
    ${body}
  </svg>`;
}
function moundAndHole() {
  return `<ellipse cx="72" cy="102" rx="46" ry="18" fill="${DIRT_MOUND}"/><ellipse cx="72" cy="100" rx="38" ry="14" fill="${HOLE}"/>`;
}
function grassTufts() {
  return `<path d="M28 96 l4 -10 l4 10 Z" fill="${GRASS_DARK}"/><path d="M116 96 l4 -10 l4 10 Z" fill="${GRASS_DARK}"/><path d="M40 108 l3 -8 l3 8 Z" fill="${GRASS_DARK}"/><path d="M104 108 l3 -8 l3 8 Z" fill="${GRASS_DARK}"/>`;
}
function moleBody(liftPx, blink) {
  const cy = 112 - liftPx;
  const eye = blink
    ? `<path d="M60 ${(cy - 10).toFixed(1)} q4 4 8 0" stroke="#2A2112" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M76 ${(cy - 10).toFixed(1)} q4 4 8 0" stroke="#2A2112" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
    : `<circle cx="63" cy="${(cy - 9).toFixed(1)}" r="5.5" fill="#FFFFFF"/><circle cx="81" cy="${(cy - 9).toFixed(1)}" r="5.5" fill="#FFFFFF"/><circle cx="64.5" cy="${(cy - 9).toFixed(1)}" r="2.8" fill="#2A2112"/><circle cx="82.5" cy="${(cy - 9).toFixed(1)}" r="2.8" fill="#2A2112"/><circle cx="63.3" cy="${(cy - 10.3).toFixed(1)}" r="1" fill="#fff"/><circle cx="81.3" cy="${(cy - 10.3).toFixed(1)}" r="1" fill="#fff"/>`;
  return `
    <ellipse cx="55" cy="${(cy + 6).toFixed(1)}" rx="9" ry="6" fill="${MOLE_BODY}"/>
    <ellipse cx="89" cy="${(cy + 6).toFixed(1)}" rx="9" ry="6" fill="${MOLE_BODY}"/>
    <circle cx="58" cy="${(cy - 24).toFixed(1)}" r="9" fill="${MOLE_BODY}"/>
    <circle cx="86" cy="${(cy - 24).toFixed(1)}" r="9" fill="${MOLE_BODY}"/>
    <circle cx="58" cy="${(cy - 22).toFixed(1)}" r="4.5" fill="#E7A9C2"/>
    <circle cx="86" cy="${(cy - 22).toFixed(1)}" r="4.5" fill="#E7A9C2"/>
    <circle cx="72" cy="${cy.toFixed(1)}" r="34" fill="${MOLE_BODY}"/>
    <ellipse cx="72" cy="${(cy + 14).toFixed(1)}" rx="20" ry="16" fill="${MOLE_BELLY}"/>
    ${eye}
    <ellipse cx="72" cy="${(cy - 1).toFixed(1)}" rx="5" ry="3.5" fill="#E7A9C2"/>
    <path d="M66 ${(cy + 6).toFixed(1)} Q72 ${(cy + 11).toFixed(1)} 78 ${(cy + 6).toFixed(1)}" stroke="#6B4A2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  `;
}
function idleFrame() { return wrap(`${grassTufts()}${moundAndHole()}`); }
function moleFrame(frame) {
  const cycle = frame % 10;
  const liftPx = cycle < 4 ? [6, 16, 24, 28][cycle] : 28;
  const blink = cycle === 7;
  return wrap(`${grassTufts()}${moleBody(liftPx, blink)}${moundAndHole()}`);
}
function popFrame() {
  return wrap(`
    <g stroke="#FFEE58" stroke-width="5" stroke-linecap="round">
      <line x1="72" y1="10" x2="72" y2="26"/><line x1="30" y1="34" x2="42" y2="44"/><line x1="114" y1="34" x2="102" y2="44"/>
    </g>
    ${moleBody(30, true)}${moundAndHole()}
    <circle cx="108" cy="40" r="6" fill="#FFEE58"/><circle cx="36" cy="46" r="4" fill="#FFEE58"/>
    <text x="112" y="100" font-family="Segoe UI, sans-serif" font-size="26" font-weight="800" text-anchor="middle" fill="#FFEE58" stroke="#5C3B00" stroke-width="1">+1</text>
  `);
}
const FIREWORK_PALETTE = ["#FF5252", "#FFD740", "#69F0AE", "#40C4FF", "#E040FB"];
function celebrationFrame(seed) {
  let bursts = "";
  for (let i = 0; i < 3; i++) {
    const angle = ((seed * 41 + i * 97) % 360) * (Math.PI / 180);
    const cx = 72 + Math.cos(angle) * 30;
    const cy = 60 + Math.sin(angle) * 30;
    const r = 8 + ((seed + i * 13) % 16);
    const color = FIREWORK_PALETTE[(seed + i) % FIREWORK_PALETTE.length];
    bursts += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${color}" opacity="0.85"/>`;
  }
  return wrap(`${bursts}${moleBody(28, false)}${moundAndHole()}`);
}

// --- Gallery 2: "how it works" grid — mostly idle cells, one mole up mid-pop ---
// Canvas is exactly 1920x960 (gallery spec); cell size comes from the tighter (height) axis,
// then leftover width is distributed as side padding so nothing gets cropped or stretched.
{
  const W = 1920, H = 960;
  const cols = 8, rows = 4, gap = 10, padY = 40;
  const cell = Math.round((H - padY * 2 - gap * (rows - 1)) / rows);
  const contentW = cols * cell + (cols - 1) * gap;
  const padX = Math.round((W - contentW) / 2);
  const targetIndex = 12; // somewhere in the middle
  const composites = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const svg = i === targetIndex ? moleFrame(2) : idleFrame();
      composites.push({
        input: await sharp(Buffer.from(svg)).resize(cell, cell).png().toBuffer(),
        left: padX + c * (cell + gap),
        top: padY + r * (cell + gap),
      });
      i++;
    }
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: "#15171c" } })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT, "gallery-2-grid-concept.jpg"));
}

// --- Gallery 3: mole pop-up sequence + celebration, side by side ---
// Canvas is exactly 1920x960 (gallery spec); cell size comes from the height axis,
// leftover width/height distributed as padding so nothing gets cropped or stretched.
{
  const W = 1920, H = 960;
  const frames = [idleFrame(), moleFrame(1), moleFrame(3), popFrame(), celebrationFrame(7)];
  const gap = 40, outerMargin = 60;
  const cellFromWidth = Math.floor((W - outerMargin * 2 - gap * (frames.length - 1)) / frames.length);
  const cellFromHeight = H - outerMargin * 2;
  const cell = Math.min(cellFromWidth, cellFromHeight);
  const contentW = frames.length * cell + (frames.length - 1) * gap;
  const padX = Math.round((W - contentW) / 2);
  const padY = Math.round((H - cell) / 2);
  const composites = [];
  for (let i = 0; i < frames.length; i++) {
    composites.push({
      input: await sharp(Buffer.from(frames[i])).resize(cell, cell).png().toBuffer(),
      left: padX + i * (cell + gap),
      top: padY,
    });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: "#15171c" } })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT, "gallery-3-sequence.jpg"));
}

console.log("Done:", fs.readdirSync(OUT));
