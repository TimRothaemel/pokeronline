async function addBot(roomId) { //added Bot to game
  await supabase.from("players").insert([
    {
      id: crypto.randomUUID(),
      nickname: "PokerBot",
      room_id: roomId,
      is_bot: true
    }
  ]);
}