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
let startTriggered = false;
let actionInFlight = false;
let botActionInFlight = false;

async function hydrateCurrentState() {
  const [player, room] = await Promise.all([getPlayer(playerId), getRoom(roomId)]);
  if (player) {
    currentPlayer = player;
    localStorage.setItem("current_player", JSON.stringify(player));
  }
  if (room) {
    currentRoom = room;
    localStorage.setItem("current_room", JSON.stringify(room));
    gameState = parseGameState(room.status);
  }
}

async function maybeRunBotTurn() {
  if (actionInFlight || botActionInFlight || !gameState?.currentPlayerId) {
    return;
  }

  const isHost = await checkHost(roomId);
  if (!isHost) {
    return;
  }

  const players = await loadPlayers(roomId);
  const currentTurnPlayer = players.find((player) => player.id === gameState.currentPlayerId);

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

function renderGameState() {
  updateCoins();
  revealPlayerCards();
  revealCommunityCards(getVisibleCommunityCardCount(gameState));
  updateMeta(gameState);
  updateActionButtons(gameState);

  if (!currentRoom) {
    displayTurnMessage("Room wird geladen ...");
    displayMessage("");
    return;
  }

  if (!gameState) {
    displayTurnMessage("Warte auf den Host, um die Runde zu starten.");
    displayMessage("");
    return;
  }

  if (gameState.phase === "finished") {
    const hasWon = gameState.winnerIds?.includes(playerId);
    const outcome = hasWon ? "Du hast diese Hand gewonnen." : "Die Hand ist beendet.";
    const handLabel = gameState.winningHand ? ` (${gameState.winningHand})` : "";
    displayTurnMessage(outcome);
    displayMessage(`Gewinner: ${gameState.winnerIds.join(", ")}${handLabel}`);
    return;
  }

  if (gameState.currentPlayerId === playerId) {
    displayTurnMessage(actionInFlight ? "Aktion wird gesendet ..." : "Du bist am Zug.");
  } else {
    displayTurnMessage(`Warte auf Spieler ${gameState.currentPlayerId ?? "-"}.`);
  }
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
    const { action_type: actionType, amount } = payload.new;
    const amountLabel = amount ? ` ${amount}` : "";
    displayMessage(`Aktion: ${actionType}${amountLabel}`);
    await hydrateCurrentState();
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
    renderGameState();
    await maybeRunBotTurn();
    return;
  }

  await hydrateCurrentState();
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

    await startGameLoop(roomId);
    await hydrateCurrentState();
    renderGameState();
  });
}
