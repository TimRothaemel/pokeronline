import supabase from "../supabase/initialize-supabase.js";

export const WAITING_STATUS = "waiting";

export async function getGameState(roomId) {
  const { data, error } = await supabase
    .from("rooms")
    .select("status")
    .eq("id", roomId)
    .single();

  if (error) {
    console.error("Error fetching gameState", error);
    return null;
  }

  if (!data) {
    console.error("No room found for gameState", roomId);
    return null;
  }

  return data.status;
}

export function parseGameState(status) {
  if (!status || status === WAITING_STATUS) {
    return null;
  }

  try {
    return JSON.parse(status);
  } catch {
    return null;
  }
}

export function getVisibleCommunityCardCount(gameState) {
  if (!gameState) {
    return 0;
  }

  return gameState.revealedCount ?? 0;
}

export function isPlayersTurn(gameState, playerId) {
  return Boolean(gameState && playerId && gameState.currentPlayerId === playerId);
}

export async function setGameState(roomId, gameState) {
  if (!roomId) {
    console.error("setGameState missing roomId");
    return null;
  }

  const { data, error } = await supabase
    .from("rooms")
    .update({ status: gameState })
    .eq("id", roomId)
    .select("status")
    .single();

  if (error) {
    console.error("Error setting gameState", error);
    return null;
  }

  if (!data) {
    console.error("No room found or RLS blocked update", roomId);
    return null;
  }

  console.log("Game State gesetzt:", data.status);
  return data.status;
}
