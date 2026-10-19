const SIZE = 144;
const GRASS = "#3D8361";
const GRASS_DARK = "#346F53";
const DIRT_MOUND = "#8A5A2B";
const DIRT_RIM = "#6B4423";
const HOLE = "#1C1208";
const MOLE_BODY = "#B9834F";
const MOLE_BELLY = "#E7C08C";

/** Stream Deck wants image data as a data URI, not a bare `<svg>` string — plain SVG text
 * renders as a tiny placeholder dot instead of the actual artwork. */
function toDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function wrap(body: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect width="${SIZE}" height="${SIZE}" rx="18" fill="${GRASS}"/>
    <ellipse cx="72" cy="128" rx="70" ry="14" fill="${GRASS_DARK}" opacity="0.5"/>
    ${body}
  </svg>`;
  return toDataUri(svg);
}

/** The dirt mound + hole, always drawn last so anything "inside" it reads as buried. */
function moundAndHole(): string {
  return `
    <ellipse cx="72" cy="102" rx="46" ry="18" fill="${DIRT_MOUND}"/>
    <ellipse cx="72" cy="100" rx="38" ry="14" fill="${HOLE}"/>
  `;
}

function grassTufts(): string {
  return `
    <path d="M28 96 l4 -10 l4 10 Z" fill="${GRASS_DARK}"/>
    <path d="M116 96 l4 -10 l4 10 Z" fill="${GRASS_DARK}"/>
    <path d="M40 108 l3 -8 l3 8 Z" fill="${GRASS_DARK}"/>
    <path d="M104 108 l3 -8 l3 8 Z" fill="${GRASS_DARK}"/>
  `;
}

/** Idle grid cell: empty hole, nothing to tap yet. */
export function idleFrame(): string {
  return wrap(`${grassTufts()}${moundAndHole()}`);
}

/** Cell was tapped while NOT the active target: a little puff of dust, no mole. */
export function bonkFrame(): string {
  return wrap(`
    ${grassTufts()}
    <g opacity="0.7">
      <circle cx="56" cy="74" r="7" fill="#EEE6D6"/>
      <circle cx="72" cy="66" r="9" fill="#EEE6D6"/>
      <circle cx="90" cy="76" r="6" fill="#EEE6D6"/>
    </g>
    ${moundAndHole()}
  `);
}

/** Mole body (ears, face, paws) rendered mid-pop; `liftPx` is how far it has emerged. */
function moleBody(liftPx: number, blink: boolean): string {
  const cy = 112 - liftPx;
  const eye = blink
    ? `<path d="M60 ${(cy - 10).toFixed(1)} q4 4 8 0" stroke="#2A2112" stroke-width="2.5" fill="none" stroke-linecap="round"/>
       <path d="M76 ${(cy - 10).toFixed(1)} q4 4 8 0" stroke="#2A2112" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
    : `<circle cx="63" cy="${(cy - 9).toFixed(1)}" r="5.5" fill="#FFFFFF"/>
       <circle cx="81" cy="${(cy - 9).toFixed(1)}" r="5.5" fill="#FFFFFF"/>
       <circle cx="64.5" cy="${(cy - 9).toFixed(1)}" r="2.8" fill="#2A2112"/>
       <circle cx="82.5" cy="${(cy - 9).toFixed(1)}" r="2.8" fill="#2A2112"/>
       <circle cx="63.3" cy="${(cy - 10.3).toFixed(1)}" r="1" fill="#fff"/>
       <circle cx="81.3" cy="${(cy - 10.3).toFixed(1)}" r="1" fill="#fff"/>`;
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
    <path d="M66 ${(cy + 6).toFixed(1)} Q72 ${(cy + 11).toFixed(1)} 78 ${(cy + 6).toFixed(1)}"
      stroke="#6B4A2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  `;
}

/** Animated "critter" frames for the active target cell: pops up, holds, blinks. */
export function moleFrame(frame: number): string {
  const cycle = frame % 10;
  const liftPx = cycle < 4 ? [6, 16, 24, 28][cycle] : 28;
  const blink = cycle === 7;
  return wrap(`${grassTufts()}${moleBody(liftPx, blink)}${moundAndHole()}`);
}

/** One-shot "caught!" celebration shown briefly on the cell that was tapped correctly. */
export function popFrame(): string {
  return wrap(`
    <g stroke="#FFEE58" stroke-width="5" stroke-linecap="round">
      <line x1="72" y1="10" x2="72" y2="26"/>
      <line x1="30" y1="34" x2="42" y2="44"/>
      <line x1="114" y1="34" x2="102" y2="44"/>
    </g>
    ${moleBody(30, true)}
    ${moundAndHole()}
    <circle cx="108" cy="40" r="6" fill="#FFEE58"/>
    <circle cx="36" cy="46" r="4" fill="#FFEE58"/>
    <text x="112" y="100" font-family="Segoe UI, sans-serif" font-size="26" font-weight="800"
      text-anchor="middle" fill="#FFEE58" stroke="#5C3B00" stroke-width="1">+1</text>
  `);
}

const FIREWORK_PALETTE = ["#FF5252", "#FFD740", "#69F0AE", "#40C4FF", "#E040FB"];

/** Whole-grid celebration frame shown on every cell when the round objective is reached. */
export function celebrationFrame(seed: number): string {
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
