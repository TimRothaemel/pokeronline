import { loadPlayers } from "../../scripts/supabase/player/load-player.js";

const roomId = localStorage.getItem("room_id");

if (!roomId) {
  alert("Kein Raum gefunden.");
  window.location.href = "/";
}

async function initLobby() {
  const players = await loadPlayers(roomId);

  console.log("Geladene Spieler:", players);
  
}

initLobby();