import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  parseRoomGameState,
  serializeRoomGameState,
  type RoomGameState,
} from "../_shared/game/room-state.ts";

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

const DEFAULT_CHIPS = 5000;

type Player = {
  id: string;
  chips: number | null;
  seat_position: number | null;
  is_bot?: boolean | null;
};

function rotate<T>(items: T[], startIndex: number) {
  return items.slice(startIndex).concat(items.slice(0, startIndex));
}

function getNextIndex(length: number, startIndex: number, offset = 1) {
  return (startIndex + offset) % length;
}

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

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, min_blind, status")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return new Response(JSON.stringify({ error: roomError?.message ?? "Room not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id, chips, seat_position, is_bot")
      .eq("room_id", roomId);

    if (playersError || !players) {
      return new Response(JSON.stringify({ error: playersError?.message ?? "Players not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderedPlayers = [...players]
      .filter((player) => player.seat_position !== null)
      .sort((left, right) => (left.seat_position ?? 0) - (right.seat_position ?? 0)) as Player[];

    if (orderedPlayers.length < 2) {
      return new Response(JSON.stringify({ error: "At least two players are required" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const player of orderedPlayers) {
      if (player.chips === null) {
        const { error } = await supabase
          .from("players")
          .update({ chips: DEFAULT_CHIPS })
          .eq("id", player.id);

        if (error) {
          throw error;
        }

        player.chips = DEFAULT_CHIPS;
      }
    }

    const minBlind = room.min_blind ?? 50;
    const smallBlind = Math.max(25, Math.floor(minBlind / 2));
    const bigBlind = minBlind;
    const orderedIds = orderedPlayers.map((player) => player.id);
    const playerBets = Object.fromEntries(orderedIds.map((id) => [id, 0]));
    const totalContributions = Object.fromEntries(orderedIds.map((id) => [id, 0]));
    const previousState = parseRoomGameState(room.status);

    let dealerIndex = 0;
    if (previousState?.dealerPlayerId) {
      const previousDealerIndex = orderedIds.indexOf(previousState.dealerPlayerId);
      if (previousDealerIndex >= 0) {
        dealerIndex = getNextIndex(orderedPlayers.length, previousDealerIndex);
      }
    }

    const smallBlindIndex =
      orderedPlayers.length === 2
        ? dealerIndex
        : getNextIndex(orderedPlayers.length, dealerIndex);
    const bigBlindIndex = getNextIndex(orderedPlayers.length, smallBlindIndex);

    const smallBlindPlayer = orderedPlayers[smallBlindIndex];
    const bigBlindPlayer = orderedPlayers[bigBlindIndex];

    const paidSmallBlind = Math.min(smallBlindPlayer.chips ?? 0, smallBlind);
    const paidBigBlind = Math.min(bigBlindPlayer.chips ?? 0, bigBlind);

    await supabase
      .from("players")
      .update({ chips: (smallBlindPlayer.chips ?? 0) - paidSmallBlind })
      .eq("id", smallBlindPlayer.id);

    await supabase
      .from("players")
      .update({ chips: (bigBlindPlayer.chips ?? 0) - paidBigBlind })
      .eq("id", bigBlindPlayer.id);

    playerBets[smallBlindPlayer.id] = paidSmallBlind;
    playerBets[bigBlindPlayer.id] = paidBigBlind;
    totalContributions[smallBlindPlayer.id] = paidSmallBlind;
    totalContributions[bigBlindPlayer.id] = paidBigBlind;

    const allInPlayerIds = orderedPlayers
      .filter((player) => {
        if (player.id === smallBlindPlayer.id) {
          return (player.chips ?? 0) - paidSmallBlind <= 0;
        }

        if (player.id === bigBlindPlayer.id) {
          return (player.chips ?? 0) - paidBigBlind <= 0;
        }

        return (player.chips ?? 0) <= 0;
      })
      .map((player) => player.id);

    const preflopStartIndex =
      orderedPlayers.length === 2
        ? dealerIndex
        : getNextIndex(orderedPlayers.length, bigBlindIndex);
    const pendingPlayerIds = rotate(orderedIds, preflopStartIndex).filter(
      (playerId) => !allInPlayerIds.includes(playerId),
    );

    const state: RoomGameState = {
      version: 1,
      phase: "preflop",
      dealerPlayerId: orderedPlayers[dealerIndex].id,
      dealerSeat: orderedPlayers[dealerIndex].seat_position ?? dealerIndex,
      smallBlind,
      bigBlind,
      currentBet: paidBigBlind,
      pot: paidSmallBlind + paidBigBlind,
      currentPlayerId: pendingPlayerIds[0] ?? null,
      actingOrder: orderedIds,
      pendingPlayerIds,
      foldedPlayerIds: [],
      allInPlayerIds,
      playerBets,
      totalContributions,
      revealedCount: 0,
      winnerIds: [],
      winningHand: null,
      lastAction: null,
      updatedAt: new Date().toISOString(),
    };

    const { error: statusError } = await supabase
      .from("rooms")
      .update({ status: serializeRoomGameState(state) })
      .eq("id", roomId);

    if (statusError) {
      throw statusError;
    }

    await supabase.from("actions").insert([
      {
        room_id: roomId,
        player_id: smallBlindPlayer.id,
        action_type: "small_blind",
        amount: paidSmallBlind,
        type: "system",
      },
      {
        room_id: roomId,
        player_id: bigBlindPlayer.id,
        action_type: "big_blind",
        amount: paidBigBlind,
        type: "system",
      },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Game loop executed successfully",
        currentPlayerId: state.currentPlayerId,
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
