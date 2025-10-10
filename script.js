/* script.js - main frontend logic (terminal, admin, API calls) */

/* DOM */
const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');

const adminIcon = document.getElementById('admin-icon');
const adminPanel = document.getElementById('admin-panel');
const adminPass = document.getElementById('admin-pass');
const adminLogin = document.getElementById('admin-login');
const adminControls = document.getElementById('admin-controls');
const toggleCheckbox = document.getElementById('toggle-game');
const gameStatusSpan = document.getElementById('game-status');

/* state */
let systemStarted = false;
let gameActive = false;
let currentLevel = 1;
let gameProgress = {};
let userId = localStorage.getItem('serenUserId');
if (!userId) { userId = 'user-' + Math.random().toString(36).slice(2,10); localStorage.setItem('serenUserId', userId); }

/* helper: enqueue text with type effect */
function enqueueLine(text, fast=false, newText=false){
  const line = document.createElement('div');
  line.className = 'output-line';
  line.innerHTML = '';
  if(newText) container.insertBefore(line, container.firstChild);
  else container.appendChild(line);
  let i = 0;
  const speed = fast ? 8 : 20 + Math.random()*40;
  (function typeChar(){
    if(i < text.length){
      line.innerHTML += text[i++];
      setTimeout(typeChar, speed);
    }
  })();
}

/* system stats */
function updateSystemData(){
  const cpu=(Math.random()*100).toFixed(1),
        ram=(Math.random()*32).toFixed(1),
        uptime=Math.floor(Math.random()*50000),
        entropy=Math.floor(Math.random()*999999),
        procA=Math.floor(Math.random()*999999),
        procB=(Math.random()*100).toFixed(2);
  systemData.innerHTML = `TIME: ${new Date().toLocaleTimeString()}<br>CPU: ${cpu}%<br>RAM: ${ram}GB<br>UPTIME: ${uptime}s<br>ENTITY ENTROPY: ${entropy}<br>PROC A: ${procA}<br>PROC B: ${procB}`;
}
setInterval(updateSystemData,2000);
updateSystemData();

/* expose a function for game.js to call to save progress */
window.saveUserProgress = async function(data){
  try {
    // persist locally
    gameProgress = data;
    currentLevel = (data.level && Number(data.level)) || currentLevel;
    // send to server
    await fetch('/api/saveUserData', {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId, userData: { level: currentLevel, progressData: gameProgress } })
    });
    enqueueLine("> PROGRESS SAVED", false, true);
  } catch(e){
    console.error("saveUserProgress error", e);
  }
};

// script.js
async function getGameState() {
  try {
    const res = await fetch('/api/gameState');
    if (!res.ok) throw new Error('Response not OK');
    const data = await res.json();
    return data.state;
  } catch (err) {
    console.error('Error fetching game state:', err);
    displayToConsole("> ERROR FETCHING GAME STATE\n> ERROR: COMMUNICATION WITH SERVER FAILED");
    return 'OFF';
  }
}

async function toggleGameState(newState) {
  try {
    const res = await fetch('/api/gameState', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: newState })
    });

    if (!res.ok) throw new Error('Bad response from server');
    const data = await res.json();

    if (data.success) {
      displayToConsole(`> GAME STATE CHANGED TO ${newState}`);
    } else {
      displayToConsole("> FAILED TO UPDATE GAME STATE");
    }
  } catch (err) {
    console.error('Error updating game state:', err);
    displayToConsole("> ERROR COMMUNICATING WITH SERVER");
  }
}

// esempio uso nel toggle:
document.getElementById('toggleButton').addEventListener('click', async () => {
  const current = await getGameState();
  const newState = current === 'ON' ? 'OFF' : 'ON';
  await toggleGameState(newState);
  updateToggleUI(newState);
});


/* Admin open/close */
adminIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  if (adminPanel.style.display === 'block') adminPanel.style.display = 'none';
  else adminPanel.style.display = 'block';
});
document.addEventListener('click', (e) => {
  if (!adminPanel.contains(e.target) && e.target !== adminIcon) adminPanel.style.display = 'none';
});
adminPanel.addEventListener('click', e => e.stopPropagation());

/* Admin login */
adminLogin.addEventListener('click', async ()=>{
  if (adminPass.value === 'Seren1987') {
    adminControls.style.display = 'block';
    adminPass.style.display = 'none';
    adminLogin.style.display = 'none';
    // read real state from server upon login
    await fetchGameState();
  } else {
    enqueueLine("> INCORRECT PASSWORD", false, true);
  }
});

/* Toggle handler */
toggleCheckbox.addEventListener('change', async ()=>{
  const newState = toggleCheckbox.checked;
  await updateGameStateOnServer(newState);
});

/* poll server periodically to keep clients in sync */
setInterval(fetchGameState, 5000);
fetchGameState();

/* load player save if exists on server */
async function loadUserData(){
  try {
    const res = await fetch(`/api/getUserData?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data && data.userData) {
      const ud = data.userData;
      currentLevel = ud.level || 1;
      gameProgress = ud.progressData || {};
      enqueueLine(`> LOADED USER PROGRESS (level ${currentLevel})`, false, true);
    } else {
      enqueueLine("> NO SAVED PROGRESS FOUND", false, true);
    }
  } catch(e){ console.error("loadUserData error", e); }
}
loadUserData();

/* Terminal command handler */
const HELP_COMMANDS = ['START','GAME','INFO','TOKENOMICS','CLEAR','HELP','QUIT'];

function handleCommandRaw(raw){
  const cmd = (raw||'').trim().toLowerCase();
  if (!cmd) return;

  // commands always available
  if (cmd === 'help') { enqueueLine(HELP_COMMANDS.map(c=>'['+c+']').join('  '), false, true); return; }
  if (cmd === 'clear') { container.innerHTML = ''; return; }
  if (cmd === 'quit') { enqueueLine('> SYSTEM EXITING...', false, true); return; }

  // start is required to activate main commands
  if (cmd === 'start') {
    systemStarted = true;
    enqueueLine('_SYSTEM BOOTING..._', false, true);
    enqueueLine('_LOADING CORE FILES_', false, true);
    enqueueLine('_INITIALIZING NEURAL MEMORY BANKS_', false, true);
    enqueueLine('_SYSTEM READY_', false, true);
    return;
  }

  if (!systemStarted) {
    enqueueLine('> SYSTEM NOT INITIALIZED. TYPE START', false, true);
    return;
  }

  // after start:
  if (cmd === 'info') { enqueueLine('_ENTITY ID: SEREN.EXE_', false, true); return; }
  if (cmd === 'tokenomics') { enqueueLine('> TOKENOMICS DATA UNAVAILABLE', false, true); return; }
  if (cmd === 'game') {
    if (!gameActive) { enqueueLine('> GAME NOT AVAILABLE. WILL OPEN AT 150k MC.', false, true); return; }
    // launch game via startGame (game.js exposes)
    if (typeof window.startGame === 'function') {
      window.startGame(currentLevel, gameProgress);
      enqueueLine('> GAME MODULE LOADED', false, true);
    } else {
      enqueueLine('> GAME MODULE MISSING', false, true);
    }
    return;
  }

  enqueueLine('> UNRECOGNIZED COMMAND. TYPE HELP', true, true);
}

/* single input listener — routes to game input handler if loaded and game active */
input.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter') return;
  ev.preventDefault();
  const value = input.value;
  input.value = '';

  // if game is active and game handler present, pass input there
  if (gameActive && window.serenGameInputHandler && systemStarted) {
    try {
      window.serenGameInputHandler(value);
    } catch(e) {
      console.error("game input handler error", e);
    }
  } else {
    handleCommandRaw(value);
  }
});
