import { loadPlayers } from "../_shared/player/load-player.ts";
import { notifyPlayer } from "../_shared/player/notify-player.ts";
import { getPlayerWithSeat } from "../_shared/player/get-player-with-seat.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Player = {
  id: string;
  seat_position: number | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId } = await req.json();

    if (!roomId) {
      return new Response(JSON.stringify({ error: "roomId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstPlayer = await getPlayerWithSeat(roomId, 0);    

    await notifyPlayer(roomId, firstPlayer.id, "small_blind", 25);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Game loop executed successfully",
        firstPlayerId: firstPlayer.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Game loop failed", error);

    const message = error instanceof Error ? error.message : "Game loop failed";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
