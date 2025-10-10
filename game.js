function startGame(level=1, progress={}){
  enqueueLine(`> STARTING GAME AT LEVEL ${level}...`, false, true);

  const levels = {
    1: { puzzle: "ANAGRAM: Reorder letters 'ENRSE'", answer: "SEREN" },
    2: { puzzle: "CIPHER: ROT1 'UFTU'", answer: "TEST" }
  };

  if(!levels[level]) { enqueueLine("> GAME COMPLETE. CONGRATS!", false, true); return; }

  const current = levels[level];
  enqueueLine(`> PUZZLE LEVEL ${level}: ${current.puzzle}`, false, true);

  input.addEventListener('keydown', function listener(e){
    if(e.key!=='Enter') return;
    e.preventDefault();
    const val = input.value.trim().toUpperCase(); input.value='';
    if(val===current.answer){
      enqueueLine("> CORRECT! ADVANCING...", false, true);
      currentLevel++;
      input.removeEventListener('keydown', listener);
      startGame(currentLevel, progress);
    } else {
      enqueueLine("> WRONG. TRY AGAIN.", false, true);
    }
  });
}
