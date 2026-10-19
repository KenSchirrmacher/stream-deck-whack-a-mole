# Whack-a-Mole for Stream Deck

A whack-a-mole game for your Stream Deck. A random key lights up with a bouncy little critter;
tapping it scores a point. Hit 15 points and every key on the page fires off a little fireworks
celebration, then it resets and keeps going.

All the key art is generated as plain SVG at runtime — no image files, no borrowed characters.

## Build

```
npm install
npm run build
npx @elgato/cli link com.homedeck.whackamole.sdPlugin
```

Dev watch: `npm run watch`

If `npm run build` fails on `sharp` (native binary), just re-run `npm install` once — sharp
downloads a prebuilt binary for your platform on install.

## Setting it up

This plugin ships one action, **Mole Cell** — it doesn't come with a prebuilt layout, because
Stream Deck plugins can't create pages/profiles on your behalf. You build the grid once, the same
way you'd lay out any other folder:

1. Create a folder (or a whole profile) on your Stream Deck and drag **Mole Cell** (under the
   "Whack-a-Mole" category) onto every key you want in the game. They're interchangeable — no
   per-key setup. All Mole Cell keys on the same page act as one shared game.
2. The round starts automatically a moment after the page becomes visible (it waits briefly for
   all the keys to finish appearing before picking the first target).

**Handing the deck to a kid without worry:** put the grid on its own folder page, and use Stream
Deck's built-in **Parent Folder** action (no plugin needed) on one key as the way out — mashing
random keys won't trigger it by accident the way a real button would. Launch the folder from your
main page with the built-in **Create Folder** / navigation action.

## Game internals

- `src/game/engine.ts` — one shared state machine per Stream Deck device: which cell is currently
  "hot", score, and the timers for animation/round advancement/celebration.
- `src/game/render.ts` — all the key art (idle burrow, bouncing critter, "+1" starburst, a
  few-color fireworks frame), generated at runtime.
- Tuning constants live at the top of `engine.ts`: `WIN_SCORE` (15), `MOLE_LIFETIME_MS` (how long
  an unpressed target waits before moving, 5s), `ANIM_FRAME_MS` (animation tick rate).

## License

MIT
