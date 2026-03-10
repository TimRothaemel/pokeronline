import { checkHost } from "../supabase/player/check-host.js";
import { loadPlayers } from "../supabase/player/load-player.js";
import { getPlayerId } from "../supabase/player/get-player-id.js";
import supabase from "../supabase/initialize-supabase.js"; // import supabase client

const roomId = localStorage.getItem("room_id"); // get room_id from localStorage for later use



export let player = await loadPlayers(roomId)
export let playerCards = []
console.log(player); // log player data to console for debugging


export let flop1, flop2, flop3, turn, river; // export community cards for game-sequence.js

export async function startGame(){
if (await checkHost(roomId)) {    // createt seat positions
  const { data, error } = await supabase.functions.invoke('setup-room', {
    body: { roomId: roomId, userId: getPlayerId() }
  });

  if (error) {
    console.error('Fehler:', error);
  }
  console.log('Antwort:', data);
}
}

