// ====== ADMIN ICON & PANEL ======
const adminIcon = document.getElementById('admin-icon');
const adminPanel = document.getElementById('admin-panel');
const adminPassInput = document.getElementById('admin-pass');
const adminLoginBtn = document.getElementById('admin-login');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');

let adminOpen = false;

// Mostra / nasconde il pannello password
adminIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  adminOpen = !adminOpen;
  adminPanel.classList.toggle('visible', adminOpen);
});

// Chiudi cliccando fuori
document.addEventListener('click', (e) => {
  if (adminOpen && !adminPanel.contains(e.target) && e.target !== adminIcon) {
    adminPanel.classList.remove('visible');
    adminOpen = false;
  }
});

// Login admin
adminLoginBtn.addEventListener('click', async ()=>{
  if(adminPassInput.value.trim() === 'Seren1987'){
    adminControls.classList.remove('hidden');
    adminPassInput.style.display='none';
    adminLoginBtn.style.display='none';
  }
});

// Toggle ON/OFF globale
toggleGameBtn.addEventListener('change', async ()=>{
  const newState = toggleGameBtn.checked;
  try {
    const res = await fetch('/api/updateGameState', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ password: 'Seren1987', gameAvailable: newState })
    });
    const data = await res.json();
    if(data.success){
      enqueueLine(`> GAME STATE SET TO ${newState?'ON':'OFF'} BY ADMIN`, false, true);
    } else {
      enqueueLine("> ADMIN ERROR: CANNOT CHANGE STATE", false, true);
    }
  } catch(err){
    console.error(err);
    enqueueLine("> CONNECTION ERROR TO SERVER", false, true);
  }
});
