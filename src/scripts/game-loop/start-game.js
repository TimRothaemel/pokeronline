import { cards } from "../cards/cards.js"; // import cards array from cards.js
import { gameCards, getRandomCard } from "../cards/random-cards.js"; // import gameCards array and getRandomCard function from random-cards.js

// player apponent and community html elements
let playerCard1 = document.getElementById("playerKarte1");
let playerCard2 = document.getElementById("playerKarte2");
let opponentCard1 = document.getElementById("apponentKarte1");
let opponentCard2 = document.getElementById("apponentKarte2");
let communityCard1 = document.getElementById("flop1");
let communityCard2 = document.getElementById("flop2");
let communityCard3 = document.getElementById("flop3");
let communityCard4 = document.getElementById("turn");
let communityCard5 = document.getElementById("river");

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

function revealFlops() {
  //reveal flops
  communityCard1.src = `./assets/${flop1.name}.png`;
  communityCard2.src = `./assets/${flop2.name}.png`;
  communityCard3.src = `./assets/${flop3.name}.png`;
}

spielStarten(); // start game when page loads
