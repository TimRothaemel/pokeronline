import supabase from "../initialize-supabase.js";

export async function updateChips(playerId, newChipCount) {
  const { data, error } = await supabase
    .from("players")
    .update({ chips: newChipCount })
    .eq("id", playerId);

  if (error) {
    console.error("Error updating chips:", error);
    return null;
  }

  return data;
}