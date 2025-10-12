const API_BASE_URL = "https://api-ten-inky-24.vercel.app/api";

async function fetchGameState() {
  try {
    const response = await fetch(`${API_BASE_URL}/gameState`);
    const data = await response.json();
    return data.gameAvailable;
  } catch (error) {
    console.error("Error fetching game state:", error);
    return false;
  }
}

async function toggleGameState(enabled, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/updateGameState`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: password,
        gameAvailable: enabled
      }),
    });
    const data = await response.json();
    if (data.success) {
      console.log("Game state updated:", data.gameAvailable);
      return true;
    }
    console.error("Error updating game state:", data.error);
    return false;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

async function initGame() {
  const available = await fetchGameState();
  if (!available) {
    alert("Il gioco non è ancora attivo.");
    return;
  }
  // avvia il terminale / gioco
  startTerminalGame();
}

document.addEventListener("DOMContentLoaded", () => {
  const powerBtn = document.querySelector("#powerButton");
  if (powerBtn) {
    powerBtn.addEventListener("click", initGame);
  }
});
