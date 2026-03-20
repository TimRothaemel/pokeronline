console.log(JSON.parse(localStorage.getItem("current_player"))); // log current player data from localStorage for debugging
import {
  revealPlayerCards,
  revealFlops,
  revealTurn,
  revealRiver,
} from "../display/display-cards.js";
import { updateCoins } from "../display/display-coins.js";
import { placeBet } from "../actions/bet.js";

updateCoins();
revealPlayerCards();
//small Blind
// message: "Player 1 posts small blind of 5 coins"
// mitgehen folden erhöhen

//revealFlops();
//revealTurn();
//revealRiver();



