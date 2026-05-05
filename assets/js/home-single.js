const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

const overlay = document.getElementById("overlay");
const overlayBody = document.getElementById("overlayBody");
const closeOverlay = document.getElementById("closeOverlay");

/* ANGLES (same for all screens) */
const angles = {
  squad:   -90,
  gallery: 180,
  fixtures: 35
};

/* Open / close radial menu */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if(scene.classList.contains("is-open")){
    requestAnimationFrame(positionRadialMenu);
  }
});

/* Close menu if clicking outside */
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* MENU ITEM CLICK → OPEN OVERLAY */
items.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    openOverlay(item.dataset.key);
  });
});

/* POSITIONING LOGIC */
function positionRadialMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top  + r.height / 2;

  const minViewport = Math.min(window.innerWidth, window.innerHeight);

  /* ✅ FINAL TUNED RADIUS */
  const radius = Math.min(
    180,               // desktop cap (as you want)
    minViewport * 0.32 // mobile auto-scale
  );

  items.forEach(item => {
    const angle = angles[item.dataset.key] * Math.PI / 180;
    item.style.left = `${cx + Math.cos(angle) * radius}px`;
    item.style.top  = `${cy + Math.sin(angle) * radius}px`;
  });
}

/* OVERLAY CONTENT */
function openOverlay(type){
  overlay.classList.add("active");
  scene.classList.remove("is-open");

  if(type === "squad"){
    overlayBody.innerHTML = "<h1>Squad</h1><p>Team squad details will go here.</p>";
  }
  if(type === "gallery"){
    overlayBody.innerHTML = "<h1>Gallery</h1><p>Photos coming soon.</p>";
  }
  if(type === "fixtures"){
    overlayBody.innerHTML = "<h1>Fixtures</h1><p>Match schedule will go here.</p>";
  }
}

/* Close overlay */
closeOverlay.addEventListener("click", () => {
  overlay.classList.remove("active");
});

/* Recalculate on resize */
window.addEventListener("resize", () => {
  if(scene.classList.contains("is-open")){
    requestAnimationFrame(positionRadialMenu);
  }
});
