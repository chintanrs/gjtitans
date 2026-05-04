const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

// Toggle visibility
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if (scene.classList.contains("is-open")) {
    positionItems();
  }
});

// Close when clicking outside
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

// Prevent clicks on items from closing everything
items.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log(`${item.dataset.key} clicked`);
  });
});

function positionItems() {
  const rect = logo.getBoundingClientRect();

  // Center of logo
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  /* ✅ KEY FIX
     Distance from logo = logo radius + small padding */
  const gapFromLogo = 36;              // ← adjust if needed (32–44 is perfect range)
  const radius = rect.width / 2 + gapFromLogo;

  // Angles keep layout balanced and centered
  const layout = {
    squad:   -90,   // top
    gallery: 180,   // left
    fixtures: 35    // bottom-right
  };

  items.forEach(item => {
    const angle = layout[item.dataset.key] * Math.PI / 180;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    item.style.left = `${x}px`;
    item.style.top  = `${y}px`;
  });
}

// Keep alignment stable on resize
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    positionItems();
  }
});
``
