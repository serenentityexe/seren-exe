const adminPanel = document.getElementById('admin-panel');
const adminIcon = document.getElementById('admin-icon');
const adminForm = document.getElementById('admin-form');
const adminLoginBtn = document.getElementById('admin-login');
const adminPassInput = document.getElementById('admin-pass');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');
const gameStatusSpan = document.getElementById('game-status');

let gameActive = false;

// Mostra/nascondi form cliccando sulla S
adminIcon.addEventListener('click', ()=>{
    adminForm.style.display = adminForm.style.display==='none'?'block':'none';
});

// Clic fuori chiude il form
document.addEventListener('click', (e)=>{
    if(!adminPanel.contains(e.target) && adminForm.style.display==='block'){
        adminForm.style.display='none';
    }
});

// Login admin
adminLoginBtn.addEventListener('click', ()=>{
    if(adminPassInput.value==='Seren1987'){
        adminControls.style.display='block';
        adminPassInput.style.display='none';
        adminLoginBtn.style.display='none';
    } else {
        alert('Password errata');
    }
});

// Toggle ON/OFF funzionante
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
            gameActive = !!data.gameAvailable;
            toggleGameBtn.textContent = gameActive ? 'OFF' : 'ON';
            gameStatusSpan.textContent = gameActive ? 'Game ON' : 'Game OFF';
            enqueueLine(`> GAME STATE SET TO ${gameActive?'ON':'OFF'} BY ADMIN`,false,true);
        } else {
            enqueueLine(`> FAILED TO CHANGE GAME STATE: ${data.error}`,false,true);
        }
    } catch(e){
        console.error(e);
        enqueueLine("> ERROR COMMUNICATING WITH SERVER",false,true);
    }
});
