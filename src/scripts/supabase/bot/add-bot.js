import supabase from "../initialize-supabase.js";

export async function addBot(roomId) { //added Bot to game
  const { error } = await supabase.from("players").insert([
    {
      id: crypto.randomUUID(),
      nickname: "PokerBot",
      room_id: roomId,
      is_bot: true,
    },
  ]);

  if (error) {
    console.error("Error adding bot:", error);
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
