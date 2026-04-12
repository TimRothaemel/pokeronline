export function displayMessage(message) {
  const el = document.getElementById("message-container");
  if (!el) {
    return;
  }

  el.textContent = message;
}

export function displayTurnMessage(message) {
  const el = document.getElementById("turn-container");
  if (!el) {
    return;
  }

  el.textContent = message;
}
