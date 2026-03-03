import { loadPlayers } from "../../scripts/supabase/player/load-player.js"; // import loadPlayers() function

roomId = localStorage.getItem("room_id"); // get room_id from localStorage

players = loadPlayers(roomId); // load players in the room using loadPlayers() function

console.log(players); // log players for debugging