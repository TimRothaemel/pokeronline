import { createRoom } from "../../scripts/supabase/rooms/create-room.js";// import createRoom() function

const submitBtn = document.querySelector('input[type="submit"]');

submitBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  const userName = document.getElementById("user-name").value.trim();
  const roomName = document.getElementById("room-name").value.trim();
  const roomPassword = document.getElementById("room-password").value;

  if (!userName || !roomName || !roomPassword) {
    alert("Bitte fülle alle Felder aus.");
    return;
  }

  const result = await createRoom(roomName, roomPassword, userName);
  if (!result?.ok) {
    alert(result?.message ?? "Raum konnte nicht erstellt werden.");
    return;
  }

  if (result.ok) {
    window.location.href = "/src/pages/lobby/lobby.html"; // Redirect to lobby page if room creation is successful
  }
});
