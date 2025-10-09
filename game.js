window.serenGameLoaded = true;
window.serenGameState = { currentLevel: 1, maxLevel: 2 };

window.serenGameInputHandler = function(input){
    input = input.trim().toLowerCase();
    const level = window.serenGameState.currentLevel;

    if(level===1){
        if(input==='seren'){
            enqueueLine("> LEVEL 1 COMPLETE!", false, true);
            window.serenGameState.currentLevel = 2;
            enqueueLine("> LEVEL 2 START: solve the anagram 'raenS'", false, true);
        } else {
            enqueueLine("> WRONG INPUT FOR LEVEL 1", false, true);
        }
    } else if(level===2){
        if(input==='seren'){
            enqueueLine("> LEVEL 2 COMPLETE! CONGRATS!", false, true);
            window.serenGameState.currentLevel = 1; // loop demo
        } else {
            enqueueLine("> WRONG INPUT FOR LEVEL 2", false, true);
        }
    }
};
