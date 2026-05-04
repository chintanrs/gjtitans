const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

// Angles define the layout around the logo
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
    requestAnimationFrame(() => {
      positionItemsDynamic();
    });
  }
});

// Close when clicking outside
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

items.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log(`${btn.dataset.key} clicked`);
  });
});

function positionItemsDynamic() {
  const logoRect = logo.getBoundingClientRect();
  const cx = logoRect.left + logoRect.width / 2;
  const cy = logoRect.top + logoRect.height / 2;

  // 1. Get the smaller screen dimension (width or height)
  const viewportMin = Math.min(window.innerWidth, window.innerHeight);

  // 2. Set a dynamic starting radius. 
  // On mobile, this will be much smaller than on a desktop.
  let visualLogoRadius = logoRect.width * 0.28; 
  let baseGap = viewportMin * 0.05; // 5% of screen size for a dynamic gap

  let radius = visualLogoRadius + baseGap;

  // 3. Prevent items from going off-screen (Max Radius check)
  // We want to keep items within 45% of the screen center to avoid cropping.
  const maxSafeRadius = (viewportMin / 2) * 0.85;

  for (let step = 0; step < 15; step++) {
    placeAtRadius(cx, cy, radius);

    // If it fits or we hit the screen edge safety limit, stop.
    if (!anyOverlapsLogo(logoRect, 10) || radius >= maxSafeRadius) {
      break; 
    }
    radius += 5; // Smaller steps for better mobile precision
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

function anyOverlapsLogo(logoRect, padding) {
  const L = logoRect.left - padding;
  const T = logoRect.top - padding;
  const R = logoRect.right + padding;
  const B = logoRect.bottom + padding;

  return items.some(item => {
    const r = item.getBoundingClientRect();
    return !(r.right < L || r.left > R || r.bottom < T || r.top > B);
  });
}

// Re-calculate on resize or orientation change (crucial for mobile)
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(() => positionItemsDynamic());
  }
});
