import { loadPlayers } from "../_shared/player/load-player.ts";
import { notifyPlayer } from "../_shared/player/notify-player.ts";

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

async function getFirstPlayer(roomId: string): Promise<Player> {
  const players = await loadPlayers(roomId) as Player[];

  if (!players.length) {
    throw new Error("No players found for room");
  }

  const sortedPlayers = [...players].sort((a, b) => {
    const seatA = a.seat_position ?? Number.MAX_SAFE_INTEGER;
    const seatB = b.seat_position ?? Number.MAX_SAFE_INTEGER;
    return seatA - seatB;
  });

  return sortedPlayers[0];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId } = await req.json();

    if (!roomId) {
      return new Response(
        JSON.stringify({ error: "roomId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const firstPlayer = await getFirstPlayer(roomId);

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

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
