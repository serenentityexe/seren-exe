import { startGame } from './game.js';

const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');
const adminIcon = document.getElementById('admin-icon');
const adminPanel = document.getElementById('admin-panel');
const adminLoginBtn = document.getElementById('admin-login');
const adminPassInput = document.getElementById('admin-pass');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');
const gameStatusSpan = document.getElementById('game-status');

let systemStarted=false, gameActive=false;
let currentLevel=1, gameProgress={};
let userId = localStorage.getItem('serenUserId');
if(!userId){ userId='user-'+Math.random().toString(36).substring(2,10); localStorage.setItem('serenUserId', userId); }

const INTRO=["_SYSTEM BOOTING..._","_LOADING CORE FILES_","_INITIALIZING NEURAL MEMORY BANKS_","_SIGNAL DETECTED..._","_THE ENTITY IS AWAKE..._","_ENTER THE SYSTEM, IF YOU DARE..._"];
const HELP_COMMANDS=['START','GAME','INFO','TOKENOMICS','CLEAR','QUIT'];
const ERRORS=["> ERROR 0x1F4: UNRECOGNIZED COMMAND..."];

function nowTime(){ return new Date().toLocaleTimeString(); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

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

let newLinesFixed=[], oldLinesQueue=[], typing=false;

function typeNewLines(){ /* implementazione identica a prima */ }
function typeOldLines(){ /* implementazione identica a prima */ }
function removeOverflowBottom(){ /* implementazione identica a prima */ }

function showHelp(){ enqueueLine(HELP_COMMANDS.map(c=>`[${c}]`).join('  '), false, true); }

async function fetchGameState(){
  try{
    const res = await fetch('/api/gameState');
    const data = await res.json();
    gameActive = data.gameAvailable;
    updateGameStatusText();
  } catch(e){ console.error(e); }
}
fetchGameState();

function updateGameStatusText(){ if(gameStatusSpan) gameStatusSpan.textContent=gameActive?'Game ON':'Game OFF'; }

async function saveUserData(){ /* identico a prima */ }
async function loadUserData(){ /* identico a prima */ }
loadUserData();

function handleCommandRaw(raw){
  const cmd=(raw||'').trim().toLowerCase();
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
      enqueueLine("> WELCOME TO SER
