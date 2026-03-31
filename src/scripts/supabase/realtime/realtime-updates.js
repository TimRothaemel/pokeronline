import supabase from "../initialize-supabase.js";

export function subscribeToRoom(roomId, playerId, onPayload) {
  if (!roomId || !playerId) {
    console.error("subscribeToRoom missing roomId or playerId", {
      roomId,
      playerId,
    });
    return null;
  }

  let resolveReady;
  let rejectReady;
  let readySettled = false;

  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  const settleReady = (fn, value) => {
    if (readySettled) {
      return;
    }

    readySettled = true;
    fn(value);
  };

  const channel = supabase
    .channel("room-" + roomId + "-" + playerId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "actions",
        filter: `player_id=eq.${playerId}`,
      },
      (payload) => {
        if (payload.new?.room_id !== roomId) {
          console.log("[realtime] ignored payload for other room:", {
            expectedRoomId: roomId,
            payloadRoomId: payload.new?.room_id,
            playerId,
          });
          return;
        }

        if (payload.new?.player_id !== playerId) {
          console.log("[realtime] ignored payload for other player:", {
            expectedPlayerId: playerId,
            payloadPlayerId: payload.new?.player_id,
            roomId,
          });
          return;
        }

        onPayload(payload);
      },
    )
    .subscribe((status) => {
      console.log("[realtime] room subscription status:", status, {
        roomId,
        playerId,
      });

      if (status === "SUBSCRIBED") {
        settleReady(resolveReady, status);
      }

      if (
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT" ||
        status === "CLOSED"
      ) {
        settleReady(
          rejectReady,
          new Error(`Realtime subscription failed with status ${status}`),
        );
      }
    });

  return { channel, ready };
}
