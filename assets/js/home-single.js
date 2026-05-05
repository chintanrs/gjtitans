const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

const layoutDeg = {
  squad: -90,
  gallery: 180,
  fixtures: 35
};

logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(() => positionItemsResponsive());
  }
});

scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

items.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log(`${btn.dataset.key} clicked`);
  });
});

function positionItemsResponsive() {
  const logoRect = logo.getBoundingClientRect();
  const cx = logoRect.left + logoRect.width / 2;
  const cy = logoRect.top + logoRect.height / 2;

  // 1. Detect Screen Constraints
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const viewportMin = Math.min(vw, vh);

  // 2. Dynamic Scaling
  // On mobile, the logo is smaller, so the radius must shrink accordingly.
  const isMobile = vw <= 768;
  const baseRadiusFactor = isMobile ? 0.32 : 0.28;
  
  // 3. Safety Boundary
  // This ensures items stay at least 15% away from the very edge of the screen
  const maxAllowedRadius = (viewportMin / 2) * 0.85;

  let radius = logoRect.width * baseRadiusFactor;

  // 4. Collision & Edge Detection Loop
  for (let step = 0; step < 20; step++) {
    placeAtRadius(cx, cy, radius);

    // Stop expanding if we hit the screen edge OR if we are clear of the logo
    if (radius >= maxAllowedRadius || !anyOverlapsLogo(logoRect, 10)) {
      // If we hit the max radius but still overlap, we prioritize visibility 
      // by forcing the radius to the safety limit.
      if (radius > maxAllowedRadius) radius = maxAllowedRadius;
      break;
    }
    radius += 6; 
  }
}

function placeAtRadius(cx, cy, radius) {
  items.forEach(item => {
    const key = item.dataset.key;
    const angle = (layoutDeg[key] * Math.PI) / 180;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
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

window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(() => positionItemsResponsive());
  }
});
