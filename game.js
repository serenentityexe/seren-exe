export function startGame(level) {
  const container = document.getElementById("lines-container");

  const levels = {
    1: {
      message: "> LEVEL 1: Decode this word → 'NIETSRNE'",
      answer: "serenitn",
    },
    2: {
      message: "> LEVEL 2: Caesar cipher +3 → 'vhuhq'",
      answer: "seren",
    },
  };

  const current = levels[level] || levels[1];
  const line = document.createElement("div");
  line.className = "output-line";
  line.innerHTML = current.message;
  container.appendChild(line);
}
