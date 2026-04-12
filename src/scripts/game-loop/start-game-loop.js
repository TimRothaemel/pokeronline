import supabase from "../supabase/initialize-supabase.js";

export async function startGameLoop(roomId) {
  const { error } = await supabase.functions.invoke("game-loop", {
    body: { roomId }
  });
  if (error) {
    console.error("game-loop error",error);
    return null;
  }
}
