import supabase from "../initialize-supabase.js";

export async function checkHost(roomId) {
  const playerId = localStorage.getItem("player_id");
  const { data: room, error } = await supabase
    .from("rooms")
    .select("host_player_id")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("Error checking host:", error);
    return false;
  }

  if (room) {
    return room.host_player_id === playerId;
  }

  return false;
}
