import { createRoom } from "../../scripts/supabase/rooms/create-room";

const submitBtn = document.querySelector('input[type="submit"]');

submitBtn.addEventListener("click", () => {
  const userName = document.getElementById("user-name").value;
  const roomName = document.getElementById("room-name").value;
  const roomPassword = document.getElementById("room-password").value;

  if (!userName || !roomName || !roomPassword) {
    console.warn("Please fill in all fields.");
    return;
  }

  console.log(userName, roomName, roomPassword);
  createRoom({ userName, roomName, roomPassword });
});