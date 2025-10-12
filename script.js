const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");
const adminPanel = document.getElementById("admin-panel");
const adminPassword = document.getElementById("admin-password");
const toggleGameBtn = document.getElementById("toggle-game");

let systemStarted = false;
let gameActive = false;

// Funzione per scrivere come Seren
function serenWrite(text, delay = 50) {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        terminalOutput.innerHTML += text[i];
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
        terminalOutput.innerHTML += "\n";
        resolve();
      }
    }, delay);
  });
}

// Effetto glitch
function glitchText(text) {
  return `<span class="glitch" data-text="${text}">${text}</span>`;
}

// Boot testuale
async function startSystem() {
  await serenWrite("Inizializzazione sistema SerenOS v1.0...");
  await serenWrite("[####..........] 25%");
  await serenWrite("[########......] 50%");
  await serenWrite("[############..] 90%");
  await serenWrite(glitchText("Sistema pronto.\n"));
  systemStarted = true;
  await fetchGameState();
}

// Upstash API
const API_URL = "https://api-cyan-seven-42.vercel.app/api/game";

async function fetchGameState() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    gameActive = data.gameActive;
  } catch {
    terminalOutput.innerHTML += "Errore connessione API.\n";
  }
}

async function toggleGameAdmin() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameActive: !gameActive }),
    });
    const data = await res.json();
    gameActive = data.gameActive;
    terminalOutput.innerHTML += `Gioco ${gameActive ? "attivato" : "disattivato"} dal pannello admin.\n`;
  } catch {
    terminalOutput.innerHTML += "Errore aggiornamento stato gioco.\n";
  }
}

// Comandi terminale
async function handleCommand(cmd) {
  const command = cmd.trim().toUpperCase();

  if (!systemStarted && command !== "START") {
    terminalOutput.innerHTML += "Sistema non avviato. Digita START.\n";
    return;
  }

  switch (command) {
    case "START":
      if (!systemStarted) await startSystem();
      else terminalOutput.innerHTML += "Sistema già avviato.\n";
      break;
    case "CLEAR":
      terminalOutput.innerHTML = "";
      break;
    case "INFO":
      terminalOutput.innerHTML += glitchText(
        "SerenOS v1.0 - Terminale futuristico interattivo\nAutore: Seren\nFunzioni: Boot testuale, gioco, pannello admin\n"
      );
      break;
    case "GAME":
      if (gameActive) terminalOutput.innerHTML += glitchText("Avvio gioco Seren.exe...\n");
      else terminalOutput.innerHTML += "Il gioco non è attivo.\n";
      break;
    default:
      terminalOutput.innerHTML += "Comando non riconosciuto.\n";
  }

  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Input terminale
terminalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const cmd = terminalInput.value;
    terminalOutput.innerHTML += `⟟⟒⟊ ${cmd}\n`;
    terminalInput.value = "";
    handleCommand(cmd);
  }
});

// Pannello admin (Ctrl+A)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "A") {
    adminPanel.classList.remove("hidden");
    adminPassword.focus();
  }
});
document.addEventListener("click", (e) => {
  if (!adminPanel.contains(e.target)) adminPanel.classList.add("hidden");
});

// Toggle gioco admin
toggleGameBtn.addEventListener("click", () => {
  if (adminPassword.value === "Seren1987") {
    toggleGameAdmin();
    adminPanel.classList.add("hidden");
    adminPassword.value = "";
  } else terminalOutput.innerHTML += "Password admin errata.\n";
});

// Aggiorna stato globale all'apertura
fetchGameState();
