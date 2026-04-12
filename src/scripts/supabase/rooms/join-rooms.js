import { getPlayerId } from "../player/get-player-id.js";// import getPlayerId() function
import { hashPassword } from "../../general/password-hash.js";// import hashPassword() function
import  supabase  from "../initialize-supabase.js"; //import supabase client instance 

export async function joinRoom(roomName, password, nickname) {
  const playerId = getPlayerId();
  const passwordHash = await hashPassword(password);

  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("name", roomName)
    .single();

  if (error || !room) {
    alert("Raum nicht gefunden");
    return;
  }

  if (room.password_hash !== passwordHash) {
    alert("Falsches Passwort");
    return;
  }

  await supabase.from("players").insert([
    {
      id: playerId,
      nickname: nickname,
      room_id: room.id
    }
  ]);
  localStorage.setItem("room_id", room.id); // store room_id in localStorage for later use
  console.log("Raum beigetreten");
}
