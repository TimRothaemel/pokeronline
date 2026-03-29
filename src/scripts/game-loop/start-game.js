import { checkHost } from "../supabase/player/check-host.js";
import { getPlayerId } from "../supabase/player/get-player-id.js";
import supabase from "../supabase/initialize-supabase.js";
import { getGameState, setGameState } from "./gamestate.js";

export let playerCards = []

export let flop1, flop2, flop3, turn, river;

const GAME_STATE_POLL_INTERVAL_MS = 300;
const GAME_STATE_MAX_POLLS = 30;
const PLAYER_FETCH_POLL_INTERVAL_MS = 300;
const PLAYER_FETCH_MAX_POLLS = 20;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasCards(player) {
  if (!player?.cards) {
    return false;
  }

  try {
    const cards = JSON.parse(player.cards);
    return Array.isArray(cards) && cards.length >= 2;
  } catch (error) {
    console.error("Fehler beim Parsen von player.cards", error);
    return false;
  }
}

async function waitForStartedGame(roomId) {
  for (let attempt = 0; attempt < GAME_STATE_MAX_POLLS; attempt += 1) {
    const gameState = await getGameState(roomId);

    if (gameState === "started") {
      return true;
    }

    await wait(GAME_STATE_POLL_INTERVAL_MS);
  }

  return false;
}

async function loadCurrentPlayerUntilReady(playerId) {
  for (let attempt = 0; attempt < PLAYER_FETCH_MAX_POLLS; attempt += 1) {
    const { data: player, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (error) {
      console.error("Spieler nicht gefunden:", error);
      return null;
    }

    if (hasCards(player)) {
      return player;
    }

    await wait(PLAYER_FETCH_POLL_INTERVAL_MS);
  }

  return null;
}

export async function startGame() {
  const roomId = localStorage.getItem("room_id"); 
  const playerId = getPlayerId();
  
  if (!roomId) {
    console.error("room_id missing from localStorage")
    return null
  }

  if (await checkHost(roomId)) {
    const { error } = await supabase.functions.invoke("setup-room", {
      body: { roomId, userId: playerId },
    })

    if (error) {
      console.error("setup-room error:", error)
      return null
    }

    const state = await setGameState(roomId, "started")
    if (!state) {
      console.error("Failed to set game state")
      return null
    }
  }

  const gameStarted = await waitForStartedGame(roomId);
  if (!gameStarted) {
    console.error("Game did not reach 'started' state in time");
    return null;
  }

  const player = await loadCurrentPlayerUntilReady(playerId);
  if (!player) {
    console.error("Spielerdaten konnten nicht aktuell geladen werden");
    return null;
  }

  localStorage.setItem("current_player", JSON.stringify(player));
  console.log("[start-game.js] setzt current_player auf:", player)
  return player;
}
