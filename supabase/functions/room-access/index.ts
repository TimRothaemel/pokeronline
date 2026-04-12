import { createClient } from "jsr:@supabase/supabase-js@2";

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

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createRoom(payload: {
  roomName: string;
  password: string;
  nickname: string;
  playerId: string;
}) {
  const passwordHash = await hashPassword(payload.password);
  const { data: room, error } = await supabase
    .from("rooms")
    .insert([
      {
        name: payload.roomName,
        password_hash: passwordHash,
        host_player_id: payload.playerId,
        min_blind: 50,
        status: "waiting",
      },
    ])
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, status: 409, message: "Dieser Raumname existiert bereits." };
    }

    throw error;
  }

  const { error: playerError } = await supabase.from("players").insert([
    {
      id: payload.playerId,
      nickname: payload.nickname,
      room_id: room.id,
      host: true,
    },
  ]);

  if (playerError) {
    await supabase.from("rooms").delete().eq("id", room.id);
    throw playerError;
  }

  return { ok: true, status: 200, room };
}

async function joinRoom(payload: {
  roomName: string;
  password: string;
  nickname: string;
  playerId: string;
}) {
  const passwordHash = await hashPassword(payload.password);
  const { data: room, error } = await supabase
    .from("rooms")
    .select("id, password_hash")
    .eq("name", payload.roomName)
    .single();

  if (error || !room) {
    return { ok: false, status: 404, message: "Raum nicht gefunden" };
  }

  if (room.password_hash !== passwordHash) {
    return { ok: false, status: 401, message: "Falsches Passwort" };
  }

  const { error: playerError } = await supabase.from("players").insert([
    {
      id: payload.playerId,
      nickname: payload.nickname,
      room_id: room.id,
    },
  ]);

  if (playerError) {
    throw playerError;
  }

  return { ok: true, status: 200, room };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mode, roomName, password, nickname, playerId } = await req.json();

    if (!mode || !roomName || !password || !nickname || !playerId) {
      return new Response(
        JSON.stringify({ ok: false, message: "mode, roomName, password, nickname and playerId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const result =
      mode === "create"
        ? await createRoom({ roomName, password, nickname, playerId })
        : await joinRoom({ roomName, password, nickname, playerId });

    return new Response(JSON.stringify(result), {
      status: result.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("room-access failed", error);
    const message = error instanceof Error ? error.message : "room-access failed";

    return new Response(JSON.stringify({ ok: false, message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
