export async function generateSeatPositions(roomId: string): Promise<any[]> {
  const players = await loadPlayers(roomId);

  // Prüfen ob bereits Sitzpositionen vergeben sind
  const { data, error } = await supabase
    .from("players")
    .select("seat_position")
    .eq("room_id", roomId);

  if (error || !data) {
    console.error("Fehler beim Laden der Seats:", error);
    return players;
  }

  const alreadyAssigned = data.some((p) => p.seat_position !== null);
  if (alreadyAssigned) {
    console.log("Sitzpositionen bereits vergeben, überspringe...");
    return players;
  }

  // Zufällige Positionen generieren und zuweisen
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