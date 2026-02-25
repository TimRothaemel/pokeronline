import { karten } from "./karten.js"; // importieren der Karten aus karten.js

export let kartenSpiel = karten; // Kartenstapel für karten im Spiel, wird mit karten aus karten.js gefüllt

export function zufaelligeKarteZiehen() {
  // Funktion zum Ziehen einer zufälligen Karte
  let randomNumber = zufaelligeZahl();
  let Karte = kartenSpiel[randomNumber];
  kartenWeg(randomNumber);
  return Karte
}
function kartenWeg(randomNumber) {
  // Funktion zum Entfernen der gezogenen Karte aus dem Kartenstapel
  kartenSpiel.splice(randomNumber, 1);
}

function zufaelligeZahl() {
  // Funktion zum Generieren einer zufälligen Zahl basierend auf der Länge des Kartenstapels
  let randomNumber = Math.floor(Math.random() * kartenSpiel.length);
  return randomNumber;
}
