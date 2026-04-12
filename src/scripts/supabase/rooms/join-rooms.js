import { getPlayerId } from "../player/get-player-id.js";// import getPlayerId() function
import  supabase  from "../initialize-supabase.js"; //import supabase client instance 

export async function joinRoom(roomName, password, nickname) {
  const playerId = getPlayerId();
  const { data, error } = await supabase.functions.invoke("room-access", {
    body: {
      mode: "join",
      roomName,
      password,
      nickname,
      playerId,
    },
  });

  if (error) {
    console.error("Error joining room:", error);
    return { ok: false, message: error.message };
  }

  if (!data?.ok) {
    return { ok: false, message: data?.message ?? "Raum konnte nicht betreten werden." };
  }

  localStorage.setItem("room_id", data.room.id);
  localStorage.removeItem("current_room");
  localStorage.removeItem("current_player");
  return { ok: true, room: data.room };
}
