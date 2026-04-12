import { joinRoom } from "../../scripts/supabase/rooms/join-rooms.js";
document
  .querySelector("[type=submit]")
  .addEventListener("click", async (event) => {
    event.preventDefault();

    const roomName = document.getElementById("room-name").value.trim();
    const password = document.getElementById("room-password").value;
    const nickname = document.getElementById("user-name").value.trim();

    if (!roomName || !password || !nickname) {
      alert("Bitte fülle alle Felder aus.");
      return;
    }

    const result = await joinRoom(roomName, password, nickname);
    if (!result?.ok) {
      alert(result?.message ?? "Raum konnte nicht betreten werden.");
      return;
    }

    window.location.href = "/src/pages/lobby/lobby.html";
  });
