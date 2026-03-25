import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function notifyPlayer(roomId: string, playerId: string, message: string, amount: number) {
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { roomId, playerId} = await req.json();
  if (!roomId || !playerId) {
    return new Response(
      JSON.stringify({ error: "roomId, playerId and message are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
    let firstPlayer = await getFirstPlayer(roomId)
    await notifyPlayer(roomId, firstPlayer.id, "small_blind", 25);

  if (error) {// throw error response
    return new Response(
      JSON.stringify({ error: "Game loop failed" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  return new Response(// throw success response
    JSON.stringify({
      success: true,
      message: "Game loop executed successfully",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});