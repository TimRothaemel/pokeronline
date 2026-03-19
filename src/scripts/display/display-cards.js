import {
  flop1,
  flop2,
  flop3,
  river,
  turn,
} from "../game-loop/start-game.js";

export function revealCard(id, src) {
  //reveal card by element and src
  document.getElementById(id).innerHTML = `<img src="${src}" alt="card">`;
}

let playerCard1 = "playercard1";
let playerCard2 = "playercard2";
let communityCard1 = "flop1";
let communityCard2 = "flop2";
let communityCard3 = "flop3";
let communityCard4 = "turn";
let communityCard5 = "river";

export function revealPlayerCards() {
  //reveal player cards
  revealCard(
    playerCard1,
    `./src/assets/cards/${player.cards[0].color}/${player.cards[0].number}.png`,
  );
  revealCard(
    playerCard2,
    `./src/assets/cards/${player.cards[1].color}/${player.cards[1].number}.png`,
  );
}

export function revealFlops() {
  //reveal flops
  revealCard(communityCard1, `./src/assets/cards/${flop1.name}.png`);
  revealCard(communityCard2, `./src/assets/cards/${flop2.name}.png`);
  revealCard(communityCard3, `./src/assets/cards/${flop3.name}.png`);
}
export function revealTurn() {
  //reveal turn
  revealCard(communityCard4, `./src/assets/cards/${turn.name}.png`);
}
export function revealRiver() {
  //reveal river
  revealCard(communityCard5, `./src/assets/cards/${river.name}.png`);
}
