import { createClient } from "jsr:@supabase/supabase-js@2";
import { loadPlayers } from "./load-player.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export async function generateSeatPositions(roomId: string): Promise<any[]> {
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
    if (error) console.error(`Fehler bei Spieler ${players[i].id}:`, error);
  }
  return players;
}
