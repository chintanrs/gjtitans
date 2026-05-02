const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const content = document.getElementById("contentLayer");

/* SVG paths */
const arcSquad = document.getElementById("arc-squad");
const arcFixtures = document.getElementById("arc-fixtures");
const arcGallery = document.getElementById("arc-gallery");

/* Canvas */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

resize();
window.addEventListener("resize", () => {
  resize();
  if (scene.classList.contains("is-open")) drawArcs();
});

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

document.querySelectorAll(".menu-item").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    scene.classList.remove("is-open");
    loadContent(btn.dataset.target);
  });
});

/* ✅ SUPER‑NOVA TRAILS — DOM‑BASED */
function drawArcs() {
  const logoRect = logo.getBoundingClientRect();

  connect(arcSquad, logoRect, document.querySelector(".menu-item.squad"));
  connect(arcFixtures, logoRect, document.querySelector(".menu-item.fixtures"));
  connect(arcGallery, logoRect, document.querySelector(".menu-item.gallery"));
}

function connect(path, fromEl, toEl) {
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();

  const x1 = a.left + a.width / 2;
  const y1 = a.top + a.height / 2;

  const x2 = b.left + b.width / 2;
  const y2 = b.top + b.height / 2;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const cx1 = x1 + dx * 0.25 - dy * 0.2;
  const cy1 = y1 + dy * 0.25 + dx * 0.2;

  const cx2 = x1 + dx * 0.75 + dy * 0.2;
  const cy2 = y1 + dy * 0.75 - dx * 0.2;

  path.setAttribute(
    "d",
    `M ${x1},${y1}
     C ${cx1},${cy1}
       ${cx2},${cy2}
       ${x2},${y2}`
  );
}

/* ✅ PARTICLES */
let particles = [];

function burst() {
  for (let i = 0; i < 48; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 9,
      vy: (Math.random() - 0.5) * 9,
      life: 45
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

    ctx.fillStyle = `rgba(245,166,35,${p.life / 45})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}
animate();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* Real data */
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
``
