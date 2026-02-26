export function revealCard(element, src) {
    //reveal card by element and src
    element.innerHTML = `<img src="${src}" alt="card">`;
}