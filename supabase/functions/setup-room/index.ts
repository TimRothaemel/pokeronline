import { createClient } from "jsr:@supabase/supabase-js";// import createClient function from supabase-js library to create a supabase client instance

const corsHeaders = { // CORS headers to allow cross-origin requests
  "Access-Control-Allow-Origin": "*", // allow requests from any origin
  "Access-Control-Allow-Methods": "POST, OPTIONS", // allow POST and OPTIONS methods
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",// allow specific headers in requests
};

const supabase = createClient(// create a supabase client instance using environment variables for URL and service role key
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function loadPlayers(roomId: string) { // function to load players from the database based on the room ID
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId);

  if (error) throw error;
  console.log("Loaded players:", data);
  return data;
}

async function generateSeatPositions(roomId: string): Promise<void> { // function to generate random seat positions for players in a room
  const players = await loadPlayers(roomId);

  const seats = Array.from({ length: players.length }, (_, i) => i);
  for (let i = seats.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seats[i], seats[j]] = [seats[j], seats[i]];
  }

  for (let i = 0; i < players.length; i++) {
    const { error } = await supabase
      .from("players")
      .update({ seat_position: seats[i] })
      .eq("id", players[i].id);

    if (error) {
      console.error(`Fehler bei Spieler ${players[i].id}:`, error);
    }
    console.log(`Spieler ${players[i].id} erhält Sitzplatz ${seats[i]}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { roomId } = await req.json();

  if (!roomId) {
    return new Response(JSON.stringify({ error: "roomId is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await generateSeatPositions(roomId);

  return new Response(JSON.stringify({ success: true, message: "Room setup completed successfully" }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
