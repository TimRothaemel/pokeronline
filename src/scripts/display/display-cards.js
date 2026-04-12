export function revealCard(id, src) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }

  el.innerHTML = `<img src="${src}" alt="card">`;
  el.classList.add("has-card");
}

const PLAYER_CARD_IDS = ["playercard1", "playercard2"];
const COMMUNITY_CARD_IDS = ["flop1", "flop2", "flop3", "turn", "river"];

export function hideCard(id) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }

  el.innerHTML = "–";
  el.classList.remove("has-card");
}

function getCurrentPlayerCards() {
  const playerJson = localStorage.getItem("current_player");

  if (!playerJson) {
    console.error("current_player missing from localStorage");
    return null;
  }

  const player = JSON.parse(playerJson);

  if (!player.cards) {
    console.error("current_player has no cards", player);
    return null;
  }

  return JSON.parse(player.cards);
}

function getCommunityCards() {
  const roomJson = localStorage.getItem("current_room");

  if (!roomJson) {
    return [];
  }

  const room = JSON.parse(roomJson);
  if (!room.community_cards) {
    return [];
  }

  try {
    return JSON.parse(room.community_cards);
  } catch (error) {
    console.error("Fehler beim Parsen von community_cards", error);
    return [];
  }
}

export function revealPlayerCards() {
  const playerCards = getCurrentPlayerCards();

  if (!playerCards || playerCards.length < 2) {
    return;
  }

  PLAYER_CARD_IDS.forEach((cardId, index) => {
    const card = playerCards[index];
    if (!card) {
      return;
    }

    revealCard(cardId, `/src/assets/cards/${card.color}/${card.number}.png`);
  });
}

export function revealFlops() {
  const communityCards = getCommunityCards();
  communityCards.slice(0, 3).forEach((card, index) => {
    revealCard(
      COMMUNITY_CARD_IDS[index],
      `/src/assets/cards/${card.color}/${card.number}.png`,
    );
  });
}

export function revealTurn() {
  const communityCards = getCommunityCards();
  const turnCard = communityCards[3];
  if (!turnCard) {
    return;
  }

  revealCard("turn", `/src/assets/cards/${turnCard.color}/${turnCard.number}.png`);
}

export function revealRiver() {
  const communityCards = getCommunityCards();
  const riverCard = communityCards[4];
  if (!riverCard) {
    return;
  }

  revealCard("river", `/src/assets/cards/${riverCard.color}/${riverCard.number}.png`);
}

export function revealAllCommunityCards() {
  revealFlops();
  revealTurn();
  revealRiver();
}

export function revealCommunityCards(count) {
  const communityCards = getCommunityCards();

  COMMUNITY_CARD_IDS.forEach((cardId, index) => {
    const card = communityCards[index];

    if (!card || index >= count) {
      hideCard(cardId);
      return;
    }

    revealCard(cardId, `/src/assets/cards/${card.color}/${card.number}.png`);
  });
}
