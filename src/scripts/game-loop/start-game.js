import { cards } from "../cards/cards.js"; // import cards array from cards.js
import { gameCards, getRandomCard } from "../cards/random-cards.js"; // import gameCards array and getRandomCard function from random-cards.js
import { checkHost } from "../supabase/player/check-host.js";
import { loadPlayers } from "../supabase/player/load-player.js";
import supabase from "../supabase/initialize-supabase.js"; // import supabase client

const roomId = localStorage.getItem("room_id"); // get room_id from localStorage for later use



export let player = await loadPlayers(roomId)
export let playerCards = []
console.log(player); // log player data to console for debugging


export let flop1, flop2, flop3, turn, river; // export community cards for game-sequence.js

export async function startGame(){
if (await checkHost(roomId)) {    // createt seat positions
  const { data, error } = await supabase.functions.invoke('setup-room', {
    body: { roomId: roomId }
  });

  if (error) {
    console.error('Fehler:', error);
  }
  console.log('Antwort:', data);
}
gameCards.push(...cards); // reset gameCards array to original cards array to ensure a fresh deck for each game
}

