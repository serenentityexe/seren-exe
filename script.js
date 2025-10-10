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

// Terminal lines
let newLinesFixed = [], oldLinesQueue = [], typing = false;

function enqueueLine(text, fast=false, newText=false){
    if(newText){
        const line = document.createElement('div'); 
        line.className = 'output-line'; line.innerHTML = '';
        container.insertBefore(line, container.firstChild);
        newLinesFixed.push({el:line, text, fast});
        if(!typing) typeNewLines();
    } else {
        oldLinesQueue.push({text, fast});
        if(!typing) typeOldLines();
    }
}

function typeNewLines(){
    if(newLinesFixed.length === 0) { typing = false; return; }
    typing = true;
    const obj = newLinesFixed.shift();
    const line = obj.el, text = obj.text, fast = obj.fast;
    let i = 0;
    function typeChar(){
        if(i < text.length) { line.innerHTML += text[i++]; setTimeout(typeChar, fast ? 8 : 25 + Math.random()*50); }
        else typeNewLines();
    }
    typeChar();
}

function typeOldLines(){
    if(oldLinesQueue.length === 0) { typing = false; return; }
    typing = true;
    const obj = oldLinesQueue.shift();
    const line = document.createElement('div'); line.className='output-line'; line.innerHTML='';
    container.appendChild(line);
    let i=0, shift=0;
    function typeChar(){
        if(i<obj.text.length){
            line.innerHTML += obj.text[i++];
            shift += 0.5;
            line.style.transform = `translateY(${shift}px)`;
            setTimeout(typeChar,obj.fast?8:25+Math.random()*50);
        } else {
            removeOverflowBottom();
            typeOldLines();
        }
    }
    typeChar();
}

function removeOverflowBottom(){
    const nodes = Array.from(container.querySelectorAll('.output-line'));
    const wrapRect = document.getElementById('output-wrapper').getBoundingClientRect();
    nodes.forEach(node=>{
        const r = node.getBoundingClientRect();
        if(r.bottom > wrapRect.bottom-6){ node.classList.add('fade-out'); setTimeout(()=>{if(node.parentElement) node.remove();},420);}
    });
}

// Commands
function handleCommandRaw(raw){
    const cmd = (raw||'').trim().toLowerCase();
    if(!cmd) return;

    if(cmd==='help'){ enqueueLine('[START]  [GAME]  [INFO]  [TOKENOMICS]  [CLEAR]  [QUIT]', false, true); return; }
    if(cmd==='start'){ systemStarted=true; enqueueLine("_SYSTEM BOOTING..._", false,true); enqueueLine("_LOADING CORE FILES_", false,true); enqueueLine("_ENTER THE SYSTEM_", false,true); return; }
    if(cmd==='clear'){ container.innerHTML=''; newLinesFixed=[]; oldLinesQueue=[]; return; }
    if(cmd==='quit'){ enqueueLine("> SYSTEM EXITING...", false,true); return; }

    if(!systemStarted){ enqueueLine("> ERROR: SYSTEM NOT ACTIVE", true,true); enqueueLine("TYPE 'START' TO INITIALIZE", true,true); return; }

    switch(cmd){
        case'info': enqueueLine("_ENTITY ID: SEREN.EXE_",false,true); break;
        case'tokenomics': enqueueLine("> TOKENOMICS DATA UNAVAILABLE...",false,true); break;
        case'game':
            if(!gameActive){ enqueueLine("> GAME NOT AVAILABLE. WILL OPEN AT 150k MC.",false,true); break; }
            enqueueLine("> GAME MODULE LOADING...",false,true);
            enqueueLine("> WELCOME TO SEREN.EXE GAME...",false,true);
            import('./game.js').then(module => module.startGame(currentLevel, gameProgress));
            break;
        default: enqueueLine("> ERROR: UNRECOGNIZED COMMAND...",true,true);
    }
}

input.addEventListener('keydown', ev=>{
    if(ev.key !== 'Enter') return;
    ev.preventDefault();
    const value = input.value; input.value='';
    handleCommandRaw(value);
});

// Inactivity
let inactivityTimer=null;
function resetInactivity(){ 
    if(inactivityTimer) clearTimeout(inactivityTimer); 
    inactivityTimer=setTimeout(()=>{ enqueueLine("THE ENTITY WATCHES YOU...",true,false); },10000);
}
['keydown','mousemove','mousedown','touchstart'].forEach(e=>window.addEventListener(e,resetInactivity));
resetInactivity();

// Poll typing
function poll(){ if(!typing&&(oldLinesQueue.length>0||newLinesFixed.length>0)){ typeNewLines(); typeOldLines(); } requestAnimationFrame(poll);}
poll();

// Admin Panel
const adminPanel = document.getElementById('admin-panel');
const adminLoginBtn = document.getElementById('admin-login');
const adminPassInput = document.getElementById('admin-pass');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');
const gameStatusSpan = document.getElementById('game-status');

adminLoginBtn.addEventListener('click', async ()=>{
    if(adminPassInput.value === 'Seren1987'){
        adminControls.style.display='block';
        adminPassInput.style.display='none';
        adminLoginBtn.style.display='none';
        // Fetch current game state
        try {
            const res = await fetch('/api/gameState');
            const data = await res.json();
            gameActive = data.gameAvailable;
            updateGameStatusText();
        } catch(e){ enqueueLine("> ERROR FETCHING GAME STATE", false,true); console.error(e); }
    }
});

toggleGameBtn.addEventListener('click', async ()=>{
    const newState = !gameActive;
    try{
        const res = await fetch('/api/updateGameState', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ password:'Seren1987', gameAvailable: newState })
        });
        const data = await res.json();
        if(data.success){
            gameActive = data.gameAvailable;
            updateGameStatusText();
            enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`, false,true);
        } else {
            enqueueLine(`> ERROR UPDATING GAME STATE: ${data.error}`, false,true);
        }
    } catch(e){ enqueueLine("> ERROR UPDATING GAME STATE", false,true); console.error(e); }
});

function updateGameStatusText(){
    gameStatusSpan.textContent = gameActive ? 'Game: ON' : 'Game: OFF';
}
