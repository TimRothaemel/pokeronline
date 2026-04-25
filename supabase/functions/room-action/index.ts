import { createClient } from "jsr:@supabase/supabase-js@2";
import { evaluateBestHand, compareHands } from "../_shared/game/hand-evaluator.ts";
import {
  parseRoomGameState,
  serializeRoomGameState,
  type GameActionType,
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

type PlayerRow = {
  id: string;
  nickname: string;
  chips: number | null;
  cards: string | null;
  seat_position: number | null;
  is_bot?: boolean | null;
};

type RoomRow = {
  id: string;
  status: string | null;
  community_cards: string | null;
  min_blind: number | null;
};

class ActionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ActionError";
    this.status = status;
  }
}

async function loadRoom(roomId: string) {
  const { data, error } = await supabase
    .from("rooms")
    .select("id, status, community_cards, min_blind")
    .eq("id", roomId)
    .single();

  if (error || !data) {
    throw new ActionError(error?.message ?? "Room not found", 404);
  }

  return data as RoomRow;
}

async function loadPlayers(roomId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("id, nickname, chips, cards, seat_position, is_bot")
    .eq("room_id", roomId);

  if (error || !data) {
    throw new ActionError(error?.message ?? "Players not found", 404);
  }

  return data
    .filter((player) => player.seat_position !== null)
    .sort((left, right) => (left.seat_position ?? 0) - (right.seat_position ?? 0)) as PlayerRow[];
}

function rotate<T>(items: T[], startIndex: number) {
  return items.slice(startIndex).concat(items.slice(0, startIndex));
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function getActivePlayerIds(state: RoomGameState) {
  return state.actingOrder.filter((playerId) => !state.foldedPlayerIds.includes(playerId));
}

function getFirstPendingPlayer(state: RoomGameState) {
  return state.pendingPlayerIds.find(
    (playerId) =>
      !state.foldedPlayerIds.includes(playerId) &&
      !state.allInPlayerIds.includes(playerId),
  ) ?? null;
}

function createNextRoundQueue(state: RoomGameState, startPlayerId: string) {
  const activePlayers = getActivePlayerIds(state).filter(
    (playerId) => !state.allInPlayerIds.includes(playerId),
  );
  const startIndex = activePlayers.indexOf(startPlayerId);

  if (startIndex < 0) {
    return [];
  }

  return rotate(activePlayers, startIndex);
}

function advancePhase(state: RoomGameState) {
  const phaseOrder = ["preflop", "flop", "turn", "river", "showdown"] as const;
  const currentIndex = phaseOrder.indexOf(state.phase as (typeof phaseOrder)[number]);

  if (currentIndex < 0 || currentIndex === phaseOrder.length - 1) {
    return {
      ...state,
      phase: "showdown",
      currentPlayerId: null,
      pendingPlayerIds: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const nextPhase = phaseOrder[currentIndex + 1];
  const revealedCountByPhase = {
    flop: 3,
    turn: 4,
    river: 5,
    showdown: 5,
  } as const;
  const activePlayers = getActivePlayerIds(state);
  const firstPostFlopPlayer =
    activePlayers.find(
      (playerId) => state.actingOrder.indexOf(playerId) > state.dealerSeat,
    ) ?? activePlayers[0] ?? null;

  const resetBets = Object.fromEntries(
    Object.keys(state.playerBets).map((playerId) => [playerId, 0]),
  );
  const pendingPlayerIds = firstPostFlopPlayer
    ? createNextRoundQueue(state, firstPostFlopPlayer)
    : [];

  return {
    ...state,
    phase: nextPhase,
    currentBet: 0,
    playerBets: resetBets,
    pendingPlayerIds,
    currentPlayerId:
      pendingPlayerIds.find((playerId) => !state.allInPlayerIds.includes(playerId)) ?? null,
    revealedCount: revealedCountByPhase[nextPhase],
    updatedAt: new Date().toISOString(),
  };
}

function parseCards(serializedCards: string | null) {
  if (!serializedCards) {
    return [];
  }

  try {
    return JSON.parse(serializedCards);
  } catch (error) {
    console.error("Failed to parse cards", error);
    return [];
  }
}

async function updatePlayerChips(playerId: string, chips: number) {
  const { error } = await supabase
    .from("players")
    .update({ chips })
    .eq("id", playerId);

  if (error) {
    throw error;
  }
}

async function writeActionLog(
  roomId: string,
  playerId: string,
  actionType: string,
  amount: number,
  type = "response",
) {
  const { error } = await supabase.from("actions").insert({
    room_id: roomId,
    player_id: playerId,
    action_type: actionType,
    amount,
    type,
  });

  if (error) {
    throw error;
  }
}

async function saveState(roomId: string, state: RoomGameState) {
  const { error } = await supabase
    .from("rooms")
    .update({ status: serializeRoomGameState(state) })
    .eq("id", roomId);

  if (error) {
    throw error;
  }
}

async function finishHand(
  roomId: string,
  room: RoomRow,
  players: PlayerRow[],
  state: RoomGameState,
) {
  const activePlayers = players.filter((player) => !state.foldedPlayerIds.includes(player.id));

  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    const winnerChips = (winner.chips ?? 0) + state.pot;
    await updatePlayerChips(winner.id, winnerChips);

    const finishedState: RoomGameState = {
      ...state,
      phase: "finished",
      currentPlayerId: null,
      pendingPlayerIds: [],
      winnerIds: [winner.id],
      winningHand: "Fold Win",
      updatedAt: new Date().toISOString(),
    };

    await saveState(roomId, finishedState);
    await writeActionLog(roomId, winner.id, "win", state.pot, "system");
    return finishedState;
  }

  const communityCards = parseCards(room.community_cards);
  const evaluatedPlayers = activePlayers.map((player) => ({
    player,
    hand: evaluateBestHand([...parseCards(player.cards), ...communityCards]),
  }));

  let best = evaluatedPlayers[0];
  let winners = [best];

  for (const candidate of evaluatedPlayers.slice(1)) {
    const comparison = compareHands(candidate.hand, best.hand);

    if (comparison > 0) {
      best = candidate;
      winners = [candidate];
      continue;
    }

    if (comparison === 0) {
      winners.push(candidate);
    }
  }

  const splitPot = Math.floor(state.pot / winners.length);
  let remainder = state.pot % winners.length;

  for (const winner of winners) {
    const bonus = remainder > 0 ? 1 : 0;
    remainder -= bonus;
    await updatePlayerChips(winner.player.id, (winner.player.chips ?? 0) + splitPot + bonus);
    await writeActionLog(roomId, winner.player.id, "win", splitPot + bonus, "system");
  }

  const finishedState: RoomGameState = {
    ...state,
    phase: "finished",
    currentPlayerId: null,
    pendingPlayerIds: [],
    winnerIds: winners.map((winner) => winner.player.id),
    winningHand: best.hand.label,
    revealedCount: 5,
    updatedAt: new Date().toISOString(),
  };

  await saveState(roomId, finishedState);
  return finishedState;
}

function getBotDecision(player: PlayerRow, state: RoomGameState, minBlind: number) {
  const currentBet = state.playerBets[player.id] ?? 0;
  const callAmount = Math.max(0, state.currentBet - currentBet);
  const chips = player.chips ?? 0;

  if (callAmount === 0) {
    if (chips > minBlind * 2 && Math.random() > 0.7) {
      return { actionType: "raise" as const, amount: minBlind };
    }

    return { actionType: "check" as const, amount: 0 };
  }

  if (callAmount > chips * 0.35) {
    return { actionType: "fold" as const, amount: 0 };
  }

  if (chips > callAmount + minBlind * 2 && Math.random() > 0.8) {
    return { actionType: "raise" as const, amount: minBlind };
  }

  return { actionType: "call" as const, amount: 0 };
}

async function applyAction(
  roomId: string,
  room: RoomRow,
  players: PlayerRow[],
  state: RoomGameState,
  playerId: string,
  actionType: GameActionType,
  amount: number,
) {
  const player = players.find((entry) => entry.id === playerId);

  if (!player) {
    throw new ActionError("Player not found", 404);
  }

  if (state.phase === "finished") {
    throw new ActionError("Hand already finished", 409);
  }

  if (state.currentPlayerId !== playerId) {
    throw new ActionError("It is not this player's turn", 409);
  }

  const playerBet = state.playerBets[playerId] ?? 0;
  const callAmount = Math.max(0, state.currentBet - playerBet);
  const chips = player.chips ?? 0;

  let chipsToDeduct = 0;
  let nextCurrentBet = state.currentBet;
  let nextPending = state.pendingPlayerIds.filter((id) => id !== playerId);
  let nextFolded = [...state.foldedPlayerIds];
  let nextAllIn = [...state.allInPlayerIds];
  let playerActionAmount = 0;

  if (actionType === "check") {
    if (callAmount > 0) {
      throw new ActionError("Check is not allowed while a bet is open", 409);
    }
  }

  if (actionType === "call") {
    chipsToDeduct = Math.min(callAmount, chips);
    playerActionAmount = chipsToDeduct;
  }

  if (actionType === "raise") {
    if (amount <= 0) {
      throw new ActionError("Raise amount must be greater than zero", 400);
    }

    if (chips < callAmount + amount) {
      throw new ActionError("Not enough chips for this raise", 409);
    }

    chipsToDeduct = callAmount + amount;
    playerActionAmount = chipsToDeduct;
    nextCurrentBet = playerBet + chipsToDeduct;

    const activePlayers = getActivePlayerIds(state).filter((id) => id !== playerId);
    const raiserIndex = state.actingOrder.indexOf(playerId);
    const ordered = rotate(state.actingOrder, (raiserIndex + 1) % state.actingOrder.length);
    nextPending = ordered.filter(
      (id) =>
        activePlayers.includes(id) &&
        !state.allInPlayerIds.includes(id),
    );
  }

  if (actionType === "fold") {
    nextFolded = unique([...state.foldedPlayerIds, playerId]);
    playerActionAmount = 0;
  }

  const nextPlayerBet = playerBet + chipsToDeduct;
  const remainingChips = chips - chipsToDeduct;

  if (chipsToDeduct > 0) {
    await updatePlayerChips(playerId, remainingChips);
  }

  player.chips = remainingChips;

  if (remainingChips === 0 && !nextAllIn.includes(playerId) && actionType !== "fold") {
    nextAllIn = [...nextAllIn, playerId];
  }

  const nextState: RoomGameState = {
    ...state,
    currentBet: nextCurrentBet,
    pot: state.pot + chipsToDeduct,
    foldedPlayerIds: nextFolded,
    allInPlayerIds: unique(nextAllIn),
    playerBets: {
      ...state.playerBets,
      [playerId]: nextPlayerBet,
    },
    pendingPlayerIds: nextPending,
    lastAction: {
      playerId,
      type: actionType,
      amount: playerActionAmount,
    },
    updatedAt: new Date().toISOString(),
    currentPlayerId: null,
  };

  await writeActionLog(roomId, playerId, actionType, playerActionAmount);

  if (getActivePlayerIds(nextState).length === 1) {
    return finishHand(roomId, room, players, nextState);
  }

  const nextPlayerId = getFirstPendingPlayer(nextState);
  if (nextPlayerId) {
    const updatedState = {
      ...nextState,
      currentPlayerId: nextPlayerId,
    };

    await saveState(roomId, updatedState);
    return updatedState;
  }

  if (nextState.phase === "river") {
    return finishHand(roomId, room, players, {
      ...nextState,
      phase: "showdown",
      revealedCount: 5,
    });
  }

  const advancedState = advancePhase(nextState);
  await saveState(roomId, advancedState);
  return advancedState;
}

async function runBots(roomId: string) {
  let room = await loadRoom(roomId);
  let state = parseRoomGameState(room.status);

  while (state?.currentPlayerId) {
    const players = await loadPlayers(roomId);
    const currentPlayer = players.find((player) => player.id === state?.currentPlayerId);

    if (!currentPlayer?.is_bot) {
      break;
    }

    const decision = getBotDecision(currentPlayer, state, room.min_blind ?? 25);
    state = await applyAction(
      roomId,
      room,
      players,
      state,
      currentPlayer.id,
      decision.actionType,
      decision.amount,
    );
    room = await loadRoom(roomId);
    state = parseRoomGameState(room.status);
  }

  return state;
}

async function runAutoAction(roomId: string, room: RoomRow, state: RoomGameState) {
  const players = await loadPlayers(roomId);
  const currentPlayer = players.find((player) => player.id === state.currentPlayerId);

  if (!currentPlayer?.is_bot) {
    throw new ActionError("Current player is not a bot", 409);
  }

  const decision = getBotDecision(currentPlayer, state, room.min_blind ?? 25);
  return applyAction(
    roomId,
    room,
    players,
    state,
    currentPlayer.id,
    decision.actionType,
    decision.amount,
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId, playerId, actionType, amount = 0 } = await req.json();

    if (!roomId || !actionType) {
      return new Response(
        JSON.stringify({ ok: false, message: "roomId and actionType are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const room = await loadRoom(roomId);
    const state = parseRoomGameState(room.status);

    if (!state) {
      return new Response(
        JSON.stringify({ ok: false, message: "No active hand found" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (actionType !== "auto" && !playerId) {
      return new Response(
        JSON.stringify({ ok: false, message: "playerId is required for manual actions" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const nextState =
      actionType === "auto"
        ? await runAutoAction(roomId, room, state)
        : await applyAction(
            roomId,
            room,
            await loadPlayers(roomId),
            state,
            playerId,
            actionType,
            Number(amount),
          );

    const finalState = nextState.currentPlayerId ? await runBots(roomId) : nextState;

    return new Response(
      JSON.stringify({ ok: true, state: finalState ?? nextState }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("room-action failed", error);
    const message = error instanceof Error ? error.message : "room-action failed";
    const status = error instanceof ActionError ? error.status : 500;

    return new Response(JSON.stringify({ ok: false, message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
