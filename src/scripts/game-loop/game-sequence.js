console.log(JSON.parse(localStorage.getItem("current_player"))); // log current player data from localStorage for debugging
import {
  revealPlayerCards,
  revealFlops,
  revealTurn,
  revealRiver,
} from "../display/display-cards.js";
import { updateCoins } from "../display/display-coins.js";

revealPlayerCards();
//revealFlops();
//revealTurn();
//revealRiver();
//updateCoins();


