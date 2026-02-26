import { cards } from "../cards/cards.js"; // import cards array from cards.js
import { gameCards, getRandomCard } from "../cards/random-cards.js"; // import gameCards array and getRandomCard function from random-cards.js

export let player = {
  name: "player",
  coins: 1000,
  cards: []
};

let apponent = {
  name: "opponent",
  coins: 1000,  
  cards: []
};

export let flop1, flop2, flop3, turn, river; // export community cards for game-sequence.js

function drawPlayerCards() {
  player.cards.unshift(getRandomCard()); //random cards for player
  player.cards.unshift(getRandomCard());

  apponent.cards.unshift(getRandomCard()); //random cards for apponent
  apponent.cards.unshift(getRandomCard());
  console.log(player, apponent);
}

function drawCommunityCards() {
  //random cards for community
  flop1 = getRandomCard();
  flop2 = getRandomCard();
  flop3 = getRandomCard();
  turn = getRandomCard();
  river = getRandomCard();
}

function spielStarten() {
  //start game
  gameCards.push(...cards); // reset gameCards array to original cards array
  drawPlayerCards();
  drawCommunityCards();
}

spielStarten(); // start game when page loads
