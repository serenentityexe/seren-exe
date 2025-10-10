// Seren.exe terminal logic (frontend)

// 🔹 Base API endpoint (vercel backend)
const API_BASE = "https://api-ten-inky-24.vercel.app";

const container = document.getElementById("lines-container");
const input = document.getElementById("command");
const systemData = document.getElementById("system-data");

let systemStarted = false,
  gameActive = false;
let currentLevel = 1;
let gameProgress = {};

let userId = localStorage.getItem("serenUserId");
if (!userId) {
  userId = "user-" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("serenUserId", userId);
}

const INTRO = [
  "_SYSTEM BOOTING..._",
  "_LOADING CORE FILES_",
  "_INITIALIZING NEURAL MEMORY BANKS_",
  "_SIGNAL DETECTED..._",
  "_THE ENTITY IS AWAKE..._",
  "_ENTER THE SYSTEM, IF YOU DARE..._",
];
const HELP_COMMANDS = ["START", "GAME", "INFO", "TOKENOMICS", "CLEAR", "QUIT"];
const ERRORS = ["> ERROR 0x1F4: UNRECOGNIZED COMMAND..."];

function nowTime() {
  return new Date().toLocaleTimeString();
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- SYSTEM DATA ----
function updateSystemData() {
  const cpu = (Math.random() * 100).toFixed(1),
    ram = (Math.random() * 32).toFixed(1),
    uptime = Math.floor(Math.random() * 50000),
    entropy = Math.floor(Math.random() * 99999),
    misc1 = Math.floor(Math.random() * 999999),
    misc2 = (Math.random() * 100).toFixed(2);
  systemData.innerHTML = `TIME: ${nowTime()}<br>CPU: ${cpu}%<br>RAM: ${ram}GB<br>UPTIME: ${uptime}s<br>ENTITY ENTROPY: ${entropy}<br>PROC A: ${misc1}<br>PROC B: ${misc2}`;
}
setInterval(updateSystemData, 2000);
updateSystemData();

// ---- TERMINAL EFFECTS ----
let newLinesFixed = [],
  oldLinesQueue = [],
  typing = false;

function enqueueLine(text, fast = false, newText = false) {
  if (newText) {
    const line = document.createElement("div");
    line.className = "output-line";
    line.innerHTML = "";
    container.insertBefore(line, container.firstChild);
    newLinesFixed.push({ el: line, text, fast });
    if (!typing) typeNewLines();
  } else {
    oldLinesQueue.push({ text, fast });
    if (!typing) typeOldLines();
  }
}

function typeNewLines() {
  if (newLinesFixed.length === 0) {
    typing = false;
    return;
  }
  typing = true;
  const obj = newLinesFixed.shift();
  const line = obj.el;
  const text = obj.text;
  const fast = obj.fast;
  let i = 0;
  function typeChar() {
    if (i < text.length) {
      line.innerHTML += text[i++];
      setTimeout(typeChar, fast ? 8 : 25 + Math.random() * 50);
    } else typeNewLines();
  }
  typeChar();
}

function typeOldLines() {
  if (oldLinesQueue.length === 0) {
    typing = false;
    return;
  }
  typing = true;
  const obj = oldLinesQueue.shift();
  const line = document.createElement("div");
  line.className = "output-line";
  line.innerHTML = "";
  container.appendChild(line);
  let i = 0,
    shift = 0;
  function typeChar() {
    if (i < obj.text.length) {
      line.innerHTML += obj.text[i++];
      shift += 0.5;
      line.style.transform = `translateY(${shift}px)`;
      setTimeout(typeChar, obj.fast ? 8 : 25 + Math.random() * 50);
    } else {
      removeOverflowBottom();
      typeOldLines();
    }
  }
  typeChar();
}

function removeOverflowBottom() {
  const nodes = Array.from(container.querySelectorAll(".output-line"));
  const wrapRect = document
    .getElementById("output-wrapper")
    .getBoundingClientRect();
  nodes.forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.bottom > wrapRect.bottom - 6) {
      node.classList.add("fade-out");
      setTimeout(() => {
        if (node.parentElement) node.remove();
      }, 420);
    }
  });
}

function showHelp() {
  enqueueLine(HELP_COMMANDS.map((c) => `[${c}]`).join("  "), false, true);
}

// ---- API HANDLERS ----
async function fetchGameState() {
  try {
    const res = await fetch(`${API_BASE}/api/gameState`);
    const data = await res.json();
    gameActive = data.gameAvailable;
    updateGameStatusText();
  } catch (e) {
    console.error("Error fetching game state:", e);
    enqueueLine("> ERROR FETCHING GAME STATE", false, true);
  }
}
fetchGameState();

function updateGameStatusText() {
  const span = document.getElementById("game-status");
  if (span) span.textContent = gameActive ? "Game: ON" : "Game: OFF";
}

async function saveUserData() {
  const userData = { level: currentLevel, progressData: gameProgress };
  try {
    await fetch(`${API_BASE}/api/saveUserData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userData }),
    });
  } catch (e) {
    console.error("Errore salvataggio dati utente", e);
  }
}

async function loadUserData() {
  try {
    const res = await fetch(`${API_BASE}/api/getUserData?userId=${userId}`);
    const data = await res.json();
    if (data.userData && data.userData.level) {
      currentLevel = data.userData.level;
      gameProgress = data.userData.progressData || {};
    }
  } catch (e) {
    console.error("Errore caricamento dati utente", e);
  }
}
loadUserData();

// ---- COMMAND HANDLING ----
function handleCommandRaw(raw) {
  const cmd = (raw || "").trim().toLowerCase();
  if (!cmd) return;
  if (cmd === "help") {
    showHelp();
    return;
  }
  if (cmd === "start") {
    systemStarted = true;
    INTRO.forEach((t) => enqueueLine(t, false, true));
    return;
  }
  if (cmd === "clear") {
    container.innerHTML = "";
    newLinesFixed = [];
    oldLinesQueue = [];
    return;
  }
  if (cmd === "quit") {
    enqueueLine("> SYSTEM EXITING...", false, true);
    return;
  }

  if (!systemStarted) {
    enqueueLine(pick(ERRORS), true, true);
    enqueueLine("TYPE 'START' TO INITIALIZE.", true, true);
    return;
  }

  switch (cmd) {
    case "info":
      enqueueLine("_ENTITY ID: SEREN.EXE_", false, true);
      break;
    case "tokenomics":
      enqueueLine("> TOKENOMICS DATA UNAVAILABLE...", false, true);
      break;
    case "game":
      if (!gameActive) {
        enqueueLine("> GAME NOT AVAILABLE. WILL OPEN AT 150k MC.", false, true);
        break;
      }
      enqueueLine("> GAME MODULE LOADING...", false, true);
      enqueueLine("> WELCOME TO SEREN.EXE GAME...", false, true);
      import("./game.js").then((m) => m.startGame(currentLevel));
      break;
    default:
      enqueueLine(pick(ERRORS), true, true);
      enqueueLine("TYPE 'HELP' FOR AVAILABLE COMMANDS.", true, true);
  }
}

input.addEventListener("keydown", (ev) => {
  if (ev.key !== "Enter") return;
  ev.preventDefault();
  const value = input.value;
  input.value = "";
  handleCommandRaw(value);
  saveUserData();
});

let inactivityTimer = null;
function resetInactivity() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    enqueueLine("THE ENTITY WATCHES YOU...", true, false);
  }, 10000);
}
["keydown", "mousemove", "mousedown", "touchstart"].forEach((e) =>
  window.addEventListener(e, resetInactivity)
);
resetInactivity();

setInterval(() => {
  document.getElementById("output-wrapper").classList.add("glitch");
  setTimeout(
    () =>
      document.getElementById("output-wrapper").classList.remove("glitch"),
    220
  );
}, 8000);

function poll() {
  if (!typing && (oldLinesQueue.length > 0 || newLinesFixed.length > 0)) {
    typeNewLines();
    typeOldLines();
  }
  requestAnimationFrame(poll);
}
poll();

// ---- ADMIN PANEL ----
const adminPanel = document.getElementById("admin-panel");
const adminLoginBtn = document.getElementById("admin-login");
const adminPassInput = document.getElementById("admin-pass");
const adminControls = document.getElementById("admin-controls");
const toggleGameBtn = document.getElementById("toggle-game");

adminPanel.style.display = "block";

adminLoginBtn.addEventListener("click", async () => {
  if (adminPassInput.value === "Seren1987") {
    adminControls.style.display = "block";
    adminPassInput.style.display = "none";
    adminLoginBtn.style.display = "none";
  }
});

toggleGameBtn.addEventListener("click", async () => {
  const newState = !gameActive;
  try {
    await fetch(`${API_BASE}/api/game/state`);
    await fetch(`${API_BASE}/api/admin/login`, { ... });
}
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "Seren1987", gameAvailable: newState }),
    });
    const data = await res.json();
    if (data.success) {
      gameActive = data.gameAvailable;
      updateGameStatusText();
      enqueueLine(`> GAME STATE SET TO ${gameActive ? "ON" : "OFF"} BY ADMIN`, false, true);
    } else {
      enqueueLine("> ERROR UPDATING GAME STATE", false, true);
    }
  } catch (e) {
    enqueueLine("> ERROR UPDATING GAME STATE", false, true);
    console.error("Error updating game state:", e);
  }
});
