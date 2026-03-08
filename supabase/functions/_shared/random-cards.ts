import { createClient } from "jsr:@supabase/supabase-js@2";// import createClient function from supabase-js library to create a supabase client instance
import { cards } from "./card.ts";

const supabase = createClient(// create a supabase client instance using environment variables for URL and service role key
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

let gameCards 

resetGameCards(); // Initialize gameCards with the full deck of cards

function getRandomCard() {
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

function drawPlayerCards(playerId: string) {
  const player = await loadPlayer(playerId);
  player.cards.unshift(getRandomCard()); //random cards for player
  player.cards.unshift(getRandomCard());
  const { error } = await supabase
    .from("players")
    .update({ cards: player.cards })
    .eq("id", player.id);
    console.log("Updated player cards in database:", player.cards);
}

function drawCommunityCards(roomId: string) {
  //random cards for community
  flop1 = getRandomCard();
  flop2 = getRandomCard();
  flop3 = getRandomCard();
  turn = getRandomCard();
  river = getRandomCard();
  const { error } = await supabase
    .from("rooms")
    .update({community_cards: [flop1, flop2, flop3, turn, river]})
    .eq("id", roomId); // Update the room's community cards in the database});
    console.log("Updated community cards in database:", [flop1, flop2, flop3, turn, river]);
}

function resetGameCards() {
  // reset gameCards array to original cards array
  gameCards = [...cards];
}

export function drawCardy(roomId: string, playerId: string) {
    drawPlayerCards(playerId);
    drawCommunityCards(roomId);
    console.log("Player Cards:", player.cards);
    console.log("Community Cards:", flop1, flop2, flop3, turn, river);
}
