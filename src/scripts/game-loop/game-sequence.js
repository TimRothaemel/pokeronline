import { revealCard } from "../display/display-cards.js";
import { player,flop1, flop2, flop3, river, turn } from "../game-loop/start-game.js";

let playerCard1 = document.getElementById("spielerKarte1");
let playerCard2 = document.getElementById("spielerKarte2");
let communityCard1 = document.getElementById("flop1");
let communityCard2 = document.getElementById("flop2");
let communityCard3 = document.getElementById("flop3");
let communityCard4 = document.getElementById("turn");
let communityCard5 = document.getElementById("river");

function revealPlayerCards() {
    //reveal player cards
    revealCard(playerCard1, `./src/assets/cards/${player.cards[0].color}/${player.cards[0].number}.png`);
    revealCard(playerCard2, `./src/assets/cards/${player.cards[1].color}/${player.cards[1].number}.png`);
}

function revealFlops() {
  //reveal flops
  revealCard(communityCard1, `./src/assets/cards/${flop1.name}.png`);
  revealCard(communityCard2, `./src/assets/cards/${flop2.name}.png`);
  revealCard(communityCard3, `./src/assets/cards/${flop3.name}.png`);
}
function revealTurn() {
  //reveal turn
  revealCard(communityCard4, `./src/assets/cards/${turn.name}.png`);
}
function revealRiver() {
  //reveal river
  revealCard(communityCard5, `./src/assets/cards/${river.name}.png`);
}


    revealPlayerCards();
    revealFlops();
    revealTurn();
    revealRiver();
