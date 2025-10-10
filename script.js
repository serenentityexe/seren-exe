// script.js — Seren.exe Console Logic

let consoleActive = false;
let gameActive = false;
let inputLocked = false;
let inputField;
let consoleOutput;

document.addEventListener("DOMContentLoaded", async () => {
  consoleOutput = document.getElementById("console-output");
  inputField = document.getElementById("console-input");

  // Aggiorna stato del gioco
  const state = await getGameState();
  updateToggleUI(state);

  // Event listener per input
  inputField.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && !inputLocked) {
      const input = inputField.value.trim();
      inputField.value = "";
      handleCommand(input);
    }
  });

  // Attiva il focus automatico
  window.addEventListener("click", () => inputField.focus());
  inputField.focus();

  // Setup toggle admin
  setupAdminToggle();
});

// === GESTIONE CONSOLE ===
function displayToConsole(text) {
  const line = document.createElement("div");
  line.textContent = text;
  consoleOutput.prepend(line);
}

function clearConsole() {
  consoleOutput.innerHTML = "";
}

// === GESTIONE COMANDI ===
async function handleCommand(input) {
  const command = input.toUpperCase();
  displayToConsole(`> ${command}`);

  if (command === "CLEAR") {
    clearConsole();
    return;
  }

  if (command === "QUIT") {
    consoleActive = false;
    displayToConsole("> SESSION TERMINATED. TYPE START TO REBOOT.");
    return;
  }

  // HELP è sempre disponibile
  if (command === "HELP") {
    displayToConsole("> AVAILABLE COMMANDS: START, CLEAR, QUIT, HELP");
    if (consoleActive) displayToConsole("> GAME, STORY, TOKENOMICS, INFO");
    return;
  }

  if (command === "START") {
    if (consoleActive) {
      displayToConsole("> CONSOLE ALREADY ACTIVE");
      return;
    }
    startConsole();
    return;
  }

  if (!consoleActive) {
    displayToConsole("> ERROR: CONSOLE NOT STARTED. TYPE 'START' FIRST.");
    return;
  }

  // Comandi attivi solo dopo START
  switch (command) {
    case "GAME":
      await launchGame();
      break;
    case "INFO":
      displayToConsole("> SEREN.EXE INTERACTIVE SYSTEM ONLINE.");
      break;
    case "STORY":
      displayToConsole("> DATA STREAM UNAVAILABLE...");
      break;
    case "TOKENOMICS":
      displayToConsole("> ACCESS DENIED.");
      break;
    default:
      displayToConsole("> UNKNOWN COMMAND");
  }
}

function startConsole() {
  consoleActive = true;
  inputLocked = true;

  displayToConsole("⟟⟒⟊ SYSTEM BOOTING...");
  setTimeout(() => displayToConsole("LOADING CORE FILES..."), 1000);
  setTimeout(() => displayToConsole("INITIALIZING MEMORY MODULES..."), 2000);
  setTimeout(() => displayToConsole("DECRYPTING SYSTEM HASH..."), 3000);
  setTimeout(() => {
    displayToConsole("BOOT COMPLETE.");
    displayToConsole("> TYPE 'HELP' FOR COMMANDS.");
    inputLocked = false;
  }, 4000);
}

// === TOGGLE GLOBALE ADMIN ===
async function getGameState() {
  try {
    const res = await fetch("/api/gameState");
    if (!res.ok) throw new Error("Response not OK");
    const data = await res.json();
    return data.state || "OFF";
  } catch (err) {
    console.error("Error fetching game state:", err);
    displayToConsole("> ERROR FETCHING GAME STATE\n> ERROR: COMMUNICATION WITH SERVER FAILED");
    return "OFF";
  }
}

async function toggleGameState(newState) {
  try {
    const res = await fetch("/api/gameState", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: newState }),
    });

    if (!res.ok) throw new Error("Bad response from server");
    const data = await res.json();

    if (data.success) {
      displayToConsole(`> GAME STATE CHANGED TO ${newState}`);
      updateToggleUI(newState);
    } else {
      displayToConsole("> FAILED TO UPDATE GAME STATE");
    }
  } catch (err) {
    console.error("Error updating game state:", err);
    displayToConsole("> ERROR COMMUNICATING WITH SERVER");
  }
}

function updateToggleUI(state) {
  const indicator = document.getElementById("gameStateIndicator");
  const toggleBtn = document.getElementById("toggleButton");
  if (state === "ON") {
    indicator.textContent = "ON";
    indicator.style.color = "#00FF00";
    toggleBtn.dataset.state = "ON";
  } else {
    indicator.textContent = "OFF";
    indicator.style.color = "#FF4444";
    toggleBtn.dataset.state = "OFF";
  }
}

function setupAdminToggle() {
  const sIcon = document.getElementById("adminIcon");
  const panel = document.getElementById("adminPanel");
  const passwordInput = document.getElementById("adminPassword");
  const toggleBtn = document.getElementById("toggleButton");

  sIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.style.display = "flex";
    passwordInput.focus();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== sIcon) {
      panel.style.display = "none";
    }
  });

  document.getElementById("adminLogin").addEventListener("click", async () => {
    if (passwordInput.value === "Seren1987") {
      panel.style.display = "none";
      document.getElementById("adminControls").style.display = "flex";
      const state = await getGameState();
      updateToggleUI(state);

      toggleBtn.addEventListener("click", async () => {
        const current = toggleBtn.dataset.state;
        const newState = current === "ON" ? "OFF" : "ON";
        await toggleGameState(newState);
      });
    } else {
      alert("Incorrect password");
    }
  });
}

// === LANCIA IL GIOCO ===
async function launchGame() {
  const state = await getGameState();
  if (state !== "ON") {
    displayToConsole("> ERROR: GAME NOT AVAILABLE. ACTIVATION AT 150K MC.");
    return;
  }
  displayToConsole("> GAME INITIALIZED...");
  import("./game.js").then((module) => module.startGame(displayToConsole));
}
