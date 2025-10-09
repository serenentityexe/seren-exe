const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');

let systemStarted = false, gameActive = false;
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

function nowTime(){return new Date().toLocaleTimeString();}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

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

// --- Command handler ---
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
      if(!window.serenGameLoaded){
        const script = document.createElement('script');
        script.src = 'game.js';
        script.onload = ()=> enqueueLine("> GAME LOGIC LOADED.",false,true);
        document.body.appendChild(script);
      } else {
        enqueueLine("> GAME READY.",false,true);
      }
    break;
    default: enqueueLine(pick(ERRORS),true,true); enqueueLine("TYPE 'HELP' FOR AVAILABLE COMMANDS.",true,true);
  }
}

// --- Input handling ---
input.addEventListener('keydown',ev=>{
  if(ev.key!=='Enter') return; 
  ev.preventDefault(); 
  const value=input.value; input.value=''; 

  if(gameActive && window.serenGameInputHandler && document.activeElement === input){
    window.serenGameInputHandler(value);
  } else {
    handleCommandRaw(value);
  }
});

// --- Inactivity ---
let inactivityTimer=null;
function resetInactivity(){ 
  if(inactivityTimer) clearTimeout(inactivityTimer); 
  inactivityTimer=setTimeout(()=>{ enqueueLine("THE ENTITY WATCHES YOU...",true,false); },10000);
}
['keydown','mousemove','mousedown','touchstart'].forEach(e=>window.addEventListener(e,resetInactivity));
resetInactivity();

// --- Glitch effect ---
setInterval(()=>{document.getElementById('output-wrapper').classList.add('glitch'); setTimeout(()=>document.getElementById('output-wrapper').classList.remove('glitch'),220);},8000);

// --- Admin panel ---
const adminPanel = document.getElementById('admin-panel');
const adminIcon = document.getElementById('admin-toggle-icon');
const adminForm = document.getElementById('admin-form');
const adminPassInput = document.getElementById('admin-pass');
const adminLoginBtn = document.getElementById('admin-login');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');

// toggle form
adminIcon.addEventListener('click', ()=>{ adminForm.style.display = adminForm.style.display==='none'?'block':'none'; });
document.addEventListener('click', (e)=>{ if(!adminPanel.contains(e.target) && adminForm.style.display==='block') adminForm.style.display='none'; });

// admin login
adminLoginBtn.addEventListener('click', ()=>{
  if(adminPassInput.value==='Seren1987'){
    adminControls.style.display='block';
    adminForm.style.display='none';
    enqueueLine("> ADMIN LOGGED IN SUCCESSFULLY", false, true);
  } else {
    enqueueLine("> INCORRECT PASSWORD", false, true);
  }
});

// --- Admin toggle ON/OFF con spia --- 
const toggleGameBtn = document.getElementById('toggle-game');

// crea spia LED
let led = document.createElement('span');
led.style.width = '12px';
led.style.height = '12px';
led.style.borderRadius = '50%';
led.style.display = 'inline-block';
led.style.marginRight = '8px';
led.style.backgroundColor = gameActive ? 'green' : 'red';
toggleGameBtn.prepend(led);

// funzione per aggiornare spia e testo bottone
function updateToggleUI() {
    led.style.backgroundColor = gameActive ? 'green' : 'red';
    toggleGameBtn.textContent = (gameActive ? 'ON' : 'OFF');
    toggleGameBtn.prepend(led); // riaggiunge LED
}

// click toggle
toggleGameBtn.addEventListener('click', async ()=>{
    const newState = !gameActive;
    try{
        const res = await fetch('/api/updateGameState',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({password:'Seren1987', gameAvailable:newState})
        });
        const data = await res.json();
        if(data.success){
            gameActive = data.gameAvailable;
            updateToggleUI();
            enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`, false, true);
        }
    } catch(e){
        console.error(e);
        enqueueLine("> ERROR TOGGLE FAILED", false, true);
    }
});

// inizializza UI
updateToggleUI();


