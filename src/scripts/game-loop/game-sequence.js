function revealPlayerCards() {
    //reveal player cards
    playerCard1.src = `./src/assets/${player.cards[0].color}/${player.cards[0].number}.png`;
    playerCard2.src = `./src/assets/${player.cards[1].color}/${player.cards[1].number}.png`;
}

function revealFlops() {
  //reveal flops
  communityCard1.src = `./src/assets/${flop1.name}.png`;
  communityCard2.src = `./src/assets/${flop2.name}.png`;
  communityCard3.src = `./src/assets/${flop3.name}.png`;
}
function revealTurn() {
  //reveal turn
  communityCard4.src = `./src/assets/${turn.name}.png`;
}
function revealRiver() {
  //reveal river
  communityCard5.src = `./src/assets/${river.name}.png`;
}