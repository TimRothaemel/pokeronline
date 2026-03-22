import { checkHost } from "../supabase/player/check-host.js";
import { loadPlayers } from "../supabase/player/load-player.js";
import { getPlayerId } from "../supabase/player/get-player-id.js";
import supabase from "../supabase/initialize-supabase.js"; // import supabase client


const roomId = localStorage.getItem("room_id"); // get room_id from localStorage for later use

export let playerCards = []

export let flop1, flop2, flop3, turn, river; // export community cards for game-sequence.js

export async function startGame() {
  if (await checkHost(roomId)) {
    const { error } = await supabase.functions.invoke('setup-room', {
      body: { roomId: roomId, userId: getPlayerId() }
    });
    if (error) {
      console.error('Fehler beim Setup:', error);
      return null;
    }
  }

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", getPlayerId())
    .single();

    localStorage.setItem("current_player", JSON.stringify(player)); // save current player data to localStorage for use in game page
  if (error) {
    console.error("Spieler nicht gefunden:", error);
    return null;
  }
return player;
}