// ----------------- Game Logic -----------------
export function startGame(level, progress){
  const levels = [
    { question:"ANAGRAM: Rearrange 'NODE' to form a word", answer:"DONE" },
    { question:"CIPHER: Decode 'Uifsf' using Caesar +1", answer:"There" }
  ];

  let current = level-1;
  if(current<0) current=0;

  enqueueLine(`> LEVEL ${current+1}: ${levels[current].question}`, false, true);

  const gameHandler = (ev)=>{
    if(ev.key!=='Enter') return;
    ev.preventDefault();
    const cmd = input.value.trim();
    input.value='';
    if(cmd.toUpperCase()===levels[current].answer.toUpperCase()){
      enqueueLine("> CORRECT! ADVANCING LEVEL...", false, true);
      current++;
      if(current<levels.length){
        enqueueLine(`> LEVEL ${current+1}: ${levels[current].question}`, false, true);
      } else {
        enqueueLine("> GAME COMPLETED!", false, true);
        window.removeEventListener('keydown', gameHandler);
      }
    } else {
      enqueueLine("> INCORRECT, TRY AGAIN.", false, true);
    }
  }

  window.addEventListener('keydown', gameHandler);
}
