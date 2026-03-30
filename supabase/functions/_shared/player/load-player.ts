import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export async function loadPlayers(roomId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);
  if (error) throw error;
  return data;
}
