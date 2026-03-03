import { getPlayerId } from "../player/get-player-id.js"; // import getPlayerId() function
import { hashPassword } from "../../general/password-hash.js"; // import hashPassword() function
import supabase from "../initialize-supabase.js"; //import supabase client instance
import { generateNewPlayerId } from "../player/new-player-id.js";

export async function createRoom(roomName, password, nickname) {
  const playerId = await generateNewPlayerId();

  const passwordHash = await hashPassword(password);

  const { data: room, error } = await supabase
    .from("rooms")
    .insert([
      {
        name: roomName,
        password_hash: passwordHash,
        host_player_id: playerId,
      },
    ])
    .select()
    .single();

if (error) {
    if (error.code === "23505") {
      alert("Dieser Raumname existiert bereits.");
    } else {
      alert(error.message);
    }
    return error; 
  }

  await supabase.from("players").insert([
    // insert new player into "players" table
    {
      id: playerId,
      nickname: nickname,
      room_id: room.id,
      host: true,// set host to true for the player who created the room
    },
  ]);
  localStorage.setItem("room_id", room.id); // store room_id in localStorage for later use
  console.log("Room ID:", room.id);
  console.log("Raum erstellt:", room);
}
