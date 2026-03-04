import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Karten erstellen
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"]
  const values = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"]

  let deck = []

  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value })
    }
  }

  return deck
}

// Fisher-Yates Shuffle (sauber & fair)
function shuffle(deck: any[]) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
}

// Sitzplätze zufällig verteilen
function assignSeats(players: any[]) {
  let seats = players.map((_, i) => i)

  for (let i = seats.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[seats[i], seats[j]] = [seats[j], seats[i]]
  }

  return seats
}

serve(async (req) => {

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { roomId } = await req.json()

  // 1️⃣ Spieler laden
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId)

  if (!players || players.length === 0) {
    return new Response("No players", { status: 400 })
  }

  // 2️⃣ Sitzplätze verteilen
  const seats = assignSeats(players)

  for (let i = 0; i < players.length; i++) {
    await supabase
      .from("players")
      .update({ seat_position: seats[i] })
      .eq("id", players[i].id)
  }

  // 3️⃣ Deck erstellen + mischen
  let deck = createDeck()
  shuffle(deck)

  // 4️⃣ Karten verteilen
  for (let player of players) {
    const hand = [deck.pop(), deck.pop()]

    await supabase
      .from("players")
      .update({ hand })
      .eq("id", player.id)
  }

  // 5️⃣ Restliches Deck speichern
  await supabase
    .from("rooms")
    .update({ deck })
    .eq("id", roomId)

  return new Response(
    JSON.stringify({ message: "Game started" }),
    { headers: { "Content-Type": "application/json" } }
  )
})