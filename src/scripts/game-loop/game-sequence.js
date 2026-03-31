import {
  revealPlayerCards,
  revealFlops,
  revealTurn,
  revealRiver,
} from "../display/display-cards.js";
import { updateCoins } from "../display/display-coins.js";
import { placeBet } from "../actions/bet.js";
import { startGame } from "./start-game.js";
import { checkHost } from "../supabase/player/check-host.js";
import { startGameLoop } from "./start-game-loop.js";
import { getGameState } from "./gamestate.js";
import { subscribeToRoom } from "../supabase/realtime/realtime-updates.js";
import { getPlayerId } from "../supabase/player/get-player-id.js";

const roomId = localStorage.getItem("room_id");
const playerId = getPlayerId();
let gameState = await getGameState(roomId);
let currentPlayer = JSON.parse(localStorage.getItem("current_player") ?? "null");


  subscribeToRoom(roomId, playerId, (payload) => {
    console.log("[realtime] action payload:", payload.new);
  });


if ((await checkHost(roomId)) && gameState !== "waiting") {
  // if the user is host and startGame have not run jet
  console.log("The player is the host.");
  currentPlayer = await startGame();
  await startGameLoop(roomId);
}

if (!currentPlayer) {
  currentPlayer = JSON.parse(localStorage.getItem("current_player") ?? "null");
}

if (currentPlayer) {
  updateCoins();
  revealPlayerCards();
}

let betBtn = document.getElementById("btn_checken"); // get reference to bet button
betBtn.addEventListener("click", () => {
  placeBet(25); // example bet amount, replace with dynamic value as needed
});

