import supabase from "../initialize-supabase.js"; // import supabase client instance for database interactions

export async function loadPlayers(roomId) {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);
  return data;
}
