import { createClient } from "jsr:@supabase/supabase-js@2";
import { cards } from "./card.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

let gameCards: typeof cards;

function resetGameCards() {
  gameCards = [...cards];
}

function getRandomCard() {
  const randomIndex = Math.floor(Math.random() * gameCards.length);
  const card = gameCards[randomIndex];
  gameCards.splice(randomIndex, 1);
  return card;
}

async function loadPlayersInRoom(roomId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("id")
    .eq("room_id", roomId);
  if (error) throw error;
  return data;
}

async function drawPlayerCards(playerId: string) {
  const newCards = [getRandomCard(), getRandomCard()];
  const { error } = await supabase
    .from("players")
    .update({ cards: JSON.stringify(newCards) })
    .eq("id", playerId);
  if (error) throw error;
  return newCards;
}

async function drawCommunityCards(roomId: string) {
  const communityCards = [
    getRandomCard(), // flop1
    getRandomCard(), // flop2
    getRandomCard(), // flop3
    getRandomCard(), // turn
    getRandomCard(), // river
  ];
  const { error } = await supabase
    .from("rooms")
    .update({ community_cards: JSON.stringify(communityCards) })
    .eq("id", roomId);
  if (error) throw error;
  return communityCards;
}

export async function drawCards(roomId: string) {
  resetGameCards();
  const players = await loadPlayersInRoom(roomId);

  for (const player of players) {
    await drawPlayerCards(player.id);
  }

  await drawCommunityCards(roomId);
}
