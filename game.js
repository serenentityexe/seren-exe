const levels = {
  1: { question: "Rearrange the letters to form a word: 'RAET'", answer: "RATE" },
  2: { question: "Decrypt the Caesar cipher (shift 3): 'KHOOR'", answer: "HELLO" }
};

function startGame(level){
  if(!levels[level]) { enqueueLine("> NO MORE LEVELS", false, true); return; }
  enqueueLine(`> LEVEL ${level}: ${levels[level].question}`, false, true);

  const inputHandler = ev=>{
    if(ev.key!=='Enter') return;
    ev.preventDefault();
    const value = input.value.trim().toUpperCase(); input.value='';
    if(value===levels[level].answer){
      enqueueLine("> CORRECT! PROCEEDING TO NEXT LEVEL", false, true);
      currentLevel++;
      input.removeEventListener('keydown', inputHandler);
      startGame(currentLevel);
    } else {
      enqueueLine("> INCORRECT, TRY AGAIN", false, true);
    }
  };

  input.addEventListener('keydown', inputHandler);
}
