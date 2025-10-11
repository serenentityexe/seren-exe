// 🔹 Base API endpoint (vercel backend)
const API_BASE = "https://api-ten-inky-24.vercel.app";

const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');

let systemStarted = false;
let gameActive = false;

// Terminal lines
let newLinesFixed = [], oldLinesQueue = [], typing = false;

// User ID for progress
let userId = localStorage.getItem('serenUserId');
if (!userId) { userId = 'user-' + Math.random().toString(36).substring(2,10); localStorage.setItem('serenUserId', userId); }

const INTRO = ["_SYSTEM BOOTING..._","_LOADING CORE FILES_","_INITIALIZING NEURAL MEMORY BANKS_","_SIGNAL DETECTED..._","_THE ENTITY IS AWAKE..._","_ENTER THE SYSTEM, IF YOU DARE..._"];
const HELP_COMMANDS = ['START','GAME','INFO','TOKENOMICS','CLEAR','QUIT'];
const ERRORS = ["> ERROR 0x1F4: UNRECOGNIZED COMMAND..."];

function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function nowTime(){return new Date().toLocaleTimeString();}

// System stats
function updateSystemData(){
  const cpu=(Math.random()*100).toFixed(1),
        ram=(Math.random()*32).toFixed(1),
        uptime=Math.floor(Math.random()*50000),
        entropy=Math.floor(Math.random()*99999),
        misc1=Math.floor(Math.random()*999999),
        misc2=(Math.random()*100).toFixed(2);
  systemData.innerHTML=`TIME: ${nowTime()}<br>CPU: ${cpu}%<br>RAM: ${ram}GB<br>UPTIME: ${uptime}s<br>ENTITY ENTROPY: ${entropy}<br>PROC A: ${misc1}<br>PROC B: ${misc2}`;
}
setInterval(updateSystemData,2000);
updateSystemData();

// Terminal functions
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
    } else { removeOverflowBottom(); typeOldLines(); }
  }
  typeChar();
}

function removeOverflowBottom(){
  const nodes=Array.from(container.querySelectorAll('.output-line'));
  const wrapRect=document.getElementById('output-wrapper').getBoundingClientRect();
  nodes.forEach(node=>{ const r=node.getBoundingClientRect(); if(r.bottom>wrapRect.bottom-6){node.classList.add('fade-out'); setTimeout(()=>{if(node.parentElement) node.remove();},420); }});
}

function showHelp(){ enqueueLine(HELP_COMMANDS.map(c=>`[${c}]`).join('  '),false,true); }

// Handle commands
function handleCommandRaw(raw){
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
      if(!gameActive){ enqueueLine("> GAME NOT AVAILABLE. WILL OPEN AT 150k MC.",false,true); break; }
      // call game start
      if(window.startGame) window.startGame();
      break;
    default: enqueueLine(pick(ERRORS),true,true); enqueueLine("TYPE 'HELP' FOR AVAILABLE COMMANDS.",true,true);
  }
}

// Input handler
input.addEventListener('keydown',ev=>{
  if(ev.key!=='Enter') return;
  ev.preventDefault();
  const value=input.value; input.value='';
  handleCommandRaw(value);
});

// Poll terminal typing
function poll(){ if(!typing&&(oldLinesQueue.length>0||newLinesFixed.length>0)) { typeNewLines(); typeOldLines(); } requestAnimationFrame(poll);}
poll();

// Admin Panel
const adminIcon = document.getElementById('admin-icon');
const adminPanel = document.getElementById('admin-panel');
const adminLoginBtn = document.getElementById('admin-login');
const adminPassInput = document.getElementById('admin-pass');
const adminControls = document.getElementById('admin-controls');
const toggleOnBtn = document.getElementById('toggle-game-on');
const toggleOffBtn = document.getElementById('toggle-game-off');
const gameStatusSpan = document.getElementById('game-status');

// Toggle panel
adminIcon.addEventListener('click', e=>{ e.stopPropagation(); adminPanel.style.display='block'; });
document.addEventListener('click', e=>{ if(!adminPanel.contains(e.target)) adminPanel.style.display='none'; });

// Admin login
adminLoginBtn.addEventListener('click', async ()=>{
  if(adminPassInput.value==='Seren1987'){
    adminControls.style.display='block';
    adminPassInput.style.display='none';
    adminLoginBtn.style.display='none';
  }
});

// Toggle game
async function setGameState(active){
  try{
    const res = await fetch('/api/updateGameState', {
      method:'POST', headers:{'Content-Type':'application/json'}, 
      body:JSON.stringify({password:'Seren1987', gameAvailable:active})
    });
    const data = await res.json();
    if(data.success){ gameActive = data.gameAvailable; gameStatusSpan.textContent = `Game: ${gameActive?'ON':'OFF'}`; enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`,false,true); }
  } catch(e){ enqueueLine("> ERROR COMMUNICATING WITH SERVER",false,true); console.error(e); }
}

toggleOnBtn.addEventListener('click',()=>setGameState(true));
toggleOffBtn.addEventListener('click',()=>setGameState(false));
// === GLOBAL GAME STATUS INDICATOR ===
async function updateGlobalStatus() {
  const light = document.getElementById('status-light');
  const text = document.getElementById('status-text');

  try {
    const res = await fetch('https://api-ten-inky-24.vercel.app/api/gameState');
    const data = await res.json();

    if (data.status === "on") {
      light.classList.remove('red');
      light.classList.add('green');
      text.textContent = "> SEREN: ACTIVATED";
      text.style.color = "#00ff66";
    } else {
      light.classList.remove('green');
      light.classList.add('red');
      text.textContent = "> SEREN: DEACTIVATED";
      text.style.color = "#ff0033";
    }
  } catch (err) {
    console.error("Error fetching status:", err);
    light.classList.remove('green');
    light.classList.add('red');
    text.textContent = "> SEREN: CONNECTION ERROR";
    text.style.color = "#ff0033";
  }
}

// Controlla lo stato ogni 10 secondi
setInterval(updateGlobalStatus, 10000);

// Controlla lo stato all'avvio
updateGlobalStatus();
