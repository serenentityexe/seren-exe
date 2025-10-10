window.startGame = function(level){
  switch(level){
    case 1:
      enqueueLine("> LEVEL 1: DECODE THIS MESSAGE: 'RAC' -> ? (anagram)", false, true);
      break;
    case 2:
      enqueueLine("> LEVEL 2: DECRYPT: 'URYYB' (ROT13)", false, true);
      break;
    default:
      enqueueLine("> NO MORE LEVELS FOR NOW...", false, true);
      break;
  }
};
