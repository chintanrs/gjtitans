const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const content = document.getElementById("contentLayer");

/* Particles */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
resize();
window.addEventListener("resize", resize);

let particles = [];

/* Toggle */
logo.addEventListener("click", e => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  burst();
  drawArcs();
});

document.addEventListener("click", () => {
  scene.classList.remove("is-open");
  content.classList.remove("is-visible");
});

/* Menu click */
document.querySelectorAll(".menu-item").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    scene.classList.remove("is-open");
    loadContent(btn.dataset.target);
  });
});

/* ✅ SUPER‑NOVA ARCS */
function drawArcs() {
  const center = { x: 500, y: 500 };

  drawArc("arc-squad", center, { x: 500, y: 160 }, -160);
  drawArc("arc-fixtures", center, { x: 860, y: 760 }, 120);
  drawArc("arc-gallery", center, { x: 140, y: 760 }, 120);
}

function drawArc(id, from, to, curve) {
  const path = document.getElementById(id);

  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 + curve;

  path.setAttribute(
    "d",
    `M ${from.x},${from.y}
     C ${cx},${cy}
       ${cx},${cy}
       ${to.x},${to.y}`
  );
}

/* ✅ PARTICLE BURST */
function burst() {
  for (let i = 0; i < 42; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 40
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    ctx.fillStyle = `rgba(245,166,35,${p.life / 40})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}
animate();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* ✅ REAL DATA */
async function loadContent(type) {
  content.classList.add("is-visible");

  if (type === "squad") {
    const d = await fetch("assets/data/squad.json").then(r => r.json());
    content.innerHTML =
      `<h1>Squad</h1>` +
      d.items.map(p => `<p>${p.name} — ${p.role}</p>`).join("");
  }

  if (type === "fixtures") {
    const d = await fetch("assets/data/fixtures.json").then(r => r.json());
    const f = d.tournaments.flatMap(t => t.fixtures);
    content.innerHTML =
      `<h1>Fixtures</h1>` +
      f.map(m =>
        `<p>${m.teamA} vs ${m.teamB} • ${m.date} • ${m.time}</p>`
      ).join("");
  }

  if (type === "gallery") {
    content.innerHTML = `<h1>Gallery</h1><p>Coming soon.</p>`;
  }
}
