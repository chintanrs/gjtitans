const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const contentLayer = document.getElementById("contentLayer");

const svg = document.getElementById("energyArcs");

const paths = {
  squad: document.getElementById("arc-squad"),
  fixtures: document.getElementById("arc-fixtures"),
  gallery: document.getElementById("arc-gallery"),
};

const dots = {
  squad: document.getElementById("dot-squad"),
  fixtures: document.getElementById("dot-fixtures"),
  gallery: document.getElementById("dot-gallery"),
};

const grads = {
  squad: document.getElementById("grad-squad"),
  fixtures: document.getElementById("grad-fixtures"),
  gallery: document.getElementById("grad-gallery"),
};

const items = [...document.querySelectorAll(".menu-item")];

/* ================= Interaction ================= */

logo.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = !scene.classList.contains("is-open");
  scene.classList.toggle("is-open", open);

  if (open) {
    positionMenu();
    drawArcs();
  }
});

scene.addEventListener("pointerdown", (e) => {
  if (!e.target.closest("#logoCore") &&
      !e.target.closest(".menu-item") &&
      !e.target.closest(".content-layer")) {
    scene.classList.remove("is-open");
    contentLayer.classList.remove("is-visible");
  }
});

items.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    scene.classList.remove("is-open");
    contentLayer.classList.add("is-visible");
    contentLayer.innerHTML = `<h1>${btn.dataset.key.toUpperCase()}</h1>`;
  });
});

/* ================= Menu Position ================= */

function positionMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;

  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const radius = Math.min(minDim * 0.30, 300); // ✅ slightly tighter

  const layoutDeg = {
    squad: -90,
    fixtures: 35,
    gallery: 215,
  };

  items.forEach(btn => {
    const angle = layoutDeg[btn.dataset.key] * Math.PI / 180;
    btn.style.left = `${cx + Math.cos(angle) * radius}px`;
    btn.style.top  = `${cy + Math.sin(angle) * radius}px`;
  });
}

/* ================= FINAL ARC GEOMETRY ================= */

function setGradient(gradEl, x1, y1, x2, y2){
  gradEl.setAttribute("x1", x1);
  gradEl.setAttribute("y1", y1);
  gradEl.setAttribute("x2", x2);
  gradEl.setAttribute("y2", y2);
  gradEl.innerHTML = `
    <stop offset="0%" stop-color="#ffd27d" stop-opacity="1"/>
    <stop offset="75%" stop-color="#f5a623" stop-opacity="0.9"/>
    <stop offset="92%" stop-color="#f5a623" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="#f5a623" stop-opacity="0"/>
  `;
}

function drawArcs(){
  const a = logo.getBoundingClientRect();
  const logoCX = a.left + a.width / 2;
  const logoCY = a.top + a.height / 2;

  // ✅ start just outside logo
  const logoRadius = a.width / 2 + 14;

  items.forEach(btn => {
    const key = btn.dataset.key;
    const b = btn.getBoundingClientRect();

    let endX = b.left + b.width/2;
    let endY = b.top + b.height/2;

    const dx = endX - logoCX;
    const dy = endY - logoCY;
    const len = Math.hypot(dx, dy) || 1;

    // ✅ start and end points
    const startX = logoCX + (dx/len) * logoRadius;
    const startY = logoCY + (dy/len) * logoRadius;

    const stopOffset = 48; // ✅ shorter arc → better alignment
    endX -= (dx/len) * stopOffset;
    endY -= (dy/len) * stopOffset;

    // ✅ CONTROL POINTS — TIGHT & ALIGNED
    const curveStrength = 0.18; // <<< THIS IS THE KEY (reduced from ~0.4)

    const c1x = startX + dx * 0.35 - dy * curveStrength * len;
    const c1y = startY + dy * 0.35 + dx * curveStrength * len;

    const c2x = startX + dx * 0.65 + dy * curveStrength * len;
    const c2y = startY + dy * 0.65 - dx * curveStrength * len;

    paths[key].setAttribute(
      "d",
      `M ${startX} ${startY}
       C ${c1x} ${c1y},
         ${c2x} ${c2y},
         ${endX} ${endY}`
    );

    paths[key].setAttribute("stroke", `url(#grad-${key})`);
    setGradient(grads[key], startX, startY, endX, endY);

    dots[key].setAttribute("cx", endX);
    dots[key].setAttribute("cy", endY);
  });
}

/* ================= Resize ================= */

window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    positionMenu();
    drawArcs();
  }
});
