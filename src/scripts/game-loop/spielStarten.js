// Gemeindschaftskarten (ziehen + Array)

import { karten } from "../karten/karten.js"; // importieren der Karten aus karten.js
import {
  kartenSpiel,
  zufaelligeKarteZiehen,
} from "../karten/zufaelligeKarte.js"; // importieren der zufaelligeKarteZiehen Funktion aus zufaelligeKarteZiehen.js

// Spieler, Gegner und Karten Html Elemente
let spielerKarte1 = document.getElementById("spielerKarte1");
let spielerKarte2 = document.getElementById("spielerKarte2");
let gegnerKarte1 = document.getElementById("gegnerKarte1");
let gegnerKarte2 = document.getElementById("gegnerKarte2");
let gemeinschaftsKarten1 = document.getElementById("flop1");
let gemeinschaftsKarten2 = document.getElementById("flop2");
let gemeinschaftsKarten3 = document.getElementById("flop3");
let gemeinschaftsKarten4 = document.getElementById("turn");
let gemeinschaftsKarten5 = document.getElementById("river");

function kartenZiehen() {
  spieler.karten.unshift(zufaelligeKarteZiehen()); //Karten des Spilers random ziehen
  spieler.karten.unshift(zufaelligeKarteZiehen());
  spieler.karten.unshift(zufaelligeKarteZiehen());
  spieler.karten.unshift(zufaelligeKarteZiehen());
  spieler.karten.unshift(zufaelligeKarteZiehen());

  gegner.karten.unshift(zufaelligeKarteZiehen()); //Karten des Gegner random ziehen
  gegner.karten.unshift(zufaelligeKarteZiehen());
  gegner.karten.unshift(zufaelligeKarteZiehen());
  gegner.karten.unshift(zufaelligeKarteZiehen());
  gegner.karten.unshift(zufaelligeKarteZiehen());
  console.log(spieler, gegner);
}

function gemeinschaftsKartenZiehen() {
  //Gemeinschaftskarten random ziehen
  let flop1 = zufaelligeKarteZiehen();
  let flop2 = zufaelligeKarteZiehen();
  let flop3 = zufaelligeKarteZiehen();
  let turn = zufaelligeKarteZiehen();
  let river = zufaelligeKarteZiehen();
}

function spielStarten() {
  //Spiel starten
  kartenSpiel = karten;
  kartenZiehen();
  gemeinschaftsKartenZiehen();
  flopsAufdecken;
}

spielStarten(); //Spiel starten aufrufen

function flopsAufdecken() {
  //Flops aufdecken
  gemeinschaftsKarten1.src = `./assets/${flop1.name}.png`;
  gemeinschaftsKarten2.src = `./assets/${flop2.name}.png`;
  gemeinschaftsKarten3.src = `./assets/${flop3.name}.png`;
}
