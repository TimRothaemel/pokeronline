import supabase from "../initialize-supabase.js";

export function subscribeToGame(roomId, handlers = {}) {
  if (!roomId) {
    console.error("subscribeToGame missing roomId", { roomId });
    return null;
  }

  const { onRoomUpdate, onAction } = handlers;
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
    .channel("game-" + roomId)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        onRoomUpdate?.(payload);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "actions",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onAction?.(payload);
      },
    )
    .subscribe((status) => {
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
