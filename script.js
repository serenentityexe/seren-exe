const input = document.getElementById("user-input");
const output = document.getElementById("output");

let consoleActive = false;
let gameAvailable = false;

// === Terminal logic ===
async function loadGameState() {
  try {
    const res = await fetch('/api/getGameState');
    const data = await res.json();
    gameAvailable = data.gameAvailable;
  } catch {
    enqueueLine("> ERROR: COULD NOT LOAD GAME STATE");
  }
}
loadGameState();

function enqueueLine(text) {
  const line = document.createElement("div");
  line.textContent = text;
  output.prepend(line);
}

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const cmd = input.value.trim().toUpperCase();
    input.value = "";

    if (!consoleActive) {
      if (cmd === "HELP") {
        enqueueLine("> AVAILABLE COMMAND: START");
      } else if (cmd === "START") {
        consoleActive = true;
        enqueueLine("> SYSTEM BOOTING...");
        setTimeout(() => enqueueLine("> ACCESS GRANTED. TYPE A COMMAND."), 1500);
      } else {
        enqueueLine("> UNKNOWN COMMAND. TYPE HELP.");
      }
      return;
    }

    // Commands after START
    if (cmd === "QUIT") {
      consoleActive = false;
      enqueueLine("> SESSION TERMINATED.");
      return;
    }

    if (cmd === "GAME") {
      if (!gameAvailable) {
        enqueueLine("> GAME OFFLINE. Will activate at 150k MC.");
      } else {
        enqueueLine("> Welcome back... Initiating Seren.exe game sequence...");
        // placeholder for your actual game logic
      }
      return;
    }

    enqueueLine("> UNKNOWN COMMAND.");
  }
});

// ====== ADMIN PANEL ======
const adminIcon = document.getElementById('admin-icon');
const adminPanel = document.getElementById('admin-panel');
const adminPassInput = document.getElementById('admin-pass');
const adminLoginBtn = document.getElementById('admin-login');
const adminControls = document.getElementById('admin-controls');
const toggleGameBtn = document.getElementById('toggle-game');
let adminOpen = false;

adminIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  adminOpen = !adminOpen;
  adminPanel.classList.toggle('visible', adminOpen);
});
document.addEventListener('click', (e) => {
  if (adminOpen && !adminPanel.contains(e.target) && e.target !== adminIcon) {
    adminPanel.classList.remove('visible');
    adminOpen = false;
  }
});

adminLoginBtn.addEventListener('click', async ()=>{
  if(adminPassInput.value.trim() === 'Seren1987'){
    adminControls.classList.remove('hidden');
    adminPassInput.style.display='none';
    adminLoginBtn.style.display='none';
  }
});

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
      enqueueLine(`> GAME STATE SET TO ${newState?'ON':'OFF'} BY ADMIN`);
    } else {
      enqueueLine("> ADMIN ERROR: CANNOT CHANGE STATE");
    }
  } catch(err){
    console.error(err);
    enqueueLine("> CONNECTION ERROR TO SERVER");
  }
});
