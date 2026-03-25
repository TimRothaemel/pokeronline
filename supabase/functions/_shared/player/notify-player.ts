export async function notifyPlayer(roomId: string, playerId: string, message: string, amount: number) {
  const { data, error } = await supabase
    .from("actions")
    .insert({ room_id: roomId, 
              player_id: playerId,
              action_type: message,
              type: "request",
              amount: amount,
            });
  if (error) throw error;
  return data;
}