export async function generateNewPlayerId() {
    let playerId = crypto.randomUUID();
    localStorage.setItem("player_id", playerId);

  return playerId;
}
