import supabase from "../supabase/initialize-supabase.js";
import { getPlayerId } from "../supabase/player/get-player-id.js";

export async function submitGameAction(actionType, amount = 0) {
  const roomId = localStorage.getItem("room_id");
  const playerId = getPlayerId();

  if (!roomId || !playerId) {
    return { ok: false, message: "Spielstatus unvollständig." };
  }

  const payload = {
    roomId,
    playerId,
    actionType,
    amount,
  };

  const { data, error } = await supabase.functions.invoke("room-action", {
    body: payload,
  });

  if (error) {
    if (error.context) {
      try {
        const responseBody = await error.context.json();
        return {
          ok: false,
          message: responseBody?.message ?? "Aktion konnte nicht ausgeführt werden.",
        };
      } catch (parseError) {
        console.error("Error parsing function error response:", parseError);
      }
    }

    console.error("Error submitting action:", error);
    return { ok: false, message: error.message };
  }

  return data ?? { ok: false, message: "Aktion konnte nicht ausgeführt werden." };
}
