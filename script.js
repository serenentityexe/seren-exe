const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');

let systemStarted = false, gameActive = false;
let currentLevel = 1;
let gameProgress = {};

const adminIcon = document.getElementById('admin-icon');
const adminPanel = document.getElementById('admin-panel');
const adminLoginBtn = document.getElementById('admin-login');
const adminPassInput = document.getElementById('admin-pass');
const adminControls = document.getElementById('admin-controls');
const toggleGameCheckbox = document.getElementById('toggle-game');
const gameStatus = document.getElementById('game-status');

// === ICONA ADMIN OPEN/CLOSE ===
adminIcon.addEventListener('click', e => {
  e.stopPropagation();
  adminPanel.style.display = adminPanel.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', e => {
  if (!adminPanel.contains(e.target) && e.target !== adminIcon)
    adminPanel.style.display = 'none';
});
adminPanel.addEventListener('click', e => e.stopPropagation());

// === ADMIN LOGIN ===
adminLoginBtn.addEventListener('click', async ()=>{
  if(adminPassInput.value==='Seren1987'){
    adminControls.style.display='block';
    adminPassInput.style.display='none';
    adminLoginBtn.style.display='none';
  }
});

// === FETCH GAME STATE ===
async function fetchGameState() {
  try {
    const res = await fetch('/api/gameState');
    const data = await res.json();
    gameActive = data.gameAvailable;
    toggleGameCheckbox.checked = gameActive;
    gameStatus.textContent = gameActive ? 'Game: ON' : 'Game: OFF';
  } catch(e){ console.error('Errore fetch game state',e); }
}
fetchGameState();

// === TOGGLE HANDLER ===
toggleGameCheckbox.addEventListener('change', async ()=>{
  const newState = toggleGameCheckbox.checked;
  try {
    const res = await fetch('/api/updateGameState', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password:'Seren1987', gameAvailable:newState})
    });
    const data = await res.json();
    if(data.success){
      gameActive = data.gameAvailable;
      gameStatus.textContent = gameActive ? 'Game: ON' : 'Game: OFF';
      enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`,false,true);
    } else enqueueLine('> ERROR: AUTH FAILED',true,true);
  } catch(e){ enqueueLine('> ERROR: SERVER COMMUNICATION FAILED',true,true); }
});

// === TERMINAL ===
function enqueueLine(text, fast=false, newText=false){
  const line=document.createElement('div');
  line.className='output-line';
  line.innerHTML='';
  if(newText) container.insertBefore(line,container.firstChild);
  else container.appendChild(line);
  let i=0; function type(){ if(i<text.length){ line.innerHTML+=text[i++]; setTimeout(type, fast?8:25+Math.random()*30); } }
  type();
}

function handleCommandRaw(raw){
  const cmd = (raw||'').trim().toLowerCase();
  if(!cmd) return;
  if(cmd==='start'){ systemStarted=true; enqueueLine("_SYSTEM READY_",false,true); return; }
  if(cmd==='clear'){ container.innerHTML=''; return; }
  if(cmd==='quit'){ enqueueLine("> SYSTEM EXITING...",false,true); return; }

  if(!systemStarted){ enqueueLine("> SYSTEM NOT INITIALIZED — TYPE START",true,true); return; }

  switch(cmd){
    case 'info': enqueueLine("_ENTITY ID: SEREN.EXE_",false,true); break;
    case 'tokenomics': enqueueLine("> TOKENOMICS UNAVAILABLE",false,true); break;
    case 'game':
      if(!gameActive){ enqueueLine("> GAME NOT AVAILABLE. WILL OPEN AT 150k MC.",false,true); break; }
      startGame();
      break;
    default:
      enqueueLine("> UNKNOWN COMMAND",true,true);
  }
}

input.addEventListener('keydown',ev=>{
  if(ev.key!=='Enter') return;
  ev.preventDefault();
  const value=input.value;
  input.value='';
  handleCommandRaw(value);
});
