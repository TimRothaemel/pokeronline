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

const roomId = localStorage.getItem("room_id")
let gameState = await getGameState(roomId)
let currentPlayer = null;

if( await checkHost(roomId) && gameState === "waiting"){// if the user is host and startGame have not run jet
  console.log("The player is the host.")
  currentPlayer = await startGame();
}

if (!currentPlayer) {
  currentPlayer = JSON.parse(localStorage.getItem("current_player"));
}

if (currentPlayer) {
  updateCoins();
  revealPlayerCards();
}


let betBtn = document.getElementById("btn_checken"); // get reference to bet button
betBtn.addEventListener("click", () => {
  placeBet(25); // example bet amount, replace with dynamic value as needed
});

//small Blind
// message: "Player 1 posts small blind of 5 coins"
// mitgehen folden erhöhen

//revealFlops();
//revealTurn();
//revealRiver();
