export function updateCoins() {
  //update coins display
  let el = document.getElementById("player-coins");
  let player = JSON.parse(localStorage.getItem("current_player")); // get current player data from localStorage for use in coin display
  el.textContent = `${player.chips}`; // update coin display with current player's coins
}
