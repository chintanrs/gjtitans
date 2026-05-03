const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const content = document.getElementById("contentLayer");

const menuItems = [...document.querySelectorAll(".menu-item")];

const arcs = {
  squad: document.getElementById("arc-squad"),
  fixtures: document.getElementById("arc-fixtures"),
  gallery: document.getElementById("arc-gallery")
};

/* Toggle */
logo.addEventListener("click", e => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if (scene.classList.contains("is-open")) {
    positionMenu();
    drawArcs();
  }
});

document.addEventListener("click", () => {
  scene.classList.remove("is-open");
  content.classList.remove("is-visible");
});

/* ✅ MENU POSITIONING — SAFE & CLICKABLE */
function positionMenu() {
  const rect = logo.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const radius = Math.min(minDim * 0.35, 340);

  const layout = {
    squad: -90,
    fixtures: 35,
    gallery: 215
  };

  menuItems.forEach(btn => {
    const angle = layout[btn.dataset.key] * Math.PI / 180;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
  });
}

/* ✅ SUPER‑NOVA TRAILS — FIXED TERMINATION */
function drawArcs() {
  const a = logo.getBoundingClientRect();
  const x1 = a.left + a.width / 2;
  const y1 = a.top + a.height / 2;

  menuItems.forEach(btn => {
    const b = btn.getBoundingClientRect();

    let x2 = b.left + b.width / 2;
    let y2 = b.top + b.height / 2;

    /* 🔧 PULL BACK ENDPOINT SO ARC DOES NOT OVERLAP TEXT */
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;

    // How far before the label the arc should stop
    const stopOffset = 42; // tuned for your font size

    x2 -= (dx / len) * stopOffset;
    y2 -= (dy / len) * stopOffset;

    /* Asymmetric control points = organic energy */
    const c1x = x1 + dx * 0.25 - dy * 0.35;
    const c1y = y1 + dy * 0.25 + dx * 0.35;
    const c2x = x1 + dx * 0.75 + dy * 0.25;
    const c2y = y1 + dy * 0.75 - dx * 0.25;

    arcs[btn.dataset.key].setAttribute(
      "d",
      `M ${x1},${y1}
       C ${c1x},${c1y}
         ${c2x},${c2y}
         ${x2},${y2}`
    );
  });
}

/* Content (unchanged) */
menuItems.forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    scene.classList.remove("is-open");
    content.classList.add("is-visible");
    content.innerHTML = `<h1>${btn.dataset.key.toUpperCase()}</h1>`;
  });
});

/* Recalculate on resize */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    positionMenu();
    drawArcs();
  }
});
