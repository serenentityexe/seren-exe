import { startGame } from './game.js';

const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');

let systemStarted = false;
let gameActive = false;
let currentLevel = 1;
let gameProgress = {};

let userId = localStorage.getItem('serenUserId');
if (!userId) { userId = 'user-'+Math.random().toString(36).substring(2,10); localStorage.setItem('serenUserId',userId); }

// Terminal helper
function enqueueLine(text){
    const line = document.createElement('div');
    line.className='output-line';
    line.innerHTML=text;
    container.insertBefore(line, container.firstChild);
}

// Commands
function handleCommandRaw(raw){
    const cmd=(raw||'').trim().toLowerCase();
    if(!cmd) return;
    if(cmd==='help'){ enqueueLine('[START]  [GAME]  [INFO]  [TOKENOMICS]  [CLEAR]  [QUIT]'); return; }
    if(cmd==='start'){ systemStarted=true; enqueueLine("_SYSTEM BOOTING_"); enqueueLine("_LOADING CORE FILES_"); enqueueLine("_ENTER THE SYSTEM_"); return; }
    if(cmd==='clear'){ container.innerHTML=''; return; }
    if(cmd==='quit'){ enqueueLine("> SYSTEM EXITING..."); return; }

    if(!systemStarted){ enqueueLine("> ERROR: SYSTEM NOT ACTIVE"); enqueueLine("TYPE 'START' TO INITIALIZE"); return; }

    switch(cmd){
        case 'info': enqueueLine("_ENTITY ID: SEREN.EXE_"); break;
        case 'tokenomics': enqueueLine("> TOKENOMICS DATA UNAVAILABLE..."); break;
        case 'game':
            if(!gameActive){ enqueueLine("> GAME NOT AVAILABLE. WILL OPEN AT 150k MC."); break; }
            enqueueLine("> GAME MODULE LOADING...");
            enqueueLine("> WELCOME TO SEREN.EXE GAME...");
            startGame(currentLevel,gameProgress);
            break;
        default: enqueueLine("> ERROR: UNRECOGNIZED COMMAND...");
    }
}

input.addEventListener('keydown', ev=>{
    if(ev.key!=='Enter') return;
    ev.preventDefault();
    const value=input.value; input.value='';
    handleCommandRaw(value);
});

// Admin UI
const adminPanel=document.getElementById('admin-panel');
const adminIcon=document.getElementById('admin-icon');
const adminForm=document.getElementById('admin-form');
const adminLoginBtn=document.getElementById('admin-login');
const adminPassInput=document.getElementById('admin-pass');
const adminControls=document.getElementById('admin-controls');
const toggleGameBtn=document.getElementById('toggle-game');
const gameStatusSpan=document.getElementById('game-status');

// Toggle admin form
adminIcon.addEventListener('click', ()=>{ adminForm.style.display='block'; });
document.addEventListener('click', e=>{ if(!adminPanel.contains(e.target)) adminForm.style.display='none'; });

// Admin login
adminLoginBtn.addEventListener('click', async ()=>{
    if(adminPassInput.value==='Seren1987'){
        adminControls.style.display='block';
        adminForm.style.display='none';
        try{
            const res = await fetch('/api/gameState');
            const data = await res.json();
            gameActive = data.gameAvailable;
            updateGameStatusText();
        } catch(e){ enqueueLine("> ERROR FETCHING GAME STATE"); console.error(e); }
    }
});

// Toggle game state
toggleGameBtn.addEventListener('click', async ()=>{
    const newState = !gameActive;
    try{
        const res = await fetch('/api/updateGameState',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ password:'Seren1987', gameAvailable:newState })
        });
        const data = await res.json();
        if(data.success){ gameActive=data.gameAvailable; updateGameStatusText(); enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`);}
        else enqueueLine(`> ERROR UPDATING GAME STATE: ${data.error}`);
    } catch(e){ enqueueLine("> ERROR UPDATING GAME STATE"); console.error(e);}
});

function updateGameStatusText(){ gameStatusSpan.textContent=gameActive?'Game: ON':'Game: OFF'; }
