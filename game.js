// game.js — Seren.exe Encrypted Game Logic (2 livelli demo)

export function startGame(display) {
  display("> WELCOME TO SEREN.EXE // ENCRYPTION MODULE ACTIVE");
  display("> SOLVE EACH LEVEL TO PROGRESS.\n");

  const userProgress = parseInt(localStorage.getItem("seren_level") || "1");
  runLevel(userProgress, display);
}

function runLevel(level, display) {
  switch (level) {
    case 1:
      levelOne(display);
      break;
    case 2:
      levelTwo(display);
      break;
    default:
      display("> ALL LEVELS COMPLETED — SYSTEM IDLE.");
  }
}

// === LIVELLO 1: Cifrario ===
function levelOne(display) {
  const encrypted = "KHOOR ZRUOG"; // Hello World cifrato (Cesare +3)
  display("> LEVEL 1: DECRYPT THE FOLLOWING MESSAGE:");
  display(`> ${encrypted}`);
  display("> USE A CAESAR SHIFT TO FIND THE PLAIN TEXT.");

  const input = document.getElementById("console-input");
  input.addEventListener("keydown", function handler(e) {
    if (e.key === "Enter") {
      const answer = input.value.trim().toUpperCase();
      if (answer === "HELLO WORLD") {
        display("> CORRECT. LEVEL 1 COMPLETE.");
        localStorage.setItem("seren_level", "2");
        input.removeEventListener("keydown", handler);
        setTimeout(() => runLevel(2, display), 1000);
      } else {
        display("> INCORRECT. TRY AGAIN.");
      }
      input.value = "";
    }
  });
}

// === LIVELLO 2: Anagramma ===
function levelTwo(display) {
  const scrambled = "EERNXES";
  display("> LEVEL 2: UNSCRAMBLE THE WORD:");
  display(`> ${scrambled}`);

  const input = document.getElementById("console-input");
  input.addEventListener("keydown", function handler(e) {
    if (e.key === "Enter") {
      const answer = input.value.trim().toUpperCase();
      if (answer === "SERENEXE" || answer === "SEREN.EXE") {
        display("> WELL DONE. YOU HAVE UNLOCKED THE CORE.");
        localStorage.setItem("seren_level", "3");
        input.removeEventListener("keydown", handler);
        display("> END OF DEMO BUILD.");
      } else {
        display("> WRONG. TRY AGAIN.");
      }
      input.value = "";
    }
  });
}
