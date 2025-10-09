async function handleCommandRaw(raw){
  const cmd = (raw||'').trim().toLowerCase();
  if(!cmd) return;

  if(cmd==='help'){ showHelp(); return; }
  if(cmd==='start'){ systemStarted=true; INTRO.forEach(t=>enqueueLine(t,false,true)); return; }
  if(cmd==='clear'){ container.innerHTML=''; newLinesFixed=[]; oldLinesQueue=[]; return; }
  if(cmd==='quit'){ enqueueLine("> SYSTEM EXITING...",false,true); return; }

  if(!systemStarted){ enqueueLine(pick(ERRORS),true,true); enqueueLine("TYPE 'START' TO INITIALIZE.",true,true); return; }

  switch(cmd){
    case'info': enqueueLine("_ENTITY ID: SEREN.EXE_",false,true); break;
    case'tokenomics': enqueueLine("> TOKENOMICS DATA UNAVAILABLE...",false,true); break;
    case'game':
      if(!gameActive){
        enqueueLine("> GAME NOT AVAILABLE. WILL OPEN AT 150k MC.",false,true);
        break;
      }
      enqueueLine("> GAME MODULE LOADING...",false,true);
      enqueueLine("> WELCOME TO SEREN.EXE GAME...",false,true);
      // Carica il file JS esterno con la logica del gioco
      if(!window.serenGameLoaded){
        const script = document.createElement('script');
        script.src = 'game.js'; // file esterno con la logica di 50 livelli
        script.onload = ()=> enqueueLine("> GAME LOGIC LOADED.",false,true);
        document.body.appendChild(script);
        window.serenGameLoaded = true;
      } else {
        enqueueLine("> GAME READY.",false,true);
      }
      break;
    default: enqueueLine(pick(ERRORS),true,true); enqueueLine("TYPE 'HELP' FOR AVAILABLE COMMANDS.",true,true);
  }
}
