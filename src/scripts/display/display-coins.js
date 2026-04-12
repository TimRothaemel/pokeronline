export function updateCoins() {
  const el = document.getElementById("player-coins");
  const playerJson = localStorage.getItem("current_player");

  if (!el || !playerJson) {
    return;
  }

  const player = JSON.parse(playerJson);
  el.textContent = `${player.chips ?? 0}`;
}
