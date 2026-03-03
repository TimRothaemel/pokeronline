import supabase from "../initialize-supabase";

export async function loadPlayers(roomId) {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);
  return data;
}
