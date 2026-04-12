export function displayPlayers(players) {
  const playerList = document.getElementById("player-list");
  playerList.innerHTML = ""; // Clear existing list

  players.forEach((player) => {
    const playerEntry = document.createElement("div");
    playerEntry.textContent = player.nickname;
    playerList.appendChild(playerEntry);
  });
}
