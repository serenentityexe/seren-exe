// Game module for Seren.exe
// Gestisce logica, livelli e progressi salvati via API

import { enqueueLine } from "./script.js"; // Assumiamo che enqueueLine sia esportato per mostrare messaggi

let currentLevel = 1;
let gameProgress = {};
let gameInterval = null;

export function startGame(level = 1) {
  currentLevel = level;
  enqueueLine(`> STARTING GAME AT LEVEL ${currentLevel}...`, false, true);

  if (gameInterval) clearInterval(gameInterval);
  
  // Simula avanzamento del gioco ogni 2 secondi
  gameInterval = setInterval(() => {
    playTurn();
  }, 2000);
}

async function playTurn() {
  // Simula un punteggio o progresso
  const points = Math.floor(Math.random() * 10 + 1);
  gameProgress.score = (gameProgress.score || 0) + points;
  
  enqueueLine(`> LEVEL ${currentLevel}: +${points} POINTS (TOTAL: ${gameProgress.score})`, false, true);

  // Simula completamento livello
  if (Math.random() > 0.7) {
    currentLevel++;
    enqueueLine(`> LEVEL UP! NOW AT LEVEL ${currentLevel}`, false, true);
  }

  // Salva progresso in Redis via API
  await saveProgress();
}

async function saveProgress() {
  const userId = localStorage.getItem("serenUserId");
  if (!userId) return;

  try {
    await fetch("https://api-cyan-seven-42.vercel.app/api/saveUserData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, value: { level: currentLevel, progressData: gameProgress } })
    });
  } catch (e) {
    console.error("Error saving game progress:", e);
    enqueueLine("> ERROR SAVING GAME PROGRESS", false, true);
  }
}

export function stopGame() {
  if (gameInterval) clearInterval(gameInterval);
  enqueueLine("> GAME STOPPED", false, true);
}
