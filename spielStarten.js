// Gemeindschaftskarten (ziehen + Array)

import {karten} from "./karten.js";  // importieren der Karten aus karten.js
import {kartenSpiel, zufaelligeKarteZiehen} from "./zufaelligeKarte.js";  // importieren der zufaelligeKarteZiehen Funktion aus zufaelligeKarteZiehen.js


function kartenZiehen(){
    spieler.karten.unshift(zufaelligeKarteZiehen())//Karten des Spilers random ziehen
    spieler.karten.unshift(zufaelligeKarteZiehen())
    spieler.karten.unshift(zufaelligeKarteZiehen())
    spieler.karten.unshift(zufaelligeKarteZiehen())
    spieler.karten.unshift(zufaelligeKarteZiehen())

    gegner.karten.unshift(zufaelligeKarteZiehen())//Karten des Gegner random ziehen
    gegner.karten.unshift(zufaelligeKarteZiehen())
    gegner.karten.unshift(zufaelligeKarteZiehen())
    gegner.karten.unshift(zufaelligeKarteZiehen())
    gegner.karten.unshift(zufaelligeKarteZiehen())
    console.log(spieler, gegner)
}

function gemeinschaftsKartenZiehen() {
    let flop1 = zufaelligeKarteZiehen()
    let flop2 = zufaelligeKarteZiehen()
    let flop3 = zufaelligeKarteZiehen()
    let turn = zufaelligeKarteZiehen()
    let river = zufaelligeKarteZiehen()
}

function spielStarten(){
    kartenSpiel = karten;
    kartenZiehen()
    gemeinschaftsKartenZiehen()
    flopsAufdecken
}

spielStarten()
function flopsAufdecken()

let spielerKarte1 = document.getElementById()
let spielerKarte2 = document.getElementById()
let gegnerKarte1 = document.getElementById()
let gegnerKarte2 = document.getElementById()
let gemeinschaftsKarten1 document.getElementById('flop1')
let gemeinschaftsKarten2 document.getElementById('flop2')
let gemeinschaftsKarten3 document.getElementById('flop3')
let gemeinschaftsKarten4 document.getElementById('turn')
let gemeinschaftsKarten5 document.getElementById('river')