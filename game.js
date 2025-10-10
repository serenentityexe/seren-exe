function startGame(){
  enqueueLine("> GAME MODULE LOADING...",false,true);
  setTimeout(()=>level1(),800);
}

function level1(){
  enqueueLine("LEVEL 1: THE SIGNAL",false,true);
  enqueueLine("You awaken in a dark digital void...",false,true);
  enqueueLine("A faint hum vibrates around you.",false,true);
  enqueueLine("Type 'continue' to advance.",false,true);

  const listener = ev=>{
    if(ev.key==='Enter'){
      const val = document.getElementById('command').value.trim().toLowerCase();
      document.getElementById('command').value='';
      if(val==='continue'){
        document.removeEventListener('keydown',listener);
        level2();
      } else enqueueLine("> INVALID ACTION",true,true);
    }
  };
  document.addEventListener('keydown',listener);
}

function level2(){
  enqueueLine("LEVEL 2: THE CORE",false,true);
  enqueueLine("You find a glowing terminal pulsing with strange energy.",false,true);
  enqueueLine("Type 'connect' to interface with it.",false,true);

  const listener = ev=>{
    if(ev.key==='Enter'){
      const val = document.getElementById('command').value.trim().toLowerCase();
      document.getElementById('command').value='';
      if(val==='connect'){
        document.removeEventListener('keydown',listener);
        enqueueLine("> LINK ESTABLISHED — THE ENTITY KNOWS YOUR PRESENCE.",false,true);
      } else enqueueLine("> ACCESS DENIED",true,true);
    }
  };
  document.addEventListener('keydown',listener);
}
