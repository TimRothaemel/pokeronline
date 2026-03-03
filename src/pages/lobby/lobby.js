import { loadPlayers } from "../../scripts/supabase/player/load-player.js"; //import { loadPlayers } from "../../scripts/supabase/player/load-player.js";
import { displayPlayers } from "../../components/player-list/player-list.js"; //import { displayPlayers } from "../../components/player-list/player-list.js";
import { addBot } from "../../scripts/supabase/bot/add-bot.js"; //import { addBot } from "../../scripts/supabase/bot/add-bot.js";

const roomId = localStorage.getItem("room_id");
const addBotBtn = document.getElementById("add-bot-btn");
const startGameBtn = document.getElementById("start-game-btn");

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
}

addBotBtn.addEventListener("click", async () => {
  // Add bot to game and refresh lobby
  addBot(roomId);
  initLobby();
});

if (startGameBtn) {
  startGameBtn.addEventListener("click", async () => {
    await fetch(`/api/rooms/${roomId}/start-game`, { method: "POST" });
    window.location.href = `/game.html?room_id=${roomId}`;
  });
}

initLobby(); // Start lobby initialization on page load
