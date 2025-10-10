// game.js - exposes window.startGame and window.serenGameInputHandler

(() => {
  window.serenGameLoaded = true;

  const levels = [
    {
      id: 1,
      prompt: "LEVEL 1 — CIPHER\nDecode: Uifsf jt b tfdsfu\n(enter the decoded text)",
      solution: "there is a secret"
    },
    {
      id: 2,
      prompt: "LEVEL 2 — ANAGRAM\nUnscramble: NTYIE\n(enter the word)",
      solution: "entity"
    }
  ];

  let currentLevelIndex = 0;

  // expose startGame(levelNumber) — levelNumber optional (1-based)
  window.startGame = function(startLevel = 1, progress = {}) {
    if (typeof startLevel !== 'number' || startLevel < 1) startLevel = 1;
    currentLevelIndex = Math.max(0, startLevel - 1);
    showCurrentLevel();
  };

  function showCurrentLevel(){
    const lvl = levels[currentLevelIndex];
    if (!lvl) {
      enqueueLine("> YOU HAVE COMPLETED ALL AVAILABLE LEVELS.", false, true);
      return;
    }
    enqueueLine(`> ${lvl.prompt}`, false, true);
  }

  // expose input handler used by script.js
  window.serenGameInputHandler = function(rawInput) {
    if (!rawInput) return;
    const answer = rawInput.trim().toLowerCase();
    const lvl = levels[currentLevelIndex];
    if (!lvl) return;

    // Normalize caesar-like example: try naive decode of some ciphers
    // But here we compare after simple heuristics:
    const normalized = answer.replace(/\s+/g, ' ').toLowerCase();

    if (normalized === lvl.solution.toLowerCase()) {
      enqueueLine("> CORRECT!", false, true);
      currentLevelIndex++;
      // save progress via exposed global (script.js attaches saveUserProgress)
      if (typeof window.saveUserProgress === 'function') {
        try { window.saveUserProgress({level: currentLevelIndex + 0}); } catch(e){ console.error(e); }
      }
      showCurrentLevel();
    } else {
      enqueueLine("> INCORRECT — TRY AGAIN.", false, true);
    }
  };

})();
