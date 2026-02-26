import { cards } from "./cards.js"; // import from cards.js

export let gameCards = cards;
export function getRandomCard() {
  // random card
  let randomNumber = getRandomNumber();
  let card = gameCards[randomNumber];
  deleteCards(randomNumber);
  return card;
}
function deleteCards(randomNumber) {
  // delete card from gameCards array
  gameCards.splice(randomNumber, 1);
}

function getRandomNumber() {
  // get random number between 0 and gameCards.length
  let randomNumber = Math.floor(Math.random() * gameCards.length);
  return randomNumber;
}
