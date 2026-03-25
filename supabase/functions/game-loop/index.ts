import { createClient } from "jsr:@supabase/supabase-js@2";
import { notifyPlayer } from "../_shared/player/notify-player.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { roomId} = await req.json();
  if (!roomId) {
    return new Response(
      JSON.stringify({ error: "roomId is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
    let firstPlayer = await getFirstPlayer(roomId)
    await notifyPlayer(roomId, firstPlayer.id, "small_blind", 25, message);

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