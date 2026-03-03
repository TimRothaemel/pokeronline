export async function loadPlayers(roomId) {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);

  console.log(data);
}