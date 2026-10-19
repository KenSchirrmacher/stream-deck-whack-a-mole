import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { gameEngine } from "../game/engine.js";

@action({ UUID: "com.homedeck.whackamole.mole-cell" })
export class MoleCellAction extends SingletonAction {
  override onWillAppear(ev: WillAppearEvent): void {
    if (!ev.action.isKey()) return;
    gameEngine.registerCell(ev.action.device.id, ev.action);
  }

  override onWillDisappear(ev: WillDisappearEvent): void {
    gameEngine.unregisterCell(ev.action.device.id, ev.action.id);
  }

  override onKeyDown(ev: KeyDownEvent): void {
    if (!ev.action.isKey()) return;
    gameEngine.handleCellPress(ev.action.device.id, ev.action);
  }
}
