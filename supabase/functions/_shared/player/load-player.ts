export async function loadPlayers(roomId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);
  if (error) throw error;
  return data;
}