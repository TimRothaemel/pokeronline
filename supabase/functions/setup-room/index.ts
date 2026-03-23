import { createClient } from "jsr:@supabase/supabase-js@2";
import { drawCards } from "../_shared/cards/random-cards.ts";
import { loadPlayers } from "../_shared/player/load-player.ts"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { roomId, userId } = await req.json();
  if (!roomId || !userId) {
    return new Response(
      JSON.stringify({ error: "roomId and userId are required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  await generateSeatPositions(roomId);
  await drawCards(roomId);

  const { data: currentPlayer, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Spieler nicht gefunden" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Room setup completed successfully",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});