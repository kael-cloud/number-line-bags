const posValues = [1, 2, 3, 4, 5];
const negValues = [1, 2, 3, 4, 5];

const posTray = document.getElementById("posTray");
const negTray = document.getElementById("negTray");
const centralBoat = document.getElementById("centralBoat");
const posCountEl = document.getElementById("posCount");
const negCountEl = document.getElementById("negCount");
const netEl = document.getElementById("net");
const canvas = document.getElementById("numberLine");
const ctx = canvas.getContext("2d");

let posSum = 0;
let negSum = 0;
let netTotal = 0;

let droppedNumbers = [];
let lastTwo = [];

let activeOperation = "+"; // DEFAULT OPERATION

// ------------------ CREATE NUMBERS ------------------
function makeNumber(value, sign) {
  const el = document.createElement("div");
  el.className = "coin " + (sign === "pos" ? "positive" : "negative");
  el.textContent = (sign === "pos" ? "+" : "-") + value;
  el.dataset.val = value;
  el.dataset.sign = sign;
  el.draggable = true;

  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      el.dataset.sign === "pos" ? value : -value
    );
  });

  return el;
}

posValues.forEach((v) => posTray.appendChild(makeNumber(v, "pos")));
negValues.forEach((v) => negTray.appendChild(makeNumber(v, "neg")));

// ------------------ UPDATE UI ------------------
function updateUI() {
  posCountEl.textContent = "Pos: " + posSum;
  negCountEl.textContent = "Neg: " + negSum;
  netEl.textContent = netTotal;
}

// ------------------ APPLY OPERATION (FIXED) ------------------
function applyOperation(value) {
  if (activeOperation === "+") {
    netTotal = netTotal + value;
  }

  if (activeOperation === "-") {
    netTotal = netTotal - value;
  }

  if (activeOperation === "x") {
    netTotal = netTotal * value;
  }

  if (activeOperation === "÷") {
    if (value !== 0) {
      netTotal = netTotal / value;
    }
  }
}

// ------------------ DRAW NUMBER LINE ------------------
function updateNumberLine() {
  const width = canvas.width;
  const height = canvas.height;
  const min = -5;
  const max = 5;
  const midY = height / 2;
  const startX = 50;
  const endX = width - 50;
  const step = (endX - startX) / (max - min);

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#89c4ff";
  ctx.fillRect(0, midY + 30, width, height - midY);

  ctx.beginPath();
  ctx.moveTo(startX, midY);
  ctx.lineTo(endX, midY);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.font = "14px Arial";
  for (let i = min; i <= max; i++) {
    const x = startX + (i - min) * step;
    ctx.beginPath();
    ctx.moveTo(x, midY - 10);
    ctx.lineTo(x, midY + 10);
    ctx.stroke();
    ctx.fillText(i, x, midY + 25);
  }

  droppedNumbers.forEach((val, idx) => {
    const x = startX + (val - min) * step;
    const y = midY - 10 + Math.sin(Date.now() / 300 + idx) * 3;

    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x + 15, y + 8);
    ctx.lineTo(x - 15, y + 8);
    ctx.closePath();

    ctx.fillStyle = val < 0 ? "#d64545" : "#4caf50";
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.stroke();
  });

  if (lastTwo.length === 2) {
    const x1 = startX + (lastTwo[0] - min) * step;
    const x2 = startX + (lastTwo[1] - min) * step;
    const y = midY;

    const cpX = (x1 + x2) / 2;
    const cpY = y - 40;

    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.quadraticCurveTo(cpX, cpY, x2, y);
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  requestAnimationFrame(updateNumberLine);
}

// ------------------ DROP LOGIC ------------------
centralBoat.addEventListener("dragover", (e) => e.preventDefault());

centralBoat.addEventListener("drop", (e) => {
  e.preventDefault();
  const value = Number(e.dataTransfer.getData("text/plain"));

  if (value > 0) posSum += value;
  else negSum += -value;

  applyOperation(value);

  droppedNumbers.push(value);
  lastTwo.push(value);
  if (lastTwo.length > 2) lastTwo.shift();

  updateUI();
});

// ------------------ OPERATION BUTTONS ------------------
const opBtns = document.querySelectorAll(".op");

opBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    opBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    activeOperation = btn.dataset.op;
  });
});

// ------------------ RESET ------------------
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {
  posSum = 0;
  negSum = 0;
  netTotal = 0;
  droppedNumbers = [];
  lastTwo = [];

  updateUI();
});

updateUI();
updateNumberLine();
