const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

// Angles define the layout around the logo (tight, centered group)
const layoutDeg = {
  squad:   -90,  // top
  gallery: 180,  // left
  fixtures: 35   // bottom-right
};

// Toggle menu
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");

  if (scene.classList.contains("is-open")) {
    // Wait for CSS to apply open-state sizing before measuring
    requestAnimationFrame(() => {
      positionItemsTight();
    });
  }
});

// Close when clicking outside
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

// Prevent option clicks from closing
items.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log(`${btn.dataset.key} clicked`);
  });
});

function positionItemsTight() {
  const logoRect = logo.getBoundingClientRect();
  const cx = logoRect.left + logoRect.width / 2;
  const cy = logoRect.top + logoRect.height / 2;

  // IMPORTANT:
  // Many logos have transparent padding; using width/2 is too conservative.
  // Use a smaller "visual radius" factor, then collision-check and expand only if needed.
  const visualLogoRadius = logoRect.width * 0.40; // tighter than 0.50
  const baseGap = 22; // small gap from logo edge (tight cluster)

  // Start tight:
  let radius = visualLogoRadius + baseGap;

  // Place items, then check overlap; expand radius minimally until no overlap.
  // Max 10 iterations prevents infinite loops.
  for (let step = 0; step < 10; step++) {
    placeAtRadius(cx, cy, radius);

    if (!anyOverlapsLogo(logoRect, baseGap)) {
      break; // perfect: tight and no overlap
    }
    radius += 12; // expand slightly and try again
  }
}

function placeAtRadius(cx, cy, radius) {
  items.forEach(item => {
    const key = item.dataset.key;
    const angle = (layoutDeg[key] * Math.PI) / 180;

    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    item.style.left = `${x}px`;
    item.style.top  = `${y}px`;
  });
}

// Checks whether any menu item overlaps the logo bounding box
function anyOverlapsLogo(logoRect, padding) {
  // Inflate the logo rect slightly so the gap feels clean
  const L = logoRect.left - padding;
  const T = logoRect.top - padding;
  const R = logoRect.right + padding;
  const B = logoRect.bottom + padding;

  return items.some(item => {
    const r = item.getBoundingClientRect();
    return !(r.right < L || r.left > R || r.bottom < T || r.top > B);
  });
}

// Keep it stable on resize
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(() => positionItemsTight());
  }
});
``
