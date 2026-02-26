import { player } from "../game-loop/start-game.js";

export function updateCoins() {
  //update coins display
  document.getElementById("player-coins").textContent = `Coins: ${player.coins}`;
}