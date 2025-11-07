const posValues = [1, 2, 3, 4, 5];
const negValues = [1, 2, 3, 4, 5];

const posTray = document.getElementById("posTray");
const negTray = document.getElementById("negTray");
const posOrb = document.getElementById("posOrb");
const negOrb = document.getElementById("negOrb");
const posCountEl = document.getElementById("posCount");
const negCountEl = document.getElementById("negCount");
const netEl = document.getElementById("net");
const canvas = document.getElementById("numberLine");
const ctx = canvas.getContext("2d");

let posSum = 0;
let negSum = 0;
let droppedNumbers = [];
let lastTwo = [];

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
  posCountEl.textContent = posSum;
  negCountEl.textContent = negSum;
  netEl.textContent = posSum - negSum;
}

// ------------------ NUMBER LINE ------------------
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

  ctx.beginPath();
  ctx.moveTo(startX, midY);
  ctx.lineTo(endX, midY);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#222";
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

  droppedNumbers.forEach((val) => {
    const x = startX + (val - min) * step;
    ctx.beginPath();
    ctx.arc(x, midY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = val < 0 ? "#d64545" : "#4caf50";
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  if (lastTwo.length === 2) {
    const x1 = startX + (lastTwo[0] - min) * step;
    const x2 = startX + (lastTwo[1] - min) * step;
    const y = midY;
    const distance = Math.abs(x2 - x1);
    const maxCurveHeight = 40;
    let cpY = y - Math.min(distance / 2, maxCurveHeight);
    if (x1 === x2) cpY = y - 10;
    const cpX = (x1 + x2) / 2;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.quadraticCurveTo(cpX, cpY, x2, y);
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// ------------------ ORB DROP LOGIC ------------------
[posOrb, negOrb].forEach((orb) => {
  orb.addEventListener("dragover", (e) => e.preventDefault());
  orb.addEventListener("drop", (e) => {
    e.preventDefault();
    const value = Number(e.dataTransfer.getData("text/plain"));
    if (value > 0) posSum += value;
    else negSum += -value;
    updateUI();

    droppedNumbers.push(value);
    lastTwo.push(value);
    if (lastTwo.length > 2) lastTwo.shift();
    updateNumberLine();
  });
});

// ------------------ RESET BUTTON ------------------
const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", () => {
  posSum = 0;
  negSum = 0;
  droppedNumbers = [];
  lastTwo = [];
  updateUI();
  updateNumberLine();
});

updateUI();
updateNumberLine();
