import { createRoom } from "../../scripts/supabase/rooms/create-room";// import createRoom() function

const submitBtn = document.querySelector('input[type="submit"]');

submitBtn.addEventListener("click", () => {
  const userName = document.getElementById("user-name").value;
  const roomName = document.getElementById("room-name").value;
  const roomPassword = document.getElementById("room-password").value;

  if (!userName || !roomName || !roomPassword) {
    console.warn("Please fill in all fields.");
    return;
  }

  console.log(userName, roomName, roomPassword);// Log input values for debugging
  createRoom(roomName, roomPassword, userName); // Call createRoom function with user input

  window.location.href = "/src/pages/lobby/lobby.html";// Redirect to lobby after creating room
});
