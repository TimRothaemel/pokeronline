export function getPlayerId() {
  let playerId = localStorage.getItem("player_id"); //loaded player_id from local storage

  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("player_id", playerId);
  }

  return playerId;
}
