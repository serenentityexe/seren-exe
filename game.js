// 2 livelli di prova
window.startGame = function(){
  enqueueLine("> GAME MODULE LOADING...",false,true);
  enqueueLine("> WELCOME TO SEREN.EXE GAME...",false,true);
  // Livello 1
  enqueueLine("[LEVEL 1] Solve: ANAGRAM OF 'SEREN' => ? (Type answer)",false,true);
  const level1Handler = e=>{
    if(e.key!=='Enter') return;
    const ans = input.value.trim().toLowerCase(); input.value='';
    if(ans==='seren'){ enqueueLine("> LEVEL 1 COMPLETED",false,true); window.removeEventListener('keydown',level1Handler); level2(); }
    else enqueueLine("> WRONG ANSWER, TRY AGAIN",false,true);
  };
  window.addEventListener('keydown',level1Handler);
};

function level2(){
  enqueueLine("[LEVEL 2] Solve: ANAGRAM OF 'ENTITY' => ?",false,true);
  const level2Handler = e=>{
    if(e.key!=='Enter') return;
    const ans = input.value.trim().toLowerCase(); input.value='';
    if(ans==='entity'){ enqueueLine("> LEVEL 2 COMPLETED",false,true); window.removeEventListener('keydown',level2Handler); enqueueLine("> GAME SESSION COMPLETE",false,true);}
    else enqueueLine("> WRONG ANSWER, TRY AGAIN",false,true);
  };
  window.addEventListener('keydown',level2Handler);
}
