import supabase from "../initialize-supabase.js"; // import supabase client instance for database interactions

export async function loadPlayers(roomId) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);

  if (error) {
    console.error("Error loading players:", error);
    return [];
  }

  return data ?? [];
}
