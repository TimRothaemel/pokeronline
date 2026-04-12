type PlayerWithSeat = {
  id: string;
  seat_position: number | null;
};

export async function getPlayerWithSeat(
  roomId: string,
  seat: number,
): Promise<PlayerWithSeat> {
  const { createClient } = await import("jsr:@supabase/supabase-js@2");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("players")
    .select("id, seat_position")
    .eq("room_id", roomId)
    .eq("seat_position", seat)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch first player: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      `No player with seat_position ${seat} found in room ${roomId}`,
    );
  }

  return data;
}
