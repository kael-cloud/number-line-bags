const posValues = [1, 2, 3, 4, 5];
const negValues = [1, 2, 3, 4, 5];

const posTray = document.getElementById("posTray");
const negTray = document.getElementById("negTray");
const posOrb = document.getElementById("posOrb");
const negOrb = document.getElementById("negOrb");
const posCountEl = document.getElementById("posCount");
const negCountEl = document.getElementById("negCount");
const netEl = document.getElementById("net");
const marker = document.getElementById("marker");
const line = document.querySelector(".number-line");

let posSum = 0;
let negSum = 0;

function makeCoin(value, sign) {
  const coin = document.createElement("div");
  coin.className = "coin " + (sign === "pos" ? "positive" : "negative");
  coin.textContent = (sign === "pos" ? "+" : "-") + value;
  coin.dataset.val = value;
  coin.dataset.sign = sign;
  coin.draggable = false;
  setupPointerDrag(coin);
  return coin;
}

posValues.forEach((v) => posTray.appendChild(makeCoin(v, "pos")));
negValues.forEach((v) => negTray.appendChild(makeCoin(v, "neg")));

function updateUI() {
  posCountEl.textContent = posSum;
  negCountEl.textContent = negSum;
  const total = posSum - negSum;
  netEl.textContent = total;

  // update number line marker
  const max = 15;
  const min = -15;
  const percent = (total - min) / (max - min);
  const x = percent * line.clientWidth;
  marker.style.left = `${x}px`;
  marker.textContent = total;

  // color of marker
  if (total > 0) marker.style.color = "#2e8b2e";
  else if (total < 0) marker.style.color = "#c92424";
  else marker.style.color = "#333";
}

function animateToOrb(fromEl, orbEl, onComplete) {
  const start = fromEl.getBoundingClientRect();
  const end = orbEl.getBoundingClientRect();

  const clone = fromEl.cloneNode(true);
  clone.classList.add("floating");
  clone.style.left = start.left + "px";
  clone.style.top = start.top + "px";
  clone.style.width = start.width + "px";
  clone.style.height = start.height + "px";
  document.body.appendChild(clone);
  void clone.offsetWidth;

  const tx = end.left + end.width / 2 - start.width / 2;
  const ty = end.top + end.height / 2 - start.height / 2;

  requestAnimationFrame(() => {
    clone.style.left = tx + "px";
    clone.style.top = ty + "px";
    clone.style.transform = "scale(0.6)";
    clone.style.opacity = "0.9";
  });

  setTimeout(() => {
    clone.remove();
    if (onComplete) onComplete();
  }, 400);
}

function setupPointerDrag(el) {
  let active = false;
  let offsetX = 0,
    offsetY = 0;
  let floating = null;

  function startPointer(e) {
    e.preventDefault();
    active = true;
    const p = getPointerPos(e);
    const r = el.getBoundingClientRect();
    offsetX = p.x - r.left;
    offsetY = p.y - r.top;

    floating = el.cloneNode(true);
    floating.classList.add("floating");
    floating.style.left = r.left + "px";
    floating.style.top = r.top + "px";
    floating.style.width = r.width + "px";
    floating.style.height = r.height + "px";
    floating.style.opacity = "0.98";
    document.body.appendChild(floating);

    requestAnimationFrame(
      () => (floating.style.transform = "translate(0,-6px) scale(1.02)")
    );

    window.addEventListener("pointermove", movePointer, { passive: false });
    window.addEventListener("pointerup", endPointer);
  }

  function getPointerPos(ev) {
    if (ev.touches && ev.touches[0])
      return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    return { x: ev.clientX, y: ev.clientY };
  }

  function movePointer(ev) {
    if (!active) return;
    ev.preventDefault();
    const p = getPointerPos(ev);
    floating.style.left = p.x - offsetX + "px";
    floating.style.top = p.y - offsetY + "px";
  }

  function endPointer(ev) {
    if (!active) return;
    active = false;
    window.removeEventListener("pointermove", movePointer);
    window.removeEventListener("pointerup", endPointer);

    const p = getPointerPos(ev);
    const dropX = p.x,
      dropY = p.y;
    const orbs = [posOrb, negOrb];
    let droppedOrb = null;

    for (const o of orbs) {
      const r = o.getBoundingClientRect();
      if (
        dropX >= r.left &&
        dropX <= r.right &&
        dropY >= r.top &&
        dropY <= r.bottom
      ) {
        droppedOrb = o;
        break;
      }
    }

    const sign = el.dataset.sign;
    const value = Number(el.dataset.val);

    if (droppedOrb) {
      animateToOrb(floating, droppedOrb, () => {
        if (droppedOrb === posOrb && sign === "pos") posSum += value;
        if (droppedOrb === negOrb && sign === "neg") negSum += value;
        updateUI();
      });
    } else {
      floating.style.transition =
        "transform .25s ease, left .25s ease, top .25s ease, opacity .25s";
      floating.style.opacity = "0.05";
      setTimeout(() => floating.remove(), 260);
    }
  }

  el.addEventListener("pointerdown", startPointer);
}

updateUI();
