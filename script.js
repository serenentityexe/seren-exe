// CONFIG
const API_BASE = "https://api-serenexe.vercel.app"; // URL backend API

// ELEMENTS
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");
const adminTrigger = document.getElementById("admin-trigger");
const adminPanel = document.getElementById("admin-panel");
const adminPasswordInput = document.getElementById("admin-password");
const loginBtn = document.getElementById("login-admin");
const toggleContainer = document.getElementById("toggle-container");
const toggleBtn = document.getElementById("toggle-btn");

let gameEnabled = false;
let adminLogged = false;

// --- Terminal logic ---
function printToTerminal(text) {
  const line = document.createElement("div");
  line.textContent = `> ${text}`;
  terminalOutput.prepend(line);
}

async function fetchGameState() {
  try {
    const res = await fetch(`${API_BASE}/api/game/state`);
    const data = await res.json();
    gameEnabled = data.enabled;
    updateToggle();
  } catch {
    printToTerminal("ERROR FETCHING GAME STATE");
  }
}

function updateToggle() {
  toggleBtn.textContent = gameEnabled ? "ON" : "OFF";
  toggleBtn.classList.toggle("on", gameEnabled);
}

terminalInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const cmd = terminalInput.value.trim().toUpperCase();
    terminalInput.value = "";
    if (!cmd) return;

    printToTerminal(cmd);

    if (cmd === "START") {
      printToTerminal("SYSTEM BOOTING...");
      await fetchGameState();
    } else if (cmd === "GAME") {
      if (gameEnabled) startGame();
      else printToTerminal("GAME UNAVAILABLE. WAIT FOR ACTIVATION (150K MC).");
    } else if (cmd === "CLEAR") {
      terminalOutput.innerHTML = "";
    } else if (cmd === "QUIT") {
      printToTerminal("CLOSING SEREN.EXE...");
    } else {
      printToTerminal("UNKNOWN COMMAND");
    }
  }
});

// --- Admin logic ---
adminTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  adminPanel.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!adminPanel.contains(e.target) && e.target !== adminTrigger) {
    adminPanel.classList.add("hidden");
  }
});

loginBtn.addEventListener("click", async () => {
  const password = adminPasswordInput.value.trim();
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (data.success) {
    adminLogged = true;
    toggleContainer.classList.remove("hidden");
    printToTerminal("ADMIN LOGGED IN.");
  } else {
    printToTerminal("ACCESS DENIED.");
  }
});

toggleBtn.addEventListener("click", async () => {
  if (!adminLogged) return;
  gameEnabled = !gameEnabled;
  updateToggle();

  try {
    await fetch(`${API_BASE}/api/game/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: gameEnabled }),
    });
    printToTerminal(`GAME STATE UPDATED: ${gameEnabled ? "ON" : "OFF"}`);
  } catch {
    printToTerminal("ERROR UPDATING GAME STATE");
  }
});
