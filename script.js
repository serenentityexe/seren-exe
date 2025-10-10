// === Seren.exe Terminal Script ===

const container = document.getElementById("lines-container");
const inputField = document.getElementById("command");
const systemData = document.getElementById("system-data");

let consoleActive = false;
let gameActive = false;
let inputLocked = false;
let currentLevel = 1;
let gameProgress = {};

let userId = localStorage.getItem("serenUserId");
if (!userId) {
  userId = "user-" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("serenUserId", userId);
}

// ==============================
//    SYSTEM DISPLAY FUNCTIONS
// ==============================
function displayToConsole(text, newTop = true) {
  const line = document.createElement("div");
  line.className = "output-line";
  line.innerHTML = text;
  if (newTop) container.insertBefore(line, container.firstChild);
  else container.appendChild(line);

  // Fade out overflowed lines
  const wrapRect = document.getElementById("output-wrapper").getBoundingClientRect();
  const nodes = Array.from(container.querySelectorAll(".output-line"));
  nodes.forEach(node => {
    const r = node.getBoundingClientRect();
    if (r.bottom > wrapRect.bottom - 6) {
      node.classList.add("fade-out");
      setTimeout(() => node.remove(), 420);
    }
  });
}

// ==============================
//      SYSTEM DATA SIMULATOR
// ==============================
function updateSystemData() {
  const cpu = (Math.random() * 100).toFixed(1);
  const ram = (Math.random() * 32).toFixed(1);
  const uptime = Math.floor(Math.random() * 50000);
  const entropy = Math.floor(Math.random() * 99999);
  const misc1 = Math.floor(Math.random() * 999999);
  const misc2 = (Math.random() * 100).toFixed(2);
  systemData.innerHTML = `
    TIME: ${new Date().toLocaleTimeString()}<br>
    CPU: ${cpu}%<br>
    RAM: ${ram}GB<br>
    UPTIME: ${uptime}s<br>
    ENTITY ENTROPY: ${entropy}<br>
    PROC A: ${misc1}<br>
    PROC B: ${misc2}
  `;
}
setInterval(updateSystemData, 2000);
updateSystemData();

// ==============================
//       COMMAND HANDLER
// ==============================
inputField.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;

  const input = inputField.value.trim();
  inputField.value = "";

  // consentire sempre START e HELP
  if (input.toUpperCase() === "START" || input.toUpperCase() === "HELP") {
    handleCommand(input);
    return;
  }

  // blocca input durante processi
  if (inputLocked) {
    displayToConsole("> SYSTEM BUSY... PLEASE WAIT");
    return;
  }

  handleCommand(input);
});

function handleCommand(raw) {
  const cmd = raw.trim().toUpperCase();
  if (!cmd) return;

  if (cmd === "HELP") {
    displayToConsole("[START]  [GAME]  [INFO]  [TOKENOMICS]  [CLEAR]  [QUIT]");
    return;
  }

  if (cmd === "START") {
    if (consoleActive) {
      displayToConsole("> CONSOLE ALREADY ACTIVE");
      return;
    }
    startConsole();
    return;
  }

  if (!consoleActive) {
    displayToConsole("> ERROR: SYSTEM NOT INITIALIZED");
    displayToConsole("TYPE 'START' TO BOOT SYSTEM");
    return;
  }

  switch (cmd) {
    case "CLEAR":
      container.innerHTML = "";
      break;
    case "QUIT":
      displayToConsole("> SYSTEM EXITING...");
      consoleActive = false;
      break;
    case "INFO":
      displayToConsole("_ENTITY ID: SEREN.EXE_");
      break;
    case "TOKENOMICS":
      displayToConsole("> TOKENOMICS DATA UNAVAILABLE...");
      break;
    case "GAME":
      if (!gameActive) {
        displayToConsole("> GAME NOT AVAILABLE. WILL OPEN AT 150K MC.");
        return;
      }
      startGame();
      break;
    default:
      displayToConsole("> ERROR 0x1F4: UNKNOWN COMMAND");
      displayToConsole("TYPE 'HELP' FOR AVAILABLE COMMANDS");
  }
}

// ==============================
//       START CONSOLE
// ==============================
function startConsole() {
  consoleActive = true;
  inputLocked = true;
  const bootLines = [
    "_SYSTEM BOOTING..._",
    "_LOADING CORE FILES_",
    "_INITIALIZING NEURAL MEMORY BANKS_",
    "_SIGNAL DETECTED..._",
    "_THE ENTITY IS AWAKE..._",
  ];
  let delay = 0;
  bootLines.forEach((t) => {
    setTimeout(() => displayToConsole(t), delay);
    delay += 600;
  });
  setTimeout(() => {
    displayToConsole("BOOT COMPLETE.");
    displayToConsole("> TYPE 'HELP' FOR COMMANDS.");
    inputLocked = false; // ✅ sblocca input
    inputField.focus();
  }, delay + 800);
}

// ==============================
//        GAME LOADER
// ==============================
async function startGame() {
  displayToConsole("> GAME MODULE LOADING...");
  try {
    const module = await import("./game.js");
    module.launchGame(displayToConsole, userId);
  } catch (e) {
    console.error(e);
    displayToConsole("> ERROR LOADING GAME MODULE");
  }
}

// ==============================
//         FETCH GAME STATE
// ==============================
async function fetchGameState() {
  try {
    const res = await fetch("/api/gameState");
    if (!res.ok) throw new Error("HTTP ERROR");
    const data = await res.json();
    gameActive = data.gameAvailable;
    updateGameStatusText();
  } catch (e) {
    console.error("ERROR FETCHING GAME STATE", e);
    displayToConsole("> ERROR: COMMUNICATION WITH SERVER FAILED");
  }
}
fetchGameState();

// ==============================
//       ADMIN PANEL LOGIC
// ==============================
const adminIcon = document.getElementById("admin-icon");
const adminPanel = document.getElementById("admin-panel");
const adminPassInput = document.getElementById("admin-pass");
const adminLoginBtn = document.getElementById("admin-login");
const adminControls = document.getElementById("admin-controls");
const toggleGameBtn = document.getElementById("toggle-game");
const gameStatus = document.getElementById("game-status");

function updateGameStatusText() {
  gameStatus.textContent = gameActive ? "Game: ON" : "Game: OFF";
  gameStatus.style.color = gameActive ? "#00ff88" : "#ff3333";
}

adminIcon.addEventListener("click", () => {
  adminPanel.style.display = "block";
  adminPassInput.focus();
});

document.addEventListener("click", (e) => {
  if (!adminPanel.contains(e.target) && e.target !== adminIcon) {
    adminPanel.style.display = "none";
  }
});

adminLoginBtn.addEventListener("click", async () => {
  if (adminPassInput.value === "Seren1987") {
    adminControls.style.display = "flex";
    adminPassInput.style.display = "none";
    adminLoginBtn.style.display = "none";
  } else {
    alert("Wrong password.");
  }
});

toggleGameBtn.addEventListener("click", async () => {
  const newState = !gameActive;
  try {
    const res = await fetch("/api/updateGameState", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: "Seren1987",
        gameAvailable: newState,
      }),
    });
    const data = await res.json();
    if (data.success) {
      gameActive = data.gameAvailable;
      updateGameStatusText();
      displayToConsole(`> GAME STATE SET TO ${gameActive ? "ON" : "OFF"} BY ADMIN`);
    } else {
      displayToConsole("> ERROR: SERVER REFUSED UPDATE");
    }
  } catch (e) {
    console.error(e);
    displayToConsole("> ERROR COMMUNICATING WITH SERVER");
  }
});
