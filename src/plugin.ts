import streamDeck from "@elgato/streamdeck";
import { MoleCellAction } from "./actions/mole-cell.js";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new MoleCellAction());

streamDeck.connect();
