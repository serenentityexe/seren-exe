window.serenGameLoaded = true;

// Stato interno del gioco
window.serenGameState = {
    currentLevel: 1,
    maxLevel: 2
};

// Gestore input del gioco
window.serenGameInputHandler = function(input){
    input = input.trim().toLowerCase();

    const level = window.serenGameState.currentLevel;

    if(level === 1){
        if(input === 'seren'){
            enqueueLine("> LEVEL 1 COMPLETE!", false, true);
            window.serenGameState.currentLevel = 2;
            enqueueLine("> LEVEL 2 UNLOCKED: Solve the anagram - 'lpepa'", false, true);
        } else {
            enqueueLine("> INCORRECT. TRY AGAIN.", false, true);
        }
    } else if(level === 2){
        if(input === 'apple'){
            enqueueLine("> LEVEL 2 COMPLETE! GAME END.", false, true);
            enqueueLine("> YOU HAVE CONQUERED SEREN.EXE", false, true);
        } else {
            enqueueLine("> INCORRECT. TRY AGAIN.", false, true);
        }
    }
};
