const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

/* Fixed angles – consistent on all devices */
const angles = {
  squad:   -90,   // top
  gallery: 180,   // left
  fixtures: 35    // bottom-right
};

logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");

  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionRadialMenu);
  }
});

/* Close on outside click */
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* Prevent menu click bubbling */
items.forEach(i => i.addEventListener("click", e => e.stopPropagation()));

function positionRadialMenu() {
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top  + r.height / 2;

  const minViewport = Math.min(window.innerWidth, window.innerHeight);

  /* ✅ TUNED RADIUS
     - Desktop: capped at 135px (tighter, balanced)
     - Mobile: still scales down automatically */
  const radius = Math.min(
    180,                // ✅ tighter than 160
    minViewport * 0.32
  );

  items.forEach(item => {
    const angle = angles[item.dataset.key] * Math.PI / 180;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    item.style.left = `${x}px`;
    item.style.top  = `${y}px`;
  });
}

/* Recalculate on resize / orientation change */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionRadialMenu);
  }
});
