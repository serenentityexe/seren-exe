document.addEventListener("DOMContentLoaded", async () => {
  const terminal = document.getElementById("terminal");
  const inputField = document.getElementById("commandInput");
  const adminIcon = document.getElementById("admin-icon");
  const adminPanel = document.getElementById("admin-panel");
  const adminPasswordInput = document.getElementById("admin-password");
  const toggleSwitch = document.getElementById("toggle-switch");
  const toggleLabel = document.getElementById("toggle-label");

  let consoleActive = false;
  let gameActive = false;
  let gameState = "OFF";
  const apiBaseUrl = "https://api-serenentityexe.vercel.app/api"; // 🔥 sostituisci con il tuo URL API effettivo se diverso

  // --- 🧠 Funzioni di utilità ---
  function addMessage(message, type = "system") {
    const line = document.createElement("div");
    line.classList.add(type);
    line.textContent = `> ${message}`;
    terminal.prepend(line);
  }

  async function fetchGameState() {
    try {
      const res = await fetch(`${apiBaseUrl}/gameState`);
      if (!res.ok) throw new Error("Error fetching game state");
      const data = await res.json();
      gameState = data.state || "OFF";
      updateToggleUI();
      console.log("Game state:", gameState);
    } catch (error) {
      addMessage("ERROR FETCHING GAME STATE", "error");
      console.error(error);
    }
  }

  async function updateGameState(newState) {
    try {
      const res = await fetch(`${apiBaseUrl}/updateGameState`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState, password: adminPasswordInput.value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating game state");
      gameState = newState;
      updateToggleUI();
      addMessage(`GAME STATE UPDATED TO ${newState}`, "success");
    } catch (error) {
      addMessage("ERROR UPDATING GAME STATE", "error");
      console.error(error);
    }
  }

  function updateToggleUI() {
    if (gameState === "ON") {
      toggleSwitch.classList.add("on");
      toggleLabel.textContent = "ON 🟢";
    } else {
      toggleSwitch.classList.remove("on");
      toggleLabel.textContent = "OFF 🔴";
    }
  }

  // --- 🧩 Gestione comandi terminale ---
  inputField.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const command = inputField.value.trim().toUpperCase();
      inputField.value = "";

      if (!command) return;

      addMessage(command, "user");

      if (command === "START") {
        consoleActive = true;
        addMessage("SYSTEM BOOTING...");
        setTimeout(() => addMessage("CONSOLE READY."), 1000);
      }

      if (!consoleActive) {
        addMessage("SYSTEM NOT INITIALIZED. TYPE 'START' TO BEGIN.", "error");
        return;
      }

      switch (command) {
        case "GAME":
          if (gameState === "OFF") {
            addMessage("⚠️ GAME UNAVAILABLE. ACTIVATION AFTER 150K MC.", "error");
          } else {
            addMessage("GAME INITIALIZED...", "system");
            setTimeout(() => startGame(), 1000);
          }
          break;

        case "INFO":
          addMessage("SEREN.EXE // ENCRYPTED TERMINAL", "system");
          addMessage("TYPE 'GAME' TO PLAY.", "system");
          break;

        case "CLEAR":
          terminal.innerHTML = "";
          break;

        case "QUIT":
          addMessage("CLOSING CONNECTION...", "system");
          setTimeout(() => (consoleActive = false), 1000);
          break;

        default:
          addMessage("UNKNOWN COMMAND", "error");
      }
    }
  });

  // --- 🎮 Funzione di avvio gioco (collega a game.js) ---
  function startGame() {
    if (typeof startGameSession === "function") {
      startGameSession();
    } else {
      addMessage("GAME ENGINE NOT FOUND.", "error");
    }
  }

  // --- ⚙️ Admin panel ---
  adminIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    adminPanel.classList.toggle("visible");
  });

  document.addEventListener("click", (e) => {
    if (!adminPanel.contains(e.target) && !adminIcon.contains(e.target)) {
      adminPanel.classList.remove("visible");
    }
  });

  toggleSwitch.addEventListener("click", async () => {
    const newState = gameState === "ON" ? "OFF" : "ON";
    await updateGameState(newState);
  });

  // --- 🔄 Init ---
  await fetchGameState();
});
