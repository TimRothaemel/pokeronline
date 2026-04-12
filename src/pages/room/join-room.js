import { joinRoom } from "../../scripts/supabase/rooms/join-rooms";
document
  .querySelector("[type=submit]")
  .addEventListener("click", async (event) => {
    event.preventDefault();

    const roomName = document.getElementById("room-name").value;
    const password = document.getElementById("room-password").value;
    const nickname = document.getElementById("user-name").value;

    await joinRoom(roomName, password, nickname);
    window.location.href = "/src/pages/lobby/lobby.html";
  });
