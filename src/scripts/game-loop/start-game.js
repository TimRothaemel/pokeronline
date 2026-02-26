import { cards } from "../cards/cards.js"; // import cards array from cards.js
import { gameCards, getRandomCard } from "../cards/random-cards.js"; // import gameCards array and getRandomCard function from random-cards.js

let player = {
  name: "player",
  coins: 1000,
  cards: []
};

let apponent = {
  name: "opponent",
  coins: 1000,  
  cards: []
};

function drawPlayerCards() {
  player.cards.unshift(getRandomCard()); //random cards for player
  player.cards.unshift(getRandomCard());

  apponent.cards.unshift(getRandomCard()); //random cards for apponent
  apponent.cards.unshift(getRandomCard());
  console.log(player, apponent);
}

function drawCommunityCards() {
  //random cards for community
  let flop1 = getRandomCard();
  let flop2 = getRandomCard();
  let flop3 = getRandomCard();
  let turn = getRandomCard();
  let river = getRandomCard();
}

function spielStarten() {
  //start game
  gameCards.push(...cards); // reset gameCards array to original cards array
  drawPlayerCards();
  drawCommunityCards();
  revealFlops(); 
}

spielStarten(); // start game when page loads
