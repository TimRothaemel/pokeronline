import { getRoom } from "../supabase/rooms/get-room.js";
import { updateChips } from "../supabase/player/update-chips.js";
import { updateCoins } from "../display/display-coins.js";

let room = getRoom(localStorage.getItem("room_id")); // load room data from supabase using room_id stored in localStorage
localStorage.setItem("current_room", JSON.stringify(room)); // store room data in localStorage for later use

export function placeBet(amount) {
  let currentPlayer = JSON.parse(localStorage.getItem("current_player")); // load current player data from localStorage

  if (currentPlayer.chips >= amount) {
    updateChips(currentPlayer.id, currentPlayer.chips - amount);
    updateCoins(); // update coin display after placing bet
    localStorage.setItem(
      "current_player",
      JSON.stringify({ ...currentPlayer, chips: currentPlayer.chips - amount }),
    );
    return { covered: true };
  } else {
    return { covered: false };
  }
}
