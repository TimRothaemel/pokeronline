export function displayPlayers(players) {
  const playerList = document.getElementById("player-list");
  playerList.innerHTML = ""; // Clear existing list

  players.forEach(player => {
    const listItem = document.createElement("li");
    listItem.textContent = player.nickname; 
    playerList.appendChild(listItem);
  });
}