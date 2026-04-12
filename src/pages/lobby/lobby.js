import { loadPlayers } from "../../scripts/supabase/player/load-player.js"; //import { loadPlayers } from "../../scripts/supabase/player/load-player.js";
import { displayPlayers } from "../../components/player-list/player-list.js"; //import { displayPlayers } from "../../components/player-list/player-list.js";
import { addBot } from "../../scripts/supabase/bot/add-bot.js"; //import { addBot } from "../../scripts/supabase/bot/add-bot.js";
import { checkHost } from "../../scripts/supabase/player/check-host.js";

const roomId = localStorage.getItem("room_id");

if (!roomId) {
  // No room ID found, redirect to homepage
  alert("Kein Raum gefunden.");
  window.location.href = "/";
}

async function initLobby() {
  // Initialize lobby by loading players and updating UI
  const players = await loadPlayers(roomId);
  const isHost = await checkHost(roomId);
  const startGameButton = document.getElementById("start-game-btn");
  const addBotButton = document.getElementById("add-bot-btn");
  const lobbyStatus = document.getElementById("lobby-status");
  const hostStatus = document.getElementById("host-status");

  displayPlayers(players);

  startGameButton.disabled = !(isHost && players.length >= 2);
  addBotButton.disabled = !(isHost && players.length < 6);

  if (lobbyStatus) {
    lobbyStatus.textContent = `${players.length}/6 players seated`;
  }

  if (hostStatus) {
    hostStatus.textContent = isHost ? "You are the host" : "Waiting for the host";
  }

  if (players.length >= 6) {
    console.warn("Maximale Spieleranzahl erreicht. Kein weiterer Bot kann hinzugefügt werden.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const addBotBtn = document.getElementById("add-bot-btn");
  const startGameBtn = document.getElementById("start-game-btn");

  if (addBotBtn) {
    addBotBtn.addEventListener("click", async () => {
      const result = await addBot(roomId);
      if (!result?.ok) {
        alert(result?.message ?? "Bot konnte nicht hinzugefügt werden.");
        return;
      }

      await initLobby();
    });
  }

  if (startGameBtn) {
    startGameBtn.addEventListener("click", async () => {
      window.location.href = "../game/game.html";
    });
  }

  initLobby(); // run after DOM is ready
});
