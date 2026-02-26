// player apponent and community html elements
let playerCard1 = document.getElementById("playerKarte1").innerHTML = `<img src="${player.cards[0].src}" alt="${player.cards[0].name}">`;
let playerCard2 = document.getElementById("playerKarte2").innerHTML = `<img src="${player.cards[1].src}" alt="${player.cards[1].name}">`;
let opponentCard1 = document.getElementById("apponentKarte1").innerHTML = `<img src="${apponent.cards[0].src}" alt="${apponent.cards[0].name}">`;
let opponentCard2 = document.getElementById("apponentKarte2").innerHTML = `<img src="${apponent.cards[1].src}" alt="${apponent.cards[1].name}">`; 
let communityCard1 = document.getElementById("flop1");
let communityCard2 = document.getElementById("flop2");
let communityCard3 = document.getElementById("flop3");
let communityCard4 = document.getElementById("turn");
let communityCard5 = document.getElementById("river");