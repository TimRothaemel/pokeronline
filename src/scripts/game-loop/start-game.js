import { cards } from "../cards/cards.js"; // import cards array from cards.js
import { gameCards, getRandomCard } from "../cards/random-cards.js"; // import gameCards array and getRandomCard function from random-cards.js
import { checkHost } from "../supabase/player/check-host.js";
import { generateSeatPositions } from "../supabase/player/generate-seat-positions.js";
import { loadPlayers } from "../supabase/player/load-player.js";

const roomId = localStorage.getItem("room_id"); // get room_id from localStorage for later use



export let player = await loadPlayers(roomId)
export let playerCards = []
console.log(player); // log player data to console for debugging


export let flop1, flop2, flop3, turn, river; // export community cards for game-sequence.js

function drawPlayerCards() {
  player.cards.unshift(getRandomCard()); //random cards for player
  player.cards.unshift(getRandomCard());
}

function drawCommunityCards() {
  //random cards for community
  flop1 = getRandomCard();
  flop2 = getRandomCard();
  flop3 = getRandomCard();
  turn = getRandomCard();
  river = getRandomCard();
}

export function startGame() {
  //start game
  gameCards.push(...cards); // reset gameCards array to original cards array
  drawPlayerCards();
  drawCommunityCards();
}

if (await checkHost(roomId)) {// check if current user is host of the room
  generateSeatPositions(roomId); // generate seat positions for players in the room if current user is host
}
