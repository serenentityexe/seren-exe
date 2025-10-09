if(window.serenGameLoaded) throw new Error("Game already loaded");

window.serenGameLoaded = true;
enqueueLine("> INITIALIZING GAME MODULE...", false, true);

const levels = [
  { question: "ANAGRAM: 'RAET'", answer: "TEAR" },
  { question: "CIPHER: shift 1 'BCD'", answer: "ABC" },
  { question: "ANAGRAM: 'NOMUS'", answer: "MUSON" }
];

let currentLevelIndex = 0;
const gameProgressKey = 'serenGameProgress';
let progress = JSON.parse(localStorage.getItem(gameProgressKey)) || { level: 0 };
currentLevelIndex = progress.level || 0;

function showLevel(levelIndex){
  if(levelIndex >= levels.length){
    enqueueLine("> YOU HAVE COMPLETED ALL LEVELS! CONGRATULATIONS!", false, true);
    return;
  }
  const level = levels[levelIndex];
  enqueueLine(`> LEVEL ${levelIndex+1}: ${level.question}`, false, true);
}
showLevel(currentLevelIndex);

// Funzione globale per ricevere input dal terminale
window.serenGameInputHandler = function(userInput){
  const answer = userInput.trim().toUpperCase();
  const level = levels[currentLevelIndex];
  if(!level) return;

  if(answer === level.answer.toUpperCase()){
    enqueueLine("> CORRECT!", false, true);
    currentLevelIndex++;
    localStorage.setItem(gameProgressKey, JSON.stringify({ level: currentLevelIndex }));
    showLevel(currentLevelIndex);
  } else {
    enqueueLine("> INCORRECT, TRY AGAIN.", false, true);
  }
};
