const container = document.getElementById('lines-container');
const input = document.getElementById('command');
const systemData = document.getElementById('system-data');

let systemStarted = false, gameActive = false;

// Admin panel
const adminIcon = document.getElementById('admin-icon');
const adminPassWrapper = document.getElementById('admin-pass-wrapper');
const adminLoginBtn = document.getElementById('admin-login');
const adminPassInput = document.getElementById('admin-pass');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');
const gameStatus = document.getElementById('game-status');

let adminAuthenticated = false;

// Mostra/nascondi password
adminIcon.addEventListener('click', ()=> {
  adminPassWrapper.style.display = adminPassWrapper.style.display==='none'?'block':'none';
});

// Login admin
adminLoginBtn.addEventListener('click', async () => {
  if(adminPassInput.value==='Seren1987'){
    adminAuthenticated = true;
    adminControls.style.display = 'block';
    adminPassWrapper.style.display = 'none';
    adminPassInput.value='';
  }
});

// Toggle ON/OFF globale
toggleGameBtn.addEventListener('change', async ()=>{
  if(!adminAuthenticated) return alert("Admin password required!");
  const newState = toggleGameBtn.checked;
  try{
    const res = await fetch('/api/updateGameState', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({password:'Seren1987', gameAvailable:newState})
    });
    const data = await res.json();
    if(data.success){
      gameActive = data.gameAvailable;
      gameStatus.textContent = gameActive ? 'Game: ON' : 'Game: OFF';
      enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`, false, true);
    }
  } catch(e){ console.error(e); }
});
