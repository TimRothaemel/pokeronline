import supabase from "../initialize-supabase";

export async function loadPlayers(roomId) {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);
    console.log("Players loaded from Supabase:", data);
    console.log("Room ID for loading players:", roomId);
  return data;
}