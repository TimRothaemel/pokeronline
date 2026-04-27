import {
  revealPlayerCards,
  revealCommunityCards,
} from "../display/display-cards.js";
import { updateCoins } from "../display/display-coins.js";
import { displayMessage, displayTurnMessage } from "../display/display-message.js";
import { submitGameAction } from "../actions/bet.js";
import { startGame } from "./start-game.js";
import { checkHost } from "../supabase/player/check-host.js";
import { startGameLoop } from "./start-game-loop.js";
import {
  WAITING_STATUS,
  getGameState,
  getVisibleCommunityCardCount,
  isPlayersTurn,
  parseGameState,
} from "./gamestate.js";
import { subscribeToGame } from "../supabase/realtime/realtime-updates.js";
import { getPlayerId } from "../supabase/player/get-player-id.js";
import { getPlayer } from "../player/get-player.js";
import { getRoom } from "../supabase/rooms/get-room.js";
import { loadPlayers } from "../supabase/player/load-player.js";

const roomId = localStorage.getItem("room_id");
const playerId = getPlayerId();
let currentPlayer = JSON.parse(localStorage.getItem("current_player") ?? "null");
let currentRoom = JSON.parse(localStorage.getItem("current_room") ?? "null");
let gameState = null;
let roomPlayers = [];
let actionFeedEntries = [];
let startTriggered = false;
let actionInFlight = false;
let botActionInFlight = false;

async function hydrateCurrentState() {
  const [player, room, players] = await Promise.all([
    getPlayer(playerId),
    getRoom(roomId),
    loadPlayers(roomId),
  ]);

  if (player) {
    currentPlayer = player;
    localStorage.setItem("current_player", JSON.stringify(player));
  }

  if (room) {
    currentRoom = room;
    localStorage.setItem("current_room", JSON.stringify(room));
    gameState = parseGameState(room.status);
  }

  roomPlayers = players;
}

function getPlayerName(targetPlayerId) {
  if (!targetPlayerId) {
    return "Unknown";
  }

  const player = roomPlayers.find((entry) => entry.id === targetPlayerId);
  return player?.nickname ?? targetPlayerId.slice(0, 8);
}

function formatActionEntry({ playerId: actorId, actionType, amount }) {
  const actor = getPlayerName(actorId);

  if (actionType === "small_blind") {
    return `${actor} posts the small blind of ${amount}.`;
  }

  if (actionType === "big_blind") {
    return `${actor} posts the big blind of ${amount}.`;
  }

  if (actionType === "win") {
    return `${actor} wins ${amount}.`;
  }

  if (actionType === "raise") {
    return `${actor} raises and puts in ${amount}.`;
  }

  if (actionType === "call") {
    return `${actor} calls ${amount}.`;
  }

  if (actionType === "check") {
    return `${actor} checks.`;
  }

  if (actionType === "fold") {
    return `${actor} folds.`;
  }

  return `${actor} acts.`;
}

function pushActionEntry(entry) {
  actionFeedEntries = [formatActionEntry(entry), ...actionFeedEntries].slice(0, 10);
}

function renderActionFeed() {
  const feed = document.getElementById("action-feed");
  if (!feed) {
    return;
  }

  if (actionFeedEntries.length === 0) {
    feed.innerHTML = '<div class="action-entry is-system">No actions yet in this hand.</div>';
    return;
  }

  feed.innerHTML = actionFeedEntries
    .map((message) => `<div class="action-entry">${message}</div>`)
    .join("");
}

function renderPlayerStatusBoard() {
  const list = document.getElementById("player-status-list");
  if (!list) {
    return;
  }

  if (roomPlayers.length === 0) {
    list.innerHTML = "";
    return;
  }

  list.innerHTML = roomPlayers
    .map((player) => {
      const isCurrentTurn = gameState?.currentPlayerId === player.id;
      const isFolded = gameState?.foldedPlayerIds?.includes(player.id);
      const isAllIn = gameState?.allInPlayerIds?.includes(player.id);
      const isDealer = gameState?.dealerPlayerId === player.id;
      const contribution = gameState?.playerBets?.[player.id] ?? 0;
      const tags = [];

      if (isDealer) {
        tags.push('<span class="player-tag is-dealer">Dealer</span>');
      }

      if (isCurrentTurn) {
        tags.push('<span class="player-tag is-turn">Acting</span>');
      }

      if (isFolded) {
        tags.push('<span class="player-tag is-folded">Folded</span>');
      }

      if (isAllIn) {
        tags.push('<span class="player-tag is-all-in">All-in</span>');
      }

      if (player.is_bot) {
        tags.push('<span class="player-tag is-bot">Bot</span>');
      }

      return `
        <div class="player-status-row ${isCurrentTurn ? "is-current-turn" : ""} ${isFolded ? "is-folded" : ""} ${isAllIn ? "is-all-in" : ""}">
          <div class="player-status-main">
            <span class="player-name">${player.nickname ?? "Player"}</span>
            <span class="player-meta">Seat ${player.seat_position ?? "-"} · Chips ${player.chips ?? 0} · In pot ${contribution}</span>
          </div>
          <div class="player-tags">${tags.join("")}</div>
        </div>
      `;
    })
    .join("");
}

async function maybeRunBotTurn() {
  if (actionInFlight || botActionInFlight || !gameState?.currentPlayerId) {
    return;
  }

  const isHost = await checkHost(roomId);
  if (!isHost) {
    return;
  }

  const currentTurnPlayer = roomPlayers.find((player) => player.id === gameState.currentPlayerId);
  if (!currentTurnPlayer?.is_bot) {
    return;
  }

  botActionInFlight = true;

  try {
    const result = await submitGameAction("auto");
    await hydrateCurrentState();

    if (!result?.ok) {
      displayMessage(result?.message ?? "Bot-Aktion konnte nicht ausgeführt werden.");
    }
  } finally {
    botActionInFlight = false;
    renderGameState();
  }
}

function updateMeta(game) {
  const phaseLabel = document.getElementById("phase-label");
  const potValue = document.getElementById("pot-value");
  const currentBetValue = document.getElementById("current-bet-value");

  if (phaseLabel) {
    phaseLabel.textContent = game?.phase ?? WAITING_STATUS;
  }

  if (potValue) {
    potValue.textContent = `${game?.pot ?? 0}`;
  }

  if (currentBetValue) {
    currentBetValue.textContent = `${game?.currentBet ?? 0}`;
  }
}

function updateActionButtons(game) {
  const isTurn = isPlayersTurn(game, playerId);
  const currentRoundBet = game?.playerBets?.[playerId] ?? 0;
  const callAmount = Math.max(0, (game?.currentBet ?? 0) - currentRoundBet);
  const isFinished =
    !game ||
    game.phase === "finished" ||
    game.phase === WAITING_STATUS ||
    actionInFlight;

  const checkButton = document.getElementById("btn_checken");
  const callButton = document.getElementById("btn_mitgehen");
  const raiseButton = document.getElementById("btn_erhoehen");
  const foldButton = document.getElementById("btn_passen");
  const nextHandButton = document.getElementById("btn_neue_runde");
  const raiseInput = document.getElementById("raise-amount");

  if (checkButton) {
    checkButton.disabled = !isTurn || isFinished || callAmount > 0;
  }

  if (callButton) {
    callButton.disabled = !isTurn || isFinished || callAmount === 0;
    callButton.textContent = callAmount > 0 ? `Call ${callAmount}` : "Call";
  }

  if (raiseButton) {
    raiseButton.disabled = !isTurn || isFinished;
  }

  if (foldButton) {
    foldButton.disabled = !isTurn || isFinished;
  }

  if (nextHandButton) {
    nextHandButton.disabled = game?.phase !== "finished";
  }

  if (raiseInput) {
    raiseInput.disabled = !isTurn || isFinished;
    raiseInput.min = `${game?.bigBlind ?? 25}`;
    raiseInput.step = `${game?.bigBlind ?? 25}`;
  }
}

function getTurnMessage() {
  if (!currentRoom) {
    return "Room wird geladen ...";
  }

  if (!gameState) {
    return "Warte auf den Host, um die Runde zu starten.";
  }

  if (gameState.phase === "finished") {
    return gameState.winnerIds?.includes(playerId)
      ? "Du hast diese Hand gewonnen."
      : "Die Hand ist beendet.";
  }

  if (gameState.currentPlayerId === playerId) {
    return actionInFlight ? "Aktion wird gesendet ..." : "Du bist am Zug.";
  }

  return `Warte auf ${getPlayerName(gameState.currentPlayerId)}.`;
}

function getPrimaryMessage() {
  if (!gameState) {
    return "";
  }

  if (gameState.phase === "preflop") {
    return "Preflop: Nur deine Hole Cards sind sichtbar.";
  }

  if (gameState.phase === "flop") {
    return "Flop: Drei Community Cards sind aufgedeckt.";
  }

  if (gameState.phase === "turn") {
    return "Turn: Die vierte Community Card ist aufgedeckt.";
  }

  if (gameState.phase === "river") {
    return "River: Alle fünf Community Cards sind sichtbar.";
  }

  if (gameState.phase === "finished") {
    const winnerNames = (gameState.winnerIds ?? []).map(getPlayerName).join(", ");
    const handLabel = gameState.winningHand ? ` (${gameState.winningHand})` : "";
    return `Gewinner: ${winnerNames}${handLabel}`;
  }

  return "";
}

function renderGameState() {
  updateCoins();
  revealPlayerCards();
  revealCommunityCards(getVisibleCommunityCardCount(gameState));
  updateMeta(gameState);
  updateActionButtons(gameState);
  renderPlayerStatusBoard();
  renderActionFeed();
  displayTurnMessage(getTurnMessage());
  displayMessage(getPrimaryMessage());
}

async function performAction(actionType, amount = 0) {
  if (actionInFlight) {
    return;
  }

  actionInFlight = true;
  renderGameState();

  try {
    const result = await submitGameAction(actionType, amount);
    await hydrateCurrentState();

    if (!result?.ok) {
      displayMessage(result?.message ?? "Aktion konnte nicht ausgeführt werden.");
    }
  } finally {
    actionInFlight = false;
    renderGameState();
    await maybeRunBotTurn();
  }
}

const subscription = subscribeToGame(roomId, {
  onRoomUpdate: async () => {
    await hydrateCurrentState();
    renderGameState();
    await maybeRunBotTurn();
  },
  onAction: async (payload) => {
    await hydrateCurrentState();
    pushActionEntry({
      playerId: payload.new.player_id,
      actionType: payload.new.action_type,
      amount: payload.new.amount,
    });
    renderGameState();
    await maybeRunBotTurn();
  },
});

async function ensureGameStarted() {
  const rawStatus = await getGameState(roomId);
  const isHost = await checkHost(roomId);

  if (rawStatus === WAITING_STATUS && isHost && !startTriggered) {
    startTriggered = true;
    const state = await startGame();
    currentPlayer = state?.player ?? currentPlayer;
    currentRoom = state?.room ?? currentRoom;
    await startGameLoop(roomId);
    await hydrateCurrentState();
    actionFeedEntries = [];
    renderGameState();
    await maybeRunBotTurn();
    return;
  }

  await hydrateCurrentState();
  actionFeedEntries = [];
  renderGameState();
  await maybeRunBotTurn();
}

window.addEventListener("beforeunload", () => {
  if (subscription?.channel) {
    subscription.channel.unsubscribe();
  }
});

await ensureGameStarted();

const betBtn = document.getElementById("btn_checken");
if (betBtn) {
  betBtn.addEventListener("click", async () => {
    await performAction("check");
  });
}

const callBtn = document.getElementById("btn_mitgehen");
if (callBtn) {
  callBtn.addEventListener("click", async () => {
    await performAction("call");
  });
}

const raiseBtn = document.getElementById("btn_erhoehen");
if (raiseBtn) {
  raiseBtn.addEventListener("click", async () => {
    const raiseInput = document.getElementById("raise-amount");
    const raiseAmount = Number(raiseInput?.value ?? "0");
    await performAction("raise", raiseAmount);
  });
}

const foldBtn = document.getElementById("btn_passen");
if (foldBtn) {
  foldBtn.addEventListener("click", async () => {
    await performAction("fold");
  });
}

const nextHandBtn = document.getElementById("btn_neue_runde");
if (nextHandBtn) {
  nextHandBtn.addEventListener("click", async () => {
    const isHost = await checkHost(roomId);
    if (!isHost) {
      displayMessage("Nur der Host kann eine neue Hand starten.");
      return;
    }

    const state = await startGame();
    if (!state) {
      displayMessage("Neue Hand konnte nicht vorbereitet werden.");
      return;
    }

    currentPlayer = state.player ?? currentPlayer;
    currentRoom = state.room ?? currentRoom;
    await startGameLoop(roomId);
    await hydrateCurrentState();
    actionFeedEntries = [];
    renderGameState();
    await maybeRunBotTurn();
  });
}
