export async function notifyPlayer(roomId: string, playerId: string, message: string, amount: number, message) {
  const { data, error } = await supabase
    .from("actions")
    .insert({ room_id: roomId, 
              player_id: playerId,
              action_type: message,
              type: "request",
              amount: amount,
              message: message,
            });
  if (error) throw error;
  return data;
}