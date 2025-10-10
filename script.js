// Terminal elements
const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');

let systemStarted = false, gameActive = false;
let currentLevel = 1;
let gameProgress = {};

// User ID for persistent storage
let userId = localStorage.getItem('serenUserId');
if (!userId) { 
    userId = 'user-' + Math.random().toString(36).substring(2,10); 
    localStorage.setItem('serenUserId', userId); 
}

// Terminal texts
const INTRO = ["_SYSTEM BOOTING..._","_LOADING CORE FILES_","_INITIALIZING NEURAL MEMORY BANKS_","_SIGNAL DETECTED..._","_THE ENTITY IS AWAKE..._","_ENTER THE SYSTEM, IF YOU DARE..._"];
const HELP_COMMANDS = ['START','GAME','INFO','TOKENOMICS','CLEAR','QUIT'];
const ERRORS = ["> ERROR 0x1F4: UNRECOGNIZED COMMAND..."];

function nowTime(){ return new Date().toLocaleTimeString(); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// System data display
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

// Terminal line queues
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
    nodes.forEach(node=>{ 
        const r=node.getBoundingClientRect(); 
        if(r.bottom>wrapRect.bottom-6){node.classList.add('fade-out'); setTimeout(()=>{if(node.parentElement) node.remove();},420);} 
    });
}

function showHelp(){ enqueueLine(HELP_COMMANDS.map(c=>`[${c}]`).join('  '),false,true); }

// Admin panel with pallino trigger
const adminToggleIcon = document.createElement('div');
adminToggleIcon.id = 'admin-toggle-icon';
adminToggleIcon.textContent = '●';
adminToggleIcon.style.position = 'absolute';
adminToggleIcon.style.top = '10px';
adminToggleIcon.style.right = '10px';
adminToggleIcon.style.cursor = 'pointer';
adminToggleIcon.style.fontWeight = '700';
adminToggleIcon.style.fontSize = '20px';
adminToggleIcon.style.color = '#7f9a71';
adminToggleIcon.style.zIndex = '1000';
document.body.appendChild(adminToggleIcon);

const adminPassWrapper = document.createElement('div');
adminPassWrapper.id = 'admin-pass-wrapper';
adminPassWrapper.style.display = 'none';
adminPassWrapper.style.position = 'absolute';
adminPassWrapper.style.top = '40px';
adminPassWrapper.style.right = '10px';
adminPassWrapper.style.background = '#111';
adminPassWrapper.style.border = '2px solid #7f9a71';
adminPassWrapper.style.padding = '8px';
adminPassWrapper.style.borderRadius = '6px';
adminPassWrapper.style.zIndex = '999';
document.body.appendChild(adminPassWrapper);

const adminPassInput = document.createElement('input');
adminPassInput.type = 'password';
adminPassInput.placeholder = 'Password admin';
adminPassWrapper.appendChild(adminPassInput);

const adminLoginBtn = document.createElement('button');
adminLoginBtn.textContent = 'Login';
adminPassWrapper.appendChild(adminLoginBtn);

const adminControls = document.createElement('div');
adminControls.id='admin-controls';
adminControls.style.display='none';
adminPassWrapper.appendChild(adminControls);

const toggleGameBtn = document.createElement('button');
toggleGameBtn.textContent='ON / OFF';
adminControls.appendChild(toggleGameBtn);

const gameStatusSpan = document.createElement('span');
gameStatusSpan.id='game-status';
gameStatusSpan.style.marginLeft='10px';
adminControls.appendChild(gameStatusSpan);

let adminOpen=false;
adminToggleIcon.addEventListener('click', e=>{
    e.stopPropagation();
    adminOpen = !adminOpen;
    adminPassWrapper.style.display = adminOpen ? 'block' : 'none';
});

document.addEventListener('click', e=>{
    if(adminOpen && !adminPassWrapper.contains(e.target) && e.target !== adminToggleIcon){
        adminPassWrapper.style.display = 'none';
        adminOpen=false;
    }
});

// Admin login
adminLoginBtn.addEventListener('click', async ()=>{
    if(adminPassInput.value==='Seren1987'){
        adminControls.style.display='block';
        adminPassInput.style.display='none';
        adminLoginBtn.style.display='none';
        enqueueLine("> ADMIN LOGGED IN", false, true);
    } else enqueueLine("> WRONG PASSWORD", false, true);
});

// Fetch and update game state
async function fetchGameState(){
    try{
        const res = await fetch('/api/gameState');
        const data = await res.json();
        gameActive = data.gameAvailable;
        updateGameStatusText();
    }catch(e){ enqueueLine("> ERROR FETCHING GAME STATE", false, true); console.error(e);}
}
fetchGameState();

function updateGameStatusText(){
    gameStatusSpan.textContent = gameActive ? 'Game: ON' : 'Game: OFF';
}

// Toggle game ON/OFF
toggleGameBtn.addEventListener('click', async ()=>{
    const newState = !gameActive;
    try{
        const res = await fetch('/api/updateGameState',{
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({password:'Seren1987', gameAvailable:newState})
        });
        const data = await res.json();
        if(data.success){
            gameActive = data.gameAvailable;
            updateGameStatusText();
            enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`,false,true);
        }
    }catch(e){ enqueueLine("> ERROR UPDATING GAME STATE", false, true); console.error(e);}
});

// User data save/load
async function saveUserData(){
    const userData = {level:currentLevel, progressData:gameProgress};
    try{ await fetch('/api/saveUserData',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({userId,userData})
    }); } catch(e){ console.error(e);}
}

async function loadUserData(){
    try{
        const res = await fetch(`/api/getUserData?userId=${userId}`);
        const data = await res.json();
        if(data.userData && data.userData.level){ 
            currentLevel = data.userData.level;
            gameProgress = data.userData.progressData || {};
        }
    }catch(e){ console.error(e);}
}
loadUserData();

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
            enqueueLine("> GAME MODULE LOADING...",false,true);
            enqueueLine("> WELCOME TO SEREN.EXE GAME...",false,true);
            if(window.startGame) window.startGame(currentLevel,gameProgress);
            break;
        default: enqueueLine(pick(ERRORS),true,true); enqueueLine("TYPE 'HELP' FOR AVAILABLE COMMANDS.",true,true);
    }
}

// Input handling
input.addEventListener('keydown', ev=>{
    if(ev.key!=='Enter') return;
    ev.preventDefault();
    const value = input.value; input.value='';
    handleCommandRaw(value);
    saveUserData();
});

// Inactivity
let inactivityTimer=null;
function resetInactivity(){ 
    if(inactivityTimer) clearTimeout(inactivityTimer); 
    inactivityTimer=setTimeout(()=>{ enqueueLine("THE ENTITY WATCHES YOU...",true,false); },10000);
}
['keydown','mousemove','mousedown','touchstart'].forEach(e=>window.addEventListener(e,resetInactivity));
resetInactivity();

// Terminal glitch effect
setInterval(()=>{document.getElementById('output-wrapper').classList.add('glitch'); setTimeout(()=>document.getElementById('output-wrapper').classList.remove('glitch'),220);},8000);

// Poll typing
function poll(){ if(!typing&&(oldLinesQueue.length>0||newLinesFixed.length>0)) { typeNewLines(); typeOldLines(); } requestAnimationFrame(poll);}
poll();
