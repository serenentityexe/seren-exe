// === Seren.exe Game Engine ===
// Tutti i dati vengono salvati nel browser (localStorage)

function startGameSession() {
  const terminal = document.getElementById("terminal");

  // Recupera stato del gioco utente
  let userProgress = JSON.parse(localStorage.getItem("seren_progress")) || {
    level: 1,
    solved: false,
  };

  addGameMessage("Welcome back, Operator.", "system");
  addGameMessage(`Resuming at Level ${userProgress.level}`, "system");

  // Avvia livello attuale
  loadLevel(userProgress.level);

  // Funzione di caricamento livello
  function loadLevel(level) {
    switch (level) {
      case 1:
        levelOne();
        break;
      case 2:
        levelTwo();
        break;
      default:
        addGameMessage("No further levels available yet.", "system");
    }
  }

  // Gestione input utente per i livelli
  const inputField = document.getElementById("commandInput");
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const command = inputField.value.trim();
      if (!command) return;
      handleCommand(command);
      inputField.value = "";
    }
  });

  // === Livello 1 ===
  function levelOne() {
    addGameMessage("LEVEL 1 — ENCRYPTED TRANSMISSION DETECTED.", "system");
    addGameMessage("Decrypt the following cipher:", "system");
    addGameMessage("Cipher → Xli Uymgo Fvsar!", "puzzle");
    addGameMessage("Hint: Caesar cipher, shift = 4.", "hint");
    userProgress.solved = false;
  }

  // === Livello 2 ===
  function levelTwo() {
    addGameMessage("LEVEL 2 — ANAGRAM INTERCEPTED.", "system");
    addGameMessage("Unscramble this message:", "system");
    addGameMessage("Cipher → 'RNEES .EXE'", "puzzle");
    addGameMessage("Hint: Something you’re already inside...", "hint");
    userProgress.solved = false;
  }

  // === Risposte corrette per i livelli ===
  function handleCommand(command) {
    const normalized = command.trim().toLowerCase();

    if (userProgress.level === 1) {
      if (normalized === "the quick brown!") {
        addGameMessage("ACCESS GRANTED. Proceeding to Level 2...", "success");
        userProgress.level = 2;
        userProgress.solved = true;
        localStorage.setItem("seren_progress", JSON.stringify(userProgress));
        setTimeout(() => loadLevel(2), 1500);
      } else {
        addGameMessage("INCORRECT. Try again.", "error");
      }
    } else if (userProgress.level === 2) {
      if (normalized === "seren.exe" || normalized === "serenexe") {
        addGameMessage("CONNECTION ESTABLISHED. You’ve solved Level 2.", "success");
        userProgress.level = 3;
        userProgress.solved = true;
        localStorage.setItem("seren_progress", JSON.stringify(userProgress));
        addGameMessage("To be continued...", "system");
      } else {
        addGameMessage("INCORRECT. The system rejects your input.", "error");
      }
    } else {
      addGameMessage("No more levels available.", "system");
    }
  }

  // === Utility per messaggi ===
  function addGameMessage(message, type = "system") {
    const line = document.createElement("div");
    line.classList.add(type);
    line.textContent = `> ${message}`;
    terminal.prepend(line);
  }
}
