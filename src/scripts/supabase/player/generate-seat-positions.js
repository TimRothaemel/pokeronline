import { loadPlayers } from "./load-player";
import supabase from "../initialize-supabase.js";

export async function generateSeatPositions(roomId) {
  const players = await loadPlayers(roomId);

  const seats = Array.from({ length: players.length }, (_, i) => i);
  for (let i = seats.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seats[i], seats[j]] = [seats[j], seats[i]];
  }

  for (let i = 0; i < players.length; i++) {
    const { error } = await supabase
      .from("players")
      .update({ seat_position: seats[i] })
      .eq("id", players[i].id);

    if (error) {
      console.error(`Fehler bei Spieler ${players[i].id}:`, error);
    }
  }
}