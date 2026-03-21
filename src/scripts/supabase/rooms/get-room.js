import supabase from "../initialize-supabase.js";  

export async function getRoom(roomId) {
  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("Error fetching room:", error);
    return null;
  }

  return room;
}