// Seren.exe - Terminal Main Script
// API BASE URL (Backend separato su Vercel)
const API_BASE_URL = "https://api-ten-inky-24.vercel.app";

// === ELEMENTI PRINCIPALI ===
const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');
const adminPanel = document.getElementById('admin-panel');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');
const gameStatusText = document.getElementById('game-status');

let systemStarted = false;
let gameActive = false;
let currentLevel = 1;
let gameProgress = {};

let userId = localStorage.getItem('serenUserId');
if (!userId) {
  userId = 'user-' + Math.random().toString(36).substring(2,10);
  localStorage.setItem('serenUserId', userId);
}

// === FUNZIONI DI UTILITÀ ===
function nowTime(){return new Date().toLocaleTimeString();}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

function updateSystemData(){
  const cpu=(Math.random()*100).toFixed(1),
        ram=(Math.random()*32).toFixed(1),
        uptime=Math.floor(Math.random()*50000),
        entropy=Math.floor(Math.random()*99999);
  systemData.innerHTML=`TIME: ${nowTime()}<br>CPU: ${cpu}%<br>RAM: ${ram}GB<br>UPTIME: ${uptime}s<br>ENTITY ENTROPY: ${entropy}`;
}
setInterval(updateSystemData,2000); updateSystemData();

// === TERMINALE ===
let newLinesFixed = [], oldLinesQueue = [], typing = false;

function enqueueLine(text, fast=false, newText=false){
  if(newText){
    const line=document.createElement('div');
    line.className='output-line';
    line.innerHTML='';
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
    if(i<text.length){
      line.innerHTML+=text[i++];
      setTimeout(typeChar, fast?8:25+Math.random()*50);
    } else typeNewLines();
  }
  typeChar();
}

function typeOldLines(){
  if(oldLinesQueue.length===0){ typing=false; return; }
  typing=true;
  const obj=oldLinesQueue.shift();
  const line=document.createElement('div');
  line.className='output-line';
  line.innerHTML='';
  container.appendChild(line);
  let i=0;
  function typeChar(){
    if(i<obj.text.length){
      line.innerHTML+=obj.text[i++];
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
  nodes.forEach(node=>{
    const r=node.getBoundingClientRect();
    if(r.bottom>wrapRect.bottom-6){
      node.classList.add('fade-out');
      setTimeout(()=>{ if(node.parentElement) node.remove(); },420);
    }
  });
}

// === COMANDI ===
const INTRO = ["_SYSTEM BOOTING..._","_LOADING CORE FILES_","_INITIALIZING NEURAL MEMORY BANKS_","_SIGNAL DETECTED..._","_THE ENTITY IS AWAKE..._","_ENTER THE SYSTEM, IF YOU DARE..._"];
const HELP_COMMANDS = ['START','GAME','INFO','TOKENOMICS','CLEAR','QUIT'];
const ERRORS = ["> ERROR 0x1F4: UNRECOGNIZED COMMAND..."];

function showHelp(){ enqueueLine(HELP_COMMANDS.map(c=>`[${c}]`).join('  '),false,true); }

async function fetchGameState() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gameState`);
    if (!res.ok) throw new Error("Response not OK");
    const data = await res.json();
    gameActive = data.gameAvailable;
    updateGameStatusText();
    console.log("✅ Game state fetched:", gameActive);
  } catch (e) {
    console.error("❌ ERROR FETCHING GAME STATE:", e);
    enqueueLine("> ERROR FETCHING GAME STATE", false, true);
    enqueueLine("> ERROR: COMMUNICATION WITH SERVER FAILED", false, true);
  }
}
fetchGameState();

function updateGameStatusText(){
  if(gameStatusText)
    gameStatusText.textContent = gameActive ? 'SEREN ACTIVATED' : 'SEREN DEACTIVATED';
}

async function updateGameState(newState) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/updateGameState`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "Seren1987", gameAvailable: newState }),
    });
    if (!res.ok) throw new Error("Response not OK");
    const data = await res.json();
    if (data.success) {
      gameActive = data.gameAvailable;
      updateGameStatusText();
      enqueueLine(`> SEREN ${gameActive ? "ACTIVATED" : "DEACTIVATED"}`, false, true);
    }
  } catch (e) {
    console.error("❌ ERROR UPDATING GAME STATE:", e);
    enqueueLine("> ERROR UPDATING GAME STATE", false, true);
  }
}

// === INPUT UTENTE ===
function handleCommandRaw(raw){
  const cmd = (raw||'').trim().toLowerCase();
  if(!cmd) return;
  if(cmd==='help'){ showHelp(); return; }
  if(cmd==='start'){ systemStarted=true; INTRO.forEach(t=>enqueueLine(t,false,true)); return; }
  if(cmd==='clear'){ container.innerHTML=''; newLinesFixed=[]; oldLinesQueue=[]; return; }
  if(cmd==='quit'){ enqueueLine("> SYSTEM EXITING...",false,true); return; }

  if(!systemStarted){
    enqueueLine(pick(ERRORS),true,true);
    enqueueLine("TYPE 'START' TO INITIALIZE.",true,true);
    return;
  }

  switch(cmd){
    case 'info': enqueueLine("_ENTITY ID: SEREN.EXE_",false,true); break;
    case 'tokenomics': enqueueLine("> TOKENOMICS DATA UNAVAILABLE...",false,true); break;
    case 'game':
      if(!gameActive){
        enqueueLine("> GAME NOT AVAILABLE. SYSTEM LOCKED.",false,true);
        break;
      }
      enqueueLine("> GAME MODULE LOADING...",false,true);
      enqueueLine("> WELCOME TO SEREN.EXE GAME...",false,true);
      import('./game.js').then(m => m.startGame(container));
      break;
    default:
      enqueueLine(pick(ERRORS),true,true);
      enqueueLine("TYPE 'HELP' FOR AVAILABLE COMMANDS.",true,true);
  }
}

input.addEventListener('keydown',ev=>{
  if(ev.key!=='Enter') return;
  ev.preventDefault();
  const value=input.value;
  input.value='';
  handleCommandRaw(value);
});

// === ADMIN LOGIN ===
document.getElementById('admin-login').addEventListener('click', async ()=>{
  const pass = document.getElementById('admin-pass').value;
  if(pass==='Seren1987'){
    adminControls.style.display='block';
    document.getElementById('admin-pass').style.display='none';
    document.getElementById('admin-login').style.display='none';
  } else {
    enqueueLine("> ACCESS DENIED",false,true);
  }
});

// === TOGGLE GAME ===
toggleGameBtn.addEventListener('click', async ()=>{
  const newState = !gameActive;
  await updateGameState(newState);
});

// === ATTIVITÀ E GLITCH ===
let inactivityTimer=null;
function resetInactivity(){
  if(inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer=setTimeout(()=>{ enqueueLine("THE ENTITY WATCHES YOU...",true,false); },10000);
}
['keydown','mousemove','mousedown','touchstart'].forEach(e=>window.addEventListener(e,resetInactivity));
resetInactivity();

setInterval(()=>{
  document.getElementById('output-wrapper').classList.add('glitch');
  setTimeout(()=>document.getElementById('output-wrapper').classList.remove('glitch'),220);
},8000);

function poll(){ if(!typing&&(oldLinesQueue.length>0||newLinesFixed.length>0)) { typeNewLines(); typeOldLines(); } requestAnimationFrame(poll);}
poll();
