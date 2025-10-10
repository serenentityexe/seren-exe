// ----------------- Terminal Core -----------------
const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');

let systemStarted = false;
let gameActive = false;
let currentLevel = 1;
let gameProgress = {};

let userId = localStorage.getItem('serenUserId');
if (!userId) { 
  userId = 'user-' + Math.random().toString(36).substring(2,10); 
  localStorage.setItem('serenUserId', userId); 
}

const INTRO = [
  "_SYSTEM BOOTING..._",
  "_LOADING CORE FILES_",
  "_INITIALIZING NEURAL MEMORY BANKS_",
  "_SIGNAL DETECTED..._",
  "_THE ENTITY IS AWAKE..._",
  "_ENTER THE SYSTEM, IF YOU DARE..._"
];
const HELP_COMMANDS = ['START','GAME','INFO','TOKENOMICS','CLEAR','QUIT'];
const ERRORS = ["> ERROR 0x1F4: UNRECOGNIZED COMMAND..."];

function nowTime(){ return new Date().toLocaleTimeString(); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// System Data
function updateSystemData(){
  const cpu=(Math.random()*100).toFixed(1),
        ram=(Math.random()*32).toFixed(1),
        uptime=Math.floor(Math.random()*50000),
        entropy=Math.floor(Math.random()*99999),
        misc1=Math.floor(Math.random()*999999),
        misc2=(Math.random()*100).toFixed(2);
  systemData.innerHTML=`TIME: ${nowTime()}<br>CPU: ${cpu}%<br>RAM: ${ram}GB<br>UPTIME: ${uptime}s<br>ENTITY ENTROPY: ${entropy}<br>PROC A: ${misc1}<br>PROC B: ${misc2}`;
}
setInterval(updateSystemData,2000); updateSystemData();

// Terminal lines
let newLinesFixed = [], oldLinesQueue = [], typing = false;
function enqueueLine(text, fast=false, newText=false){
  if(newText){
    const line=document.createElement('div'); line.className='output-line'; line.innerHTML='';
    container.insertBefore(line,container.firstChild);
    newLinesFixed.push({el:line,text,fast});
    if(!typing) typeNewLines();
  } else {
    oldLinesQueue.push({text,fast});
    if(!typing) typeOldLines();
  }
}

function typeNewLines(){
  if(newLinesFixed.length===0){ typing=false; return; }
  typing=true;
  const obj=newLinesFixed.shift();
  const line=obj.el; const text=obj.text; const fast=obj.fast;
  let i=0;
  function typeChar(){
    if(i<text.length){line.innerHTML+=text[i++]; setTimeout(typeChar, fast?8:25+Math.random()*50);}
    else typeNewLines();
  }
  typeChar();
}

function typeOldLines(){
  if(oldLinesQueue.length===0){ typing=false; return; }
  typing=true;
  const obj=oldLinesQueue.shift();
  const line=document.createElement('div'); line.className='output-line'; line.innerHTML='';
  container.appendChild(line);
  let i=0, shift=0;
  function typeChar(){
    if(i<obj.text.length){
      line.innerHTML+=obj.text[i++];
      shift+=0.5;
      line.style.transform=`translateY(${shift}px)`;
      setTimeout(typeChar,obj.fast?8:25+Math.random()*50);
    } else {
      removeOverflowBottom();
      typeOldLines();
    }
  }
  typeChar();
}

function removeOverflowBottom(){
  const nodes=Array.from(container.querySelectorAll('.output-line'));
  const wrapRect=document.getElementById('output-wrapper').getBoundingClientRect();
  nodes.forEach(node=>{ const r=node.getBoundingClientRect(); if(r.bottom>wrapRect.bottom-6){node.classList.add('fade-out'); setTimeout(()=>{if(node.parentElement) node.remove();},420); }});
}

function showHelp(){enqueueLine(HELP_COMMANDS.map(c=>`[${c}]`).join('  '),false,true);}

// ----------------- API Communication -----------------
async function fetchGameState() {
  try { 
    const res = await fetch('/api/gameState'); 
    const data = await res.json(); 
    gameActive = data.gameAvailable; 
    updateGameStatusText(); 
  } catch(e){ 
    console.error("> ERROR FETCHING GAME STATE", e);
    enqueueLine("> ERROR FETCHING GAME STATE: SERVER NOT REACHABLE", true, true);
  }
}

async function toggleGameState(state){
  try{
    const res = await fetch('/api/updateGameState', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ password:'Seren1987', gameAvailable:state })
    });
    const data = await res.json();
    if(data.success){
      gameActive = data.gameAvailable;
      updateGameStatusText();
      enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`, false, true);
    } else {
      enqueueLine("> ERROR: FAILED TO UPDATE GAME STATE", false, true);
    }
  } catch(e){ 
    console.error("> ERROR COMMUNICATING WITH SERVER", e);
    enqueueLine("> ERROR COMMUNICATING WITH SERVER", true, true);
  }
}

async function saveUserData(){ 
  const userData = { level: currentLevel, progressData: gameProgress };
  try {
    await fetch('/api/saveUserData', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({userId,userData})
    });
  } catch(e){ console.error('Errore salvataggio dati utente',e);}
}

async function loadUserData(){
  try {
    const res = await fetch(`/api/getUserData?userId=${userId}`);
    const data = await res.json();
    if(data.userData && data.userData.level) { currentLevel = data.userData.level; gameProgress = data.userData.progressData || {}; }
  } catch(e){ console.error('Errore caricamento dati utente',e);}
}

function updateGameStatusText(){
  const span = document.getElementById('game-status');
  if(span){
    span.textContent = gameActive ? 'Game: ON' : 'Game: OFF';
    span.style.color = gameActive ? 'lime' : 'red';
  }
}

fetchGameState();
loadUserData();

// ----------------- Command Handling -----------------
function handleCommandRaw(raw){
  const cmd = (raw||'').trim().toLowerCase();
  if(!cmd) return;

  if(cmd==='help'){ showHelp(); return; }
  if(cmd==='start'){ 
    systemStarted=true; 
    INTRO.forEach(t=>enqueueLine(t,false,true)); 
    return; 
  }
  if(cmd==='clear'){ container.innerHTML=''; newLinesFixed=[]; oldLinesQueue=[]; return; }
  if(cmd==='quit'){ enqueueLine("> SYSTEM EXITING...",false,true); return; }

  if(!systemStarted){ 
    enqueueLine(pick(ERRORS),true,true); 
    enqueueLine("TYPE 'START' TO INITIALIZE.",true,true); 
    return; 
  }

  switch(cmd){
    case'info': enqueueLine("_ENTITY ID: SEREN.EXE_",false,true); break;
    case'tokenomics': enqueueLine("> TOKENOMICS DATA UNAVAILABLE...",false,true); break;
    case'game':
      if(!gameActive){ enqueueLine("> GAME NOT AVAILABLE. WILL OPEN AT 150k MC.",false,true); break; }
      enqueueLine("> GAME MODULE LOADING...",false,true); 
      import('./game.js').then(module=>{ module.startGame(currentLevel, gameProgress); });
      break;
    default: enqueueLine(pick(ERRORS),true,true); enqueueLine("TYPE 'HELP' FOR AVAILABLE COMMANDS.",true,true);
  }
}

input.addEventListener('keydown',ev=>{
  if(ev.key!=='Enter') return; 
  ev.preventDefault(); 
  const value=input.value; input.value=''; 
  handleCommandRaw(value); 
  saveUserData();
});

// ----------------- Admin Panel -----------------
const adminPanel = document.getElementById('admin-panel');
const adminLoginBtn = document.getElementById('admin-login');
const adminPassInput = document.getElementById('admin-pass');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');
const adminIcon = document.createElement('div');

adminIcon.textContent = 'S';
adminIcon.style.cursor = 'pointer';
adminIcon.style.fontWeight = '700';
adminIcon.style.position = 'absolute';
adminIcon.style.top = '10px';
adminIcon.style.right = '10px';
adminIcon.style.color = 'var(--accent)';
document.body.appendChild(adminIcon);

adminPanel.style.display='none';

// Toggle admin panel with icon
adminIcon.addEventListener('click', (e)=>{
  e.stopPropagation();
  adminPanel.style.display = adminPanel.style.display==='block' ? 'none' : 'block';
});

// Close admin panel if click outside
document.addEventListener('click', (e)=>{
  if(!adminPanel.contains(e.target) && e.target!==adminIcon){
    adminPanel.style.display='none';
  }
});

adminLoginBtn.addEventListener('click', async ()=>{
  if(adminPassInput.value==='Seren1987'){
    adminControls.style.display='flex';
    adminPassInput.style.display='none'; 
    adminLoginBtn.style.display='none';
  }
});

// Toggle ON/OFF
toggleGameBtn.addEventListener('click', async ()=>{
  await toggleGameState(!gameActive);
});
