const terminal = document.getElementById("terminal");
const input = document.getElementById("commandInput");
const symbol = document.getElementById("symbol");
const adminPanel = document.getElementById("adminPanel");
const adminPassword = document.getElementById("adminPassword");
const adminLogin = document.getElementById("adminLogin");

let gameActive = false;

// === Admin Panel Toggle ===
symbol.addEventListener("click", (e) => {
  e.stopPropagation();
  adminPanel.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!adminPanel.classList.contains("hidden") && !adminPanel.contains(e.target) && e.target !== symbol) {
    adminPanel.classList.add("hidden");
  }
});

// === Admin Login ===
adminLogin.addEventListener("click", async () => {
  const password = adminPassword.value.trim();
  if (!password) return;

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (data.success) {
    addLine("ADMIN LOGIN SUCCESSFUL", "success");
    adminPanel.classList.add("hidden");
  } else {
    addLine("ACCESS DENIED", "error");
  }
});

// === Commands ===
input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const command = input.value.trim().toUpperCase();
    input.value = "";
    addLine("> " + command, "system");

    switch (command) {
      case "HELP":
        addLine("Commands: START, GAME, INFO, TOKENOMICS, QUIT, CLEAR", "hint");
        break;
      case "CLEAR":
        terminal.innerHTML = "";
        break;
      case "START":
        bootSequence();
        break;
      case "GAME":
        if (gameActive) {
          addLine("GAME MODE ENGAGED", "system");
          startGameSession();
        } else {
          addLine("GAME MODE DISABLED (Server OFF)", "error");
        }
        break;
      case "QUIT":
        addLine("SESSION TERMINATED", "system");
        break;
      default:
        addLine("UNKNOWN COMMAND", "error");
    }
  }
});

// === Boot Sequence ===
async function bootSequence() {
  terminal.innerHTML = "";
  addLine("SYSTEM BOOTING...", "system");
  await new Promise((r) => setTimeout(r, 1000));
  addLine("CHECKING CONNECTION TO SERVER...", "system");

  try {
    const res = await fetch("/api/game/state");
    const data = await res.json();
    if (data.success) {
      gameActive = data.state === "on";
      addLine(`SERVER STATUS: ${data.state.toUpperCase()}`, data.state === "on" ? "success" : "error");
    } else {
      addLine("ERROR FETCHING GAME STATE", "error");
    }
  } catch (err) {
    addLine("CONNECTION FAILED", "error");
  }
}

function addLine(text, type = "system") {
  const div = document.createElement("div");
  div.classList.add(type);
  div.textContent = text;
  terminal.prepend(div);
}
