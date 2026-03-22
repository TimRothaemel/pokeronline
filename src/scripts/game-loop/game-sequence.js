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