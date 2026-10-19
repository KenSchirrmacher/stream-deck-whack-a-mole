import streamDeck, { type KeyAction } from "@elgato/streamdeck";
import { bonkFrame, celebrationFrame, idleFrame, moleFrame, popFrame } from "./render.js";

const WIN_SCORE = 15;
const MOLE_LIFETIME_MS = 5_000;
const ANIM_FRAME_MS = 160;
const CELEBRATION_MS = 3_000;
const APPEAR_DEBOUNCE_MS = 400;
const CAUGHT_PAUSE_MS = 450;
const BONK_PAUSE_MS = 200;

type DeviceState = {
  cells: Map<string, KeyAction>;
  activeCellId: string | null;
  score: number;
  started: boolean;
  celebrating: boolean;
  animFrame: number;
  animTimer: ReturnType<typeof setInterval> | null;
  roundTimeout: ReturnType<typeof setTimeout> | null;
  appearDebounce: ReturnType<typeof setTimeout> | null;
  celebrationEnd: ReturnType<typeof setTimeout> | null;
};

function freshState(): DeviceState {
  return {
    cells: new Map(),
    activeCellId: null,
    score: 0,
    started: false,
    celebrating: false,
    animFrame: 0,
    animTimer: null,
    roundTimeout: null,
    appearDebounce: null,
    celebrationEnd: null,
  };
}

class GameEngine {
  private devices = new Map<string, DeviceState>();

  registerCell(deviceId: string, action: KeyAction): void {
    const state = this.getOrCreate(deviceId);
    state.cells.set(action.id, action);
    void action.setImage(idleFrame()).catch((err) =>
      streamDeck.logger.error(`whack-a-mole: setImage(idle) failed for ${action.id}: ${String(err)}`),
    );
    this.scheduleStart(deviceId, state);
  }

  unregisterCell(deviceId: string, actionId: string): void {
    const state = this.devices.get(deviceId);
    if (!state) return;
    state.cells.delete(actionId);
    this.maybeTeardown(deviceId, state);
  }

  handleCellPress(deviceId: string, action: KeyAction): void {
    const state = this.devices.get(deviceId);
    if (!state) return;
    if (state.celebrating) return;

    if (action.id === state.activeCellId) {
      this.caughtCell(deviceId, state, action);
    } else {
      void action.setImage(bonkFrame());
      setTimeout(() => void action.setImage(idleFrame()), BONK_PAUSE_MS);
    }
  }

  private scheduleStart(deviceId: string, state: DeviceState): void {
    if (state.appearDebounce) clearTimeout(state.appearDebounce);
    state.appearDebounce = setTimeout(() => {
      state.appearDebounce = null;
      if (!state.started && state.cells.size > 0) {
        state.started = true;
        this.startRound(deviceId, state);
      }
    }, APPEAR_DEBOUNCE_MS);
  }

  private startRound(deviceId: string, state: DeviceState): void {
    this.clearRoundTimers(state);
    for (const cell of state.cells.values()) void cell.setImage(idleFrame());

    const ids = [...state.cells.keys()];
    if (ids.length === 0) return;
    let pick = ids[Math.floor(Math.random() * ids.length)];
    if (ids.length > 1) {
      while (pick === state.activeCellId) pick = ids[Math.floor(Math.random() * ids.length)];
    }
    state.activeCellId = pick;
    state.animFrame = 0;

    const active = state.cells.get(pick);
    if (!active) return;
    void active.setImage(moleFrame(state.animFrame)).catch((err) =>
      streamDeck.logger.error(`whack-a-mole: setImage(mole) failed for ${pick}: ${String(err)}`),
    );
    state.animTimer = setInterval(() => {
      state.animFrame += 1;
      void active.setImage(moleFrame(state.animFrame));
    }, ANIM_FRAME_MS);

    state.roundTimeout = setTimeout(() => this.startRound(deviceId, state), MOLE_LIFETIME_MS);
  }

  private caughtCell(deviceId: string, state: DeviceState, action: KeyAction): void {
    this.clearRoundTimers(state);
    state.activeCellId = null;
    state.score += 1;
    void action.setImage(popFrame());

    setTimeout(() => {
      if (state.score >= WIN_SCORE) {
        this.celebrate(deviceId, state);
      } else {
        this.startRound(deviceId, state);
      }
    }, CAUGHT_PAUSE_MS);
  }

  private celebrate(deviceId: string, state: DeviceState): void {
    this.clearRoundTimers(state);
    state.celebrating = true;
    state.score = 0;
    let seed = 0;

    state.animTimer = setInterval(() => {
      seed += 1;
      for (const cell of state.cells.values()) void cell.setImage(celebrationFrame(seed));
    }, ANIM_FRAME_MS);

    state.celebrationEnd = setTimeout(() => {
      if (state.animTimer) clearInterval(state.animTimer);
      state.animTimer = null;
      state.celebrating = false;
      this.startRound(deviceId, state);
    }, CELEBRATION_MS);
  }

  private clearRoundTimers(state: DeviceState): void {
    if (state.animTimer) clearInterval(state.animTimer);
    if (state.roundTimeout) clearTimeout(state.roundTimeout);
    if (state.celebrationEnd) clearTimeout(state.celebrationEnd);
    state.animTimer = null;
    state.roundTimeout = null;
    state.celebrationEnd = null;
  }

  private maybeTeardown(deviceId: string, state: DeviceState): void {
    if (state.cells.size > 0) return;
    if (state.appearDebounce) clearTimeout(state.appearDebounce);
    this.clearRoundTimers(state);
    this.devices.delete(deviceId);
  }

  private getOrCreate(deviceId: string): DeviceState {
    let state = this.devices.get(deviceId);
    if (!state) {
      state = freshState();
      this.devices.set(deviceId, state);
    }
    return state;
  }
}

export const gameEngine = new GameEngine();
