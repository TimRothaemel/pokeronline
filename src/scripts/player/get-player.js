import supabase from "../supabase/initialize-supabase.js";

export async function getPlayer(playerId) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  if (error) {
    console.error("Error fetching player:", error);
    return null;
  }

  return data;
}
