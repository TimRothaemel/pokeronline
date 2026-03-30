import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export async function notifyPlayer(
  roomId: string,
  playerId: string,
  actionType: string,
  amount: number,
) {
  const { data, error } = await supabase.from("actions").insert({
    room_id: roomId,
    player_id: playerId,
    action_type: actionType,
    type: "request",
    amount,
  });
  if (error) throw error;
  return data;
}
