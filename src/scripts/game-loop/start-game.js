import { checkHost } from "../supabase/player/check-host.js";
import { getPlayerId } from "../supabase/player/get-player-id.js";
import supabase from "../supabase/initialize-supabase.js";
import { displayMassage } from "../display/display-message.js";
import { setGameState } from "./gamestate.js";

export let playerCards = []

export let flop1, flop2, flop3, turn, river;

export async function startGame() {
  const roomId = localStorage.getItem("room_id"); 
  
  if (!roomId) {
    console.error("room_id missing from localStorage")
    return null
  }

  if (await checkHost(roomId)) {
    const { error } = await supabase.functions.invoke("setup-room", {
      body: { roomId, userId: getPlayerId() },
    })

    if (error) {
      console.error("setup-room error:", error)
      return null
    }

    const state = await setGameState(roomId, "started")
    if (!state) {
      console.error("Failed to set game state")
      return null
    }
  }

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", getPlayerId())
    .single();

  if (error) {
    console.error("Spieler nicht gefunden:", error);
    return null;
  }

  localStorage.setItem("current_player", JSON.stringify(player));
  return player;
}