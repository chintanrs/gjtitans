const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const content = document.getElementById("contentLayer");

const menuItems = [...document.querySelectorAll(".menu-item")];

const svg = document.getElementById("energyArcs");

const arcs = {
  squad: document.getElementById("arc-squad"),
  fixtures: document.getElementById("arc-fixtures"),
  gallery: document.getElementById("arc-gallery")
};

/* ✅ create endpoint dots */
const dots = {};
Object.keys(arcs).forEach(key => {
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("r", "4");
  dot.classList.add("arc-dot");
  svg.appendChild(dot);
  dots[key] = dot;
});

/* ================= INTERACTION FIX ================= */

/* ✅ stop click-through closing */
scene.addEventListener("click", e => {
  if (!e.target.closest(".menu-item") && !e.target.closest("#logoCore")) {
    scene.classList.remove("is-open");
    content.classList.remove("is-visible");
  }
});

/* ✅ logo toggle */
logo.addEventListener("click", e => {
  e.stopPropagation();
  scene.classList.toggle("is-open");

  if (scene.classList.contains("is-open")) {
    positionMenu();
    drawArcs();
  }
});

/* ✅ menu clicks now work */
menuItems.forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    scene.classList.remove("is-open");
    content.classList.add("is-visible");
    content.innerHTML = `<h1>${btn.dataset.key.toUpperCase()}</h1>`;
  });
});

/* ================= MENU POSITION ================= */

function positionMenu() {
  const rect = logo.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const radius = Math.min(minDim * 0.32, 320);

  const layout = {
    squad: -90,
    fixtures: 35,
    gallery: 215
  };

  menuItems.forEach(btn => {
    const angle = layout[btn.dataset.key] * Math.PI / 180;
    btn.style.left = `${cx + Math.cos(angle) * radius}px`;
    btn.style.top  = `${cy + Math.sin(angle) * radius}px`;
  });
}

/* ================= SUPER‑NOVA TRAILS ================= */

function drawArcs() {
  const a = logo.getBoundingClientRect();
  const x1 = a.left + a.width / 2;
  const y1 = a.top + a.height / 2;

  menuItems.forEach(btn => {
    const b = btn.getBoundingClientRect();
    let x2 = b.left + b.width / 2;
    let y2 = b.top + b.height / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;

    /* ✅ pull arc back so it stops before text */
    const stopOffset = 56;
    x2 -= (dx / len) * stopOffset;
    y2 -= (dy / len) * stopOffset;

    const c1x = x1 + dx * 0.3 - dy * 0.4;
    const c1y = y1 + dy * 0.3 + dx * 0.4;
    const c2x = x1 + dx * 0.7 + dy * 0.3;
    const c2y = y1 + dy * 0.7 - dx * 0.3;

    arcs[btn.dataset.key].setAttribute(
      "d",
      `M ${x1},${y1}
       C ${c1x},${c1y}
         ${c2x},${c2y}
         ${x2},${y2}`
    );

    /* ✅ place glowing dot at endpoint */
    dots[btn.dataset.key].setAttribute("cx", x2);
    dots[btn.dataset.key].setAttribute("cy", y2);
  });
}

/* Recalculate on resize */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    positionMenu();
    drawArcs();
  }
});
