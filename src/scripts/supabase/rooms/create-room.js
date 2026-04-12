import supabase from "../initialize-supabase.js"; //import supabase client instance
import { generateNewPlayerId } from "../player/new-player-id.js";

export async function createRoom(roomName, password, nickname) {
  const playerId = await generateNewPlayerId();
  const { data, error } = await supabase.functions.invoke("room-access", {
    body: {
      mode: "create",
      roomName,
      password,
      nickname,
      playerId,
    },
  });

  if (error) {
    console.error("Error creating room:", error);
    return { ok: false, message: error.message };
  }

  if (!data?.ok) {
    return { ok: false, message: data?.message ?? "Raum konnte nicht erstellt werden." };
  }

  localStorage.setItem("room_id", data.room.id);
  localStorage.removeItem("current_room");
  localStorage.removeItem("current_player");

  return { ok: true, room: data.room };
}
