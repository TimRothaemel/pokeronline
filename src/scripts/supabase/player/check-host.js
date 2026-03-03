import supabase from "../initialize-supabase.js";
let playerId = localStorage.getItem("player_id"); // get player_id from local storage for later use

export async function checkHost(roomId) {
const { data: room, error } = await supabase
  .from("rooms")
  .select("host_player_id")
  .eq("id", roomId)
  .single();

  if (room) {
  return room.host_player_id === playerId;
} else {
  return false;
}
}

