function subscribeToRoom(roomId) {
  supabase
    .channel("room-" + roomId)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${roomId}`
      },
      payload => {
        console.log("Spieler Update:", payload);
        loadPlayers(roomId);
      }
    )
    .subscribe();
}