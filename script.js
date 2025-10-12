const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");
const adminPanel = document.getElementById("admin-panel");
const adminPassword = document.getElementById("admin-password");
const toggleGameBtn = document.getElementById("toggle-game");

let systemStarted = false;
let gameActive = false; // Stato globale, sincronizzato con Upstash

// Simula scrittura come Seren
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

// Boot testuale
async function startSystem() {
    await serenWrite("Inizializzazione sistema SerenOS v1.0...");
    await serenWrite("[####..........] 25%");
    await serenWrite("[########......] 50%");
    await serenWrite("[############..] 90%");
    await serenWrite("Sistema pronto.\n");
    systemStarted = true;
}

// Comandi
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
            terminalOutput.innerHTML += "Sistema SerenOS v1.0 - Terminale futuristico interattivo\n";
            break;
        case "GAME":
            if (gameActive) {
                terminalOutput.innerHTML += "Avvio gioco Seren.exe...\n";
            } else {
                terminalOutput.innerHTML += "Il gioco non è attivo.\n";
            }
            break;
        default:
            terminalOutput.innerHTML += "Comando non riconosciuto.\n";
    }
}

// Input
terminalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const cmd = terminalInput.value;
        terminalOutput.innerHTML += `⟟⟒⟊ ${cmd}\n`;
        terminalInput.value = "";
        handleCommand(cmd);
    }
});

// Admin panel toggle
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "A") { // Ctrl+A per aprire pannello admin
        adminPanel.classList.remove("hidden");
    }
});
document.addEventListener("click", (e) => {
    if (!adminPanel.contains(e.target)) adminPanel.classList.add("hidden");
});

// Admin login
toggleGameBtn.addEventListener("click", () => {
    if (adminPassword.value === "Seren1987") {
        gameActive = !gameActive;
        terminalOutput.innerHTML += `Gioco ${gameActive ? "attivato" : "disattivato"} dal pannello admin.\n`;
        adminPanel.classList.add("hidden");
    } else {
        terminalOutput.innerHTML += "Password admin errata.\n";
    }
});
