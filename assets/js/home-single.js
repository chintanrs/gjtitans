const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const menu = document.getElementById("menu");
const items = [...document.querySelectorAll(".menu-item")];

// Desktop radial angles
const layout = {
  squad: -90,
  gallery: 180,
  fixtures: 35
};

logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");

  if (scene.classList.contains("is-open")) {
    if (window.innerWidth > 768) {
      positionDesktop();
    }
  }
});

// Close outside
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

// Prevent menu click closing
items.forEach(i => i.addEventListener("click", e => e.stopPropagation()));

function positionDesktop(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;

  const radius = r.width * 0.25 + 24;

  items.forEach(item => {
    const ang = layout[item.dataset.key] * Math.PI/180;
    item.style.left = `${cx + Math.cos(ang)*radius}px`;
    item.style.top  = `${cy + Math.sin(ang)*radius}px`;
  });
}

// Recalculate on resize
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open") && window.innerWidth > 768) {
    positionDesktop();
  }
});
