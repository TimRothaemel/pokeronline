import { loadPlayers } from "../../scripts/supabase/player/load-player.js"; //import { loadPlayers } from "../../scripts/supabase/player/load-player.js";
import { displayPlayers } from "../../components/player-list/player-list.js"; //import { displayPlayers } from "../../components/player-list/player-list.js";
import { addBot } from "../../scripts/supabase/bot/add-bot.js"; //import { addBot } from "../../scripts/supabase/bot/add-bot.js";
import { startGame } from "../../scripts/game-loop/start-game.js"; //import { startGame } from "../../scripts/supabase/game/start-game.js";

const roomId = localStorage.getItem("room_id");

if (!roomId) {
  // No room ID found, redirect to homepage
  alert("Kein Raum gefunden.");
  window.location.href = "/";
}

async function initLobby() {
  // Initialize lobby by loading players and updating UI
  const players = await loadPlayers(roomId);
  displayPlayers(players);
  if (players.length >= 2) {
    document.getElementById("start-game-btn").disabled = false;
  }
  if (players.length < 6) {
    document.getElementById("add-bot-btn").disabled = false;
  } else {
    document.getElementById("add-bot-btn").disabled = true;
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
      await addBot(roomId);
      initLobby();
    });
  }

if (startGameBtn) {
  startGameBtn.addEventListener("click", async () => {
  await startGame();
    window.location.href = "../game/game.html";
  });
}

  initLobby(); // run after DOM is ready
});


