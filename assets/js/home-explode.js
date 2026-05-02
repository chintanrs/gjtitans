(() => {
  const home = document.getElementById("explodeHome");
  const rig = document.getElementById("explodeRig");
  const logo = document.getElementById("logoCore");
  const nodesWrap = document.getElementById("nodes");
  const arcSvg = document.getElementById("arcSvg");
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const menu = [
    { key: "squad", label: "SQUAD", icon: iconHelmet() },
    { key: "fixtures", label: "FIXTURES", icon: iconCalendar() },
    { key: "gallery", label: "GALLERY", icon: iconGallery() }
  ];

  let isOpen = false;
  let particleBursts = [];

  function fitCanvas() {
    const rect = rig.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * devicePixelRatio);
    canvas.height = Math.floor(rect.height * devicePixelRatio);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function buildNodes() {
    nodesWrap.innerHTML = "";
    menu.forEach((m, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "node";
      btn.dataset.target = m.key;
      btn.innerHTML = `
        <span class="icon">${m.icon}</span>
        <span class="label">${m.label}</span>
      `;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateTo(m.key);
        retract();
      });
      nodesWrap.appendChild(btn);
    });
  }

  function buildArcs(positions) {
    // Clear existing
    [...arcSvg.querySelectorAll(".arc")].forEach(n => n.remove());

    positions.forEach(p => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "arc");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "rgba(245,166,35,.85)");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("filter", "url(#glow)");

      // Curved tracer: center -> node
      const cx = 300, cy = 300;
      const mx = (cx + p.x) / 2;
      const my = (cy + p.y) / 2;

      // Control point pushes outward for arc curve
      const vx = p.x - cx;
      const vy = p.y - cy;
      const len = Math.max(1, Math.hypot(vx, vy));
      const nx = vx / len, ny = vy / len;

      const ctrlX = mx + nx * 60;
      const ctrlY = my + ny * 60;

      path.setAttribute("d", `M ${cx} ${cy} Q ${ctrlX} ${ctrlY} ${p.x} ${p.y}`);
      arcSvg.appendChild(path);
    });
  }

  function explode() {
    if (isOpen) return;
    isOpen = true;
    home.classList.add("is-open");

    const buttons = [...nodesWrap.querySelectorAll(".node")];

    // Place nodes around a ring
    const ringR = 190;
    const center = { x: 0, y: 0 };
    const angles = [-90, 30, 150].map(d => (d * Math.PI) / 180);

    const positions = angles.map(a => ({
      x: 300 + Math.cos(a) * ringR,
      y: 300 + Math.sin(a) * ringR
    }));

    // Apply transforms (translate relative to center of rig)
    buttons.forEach((btn, idx) => {
      const dx = Math.cos(angles[idx]) * ringR;
      const dy = Math.sin(angles[idx]) * ringR;

      // Motion blur feel: overshoot a bit then settle
      btn.style.transform = prefersReduced
        ? `translate3d(${dx}px, ${dy}px, 0) scale(1)`
        : `translate3d(${dx}px, ${dy}px, 0) scale(1)`;

      // Stagger
      btn.style.transitionDelay = prefersReduced ? "0ms" : `${idx * 60}ms`;
    });

    buildArcs(positions);

    // Particle burst from center
    if (!prefersReduced) burst(canvas.clientWidth / 2, canvas.clientHeight / 2);

    animate();
  }

  function retract() {
    if (!isOpen) return;
    isOpen = false;
    home.classList.remove("is-open");

    [...nodesWrap.querySelectorAll(".node")].forEach(btn => {
      btn.style.transitionDelay = "0ms";
      btn.style.transform = `translate3d(0,0,0) scale(.2)`;
    });

    // Clear arcs quickly
    [...arcSvg.querySelectorAll(".arc")].forEach(n => n.remove());
  }

  function navigateTo(tabId) {
    // Use existing tab buttons if present
    const btn = document.querySelector(`.nav__btn[data-tab="${tabId}"]`);
    if (btn) btn.click();
    // Scroll down to content
    const content = document.getElementById("content");
    if (content) content.scrollIntoView({ behavior: "smooth" });
  }

  // Close on click outside
  home.addEventListener("click", (e) => {
    if (!isOpen) return;
    // If click is not on a node/logo, retract
    if (!e.target.closest(".logo-core") && !e.target.closest(".node")) retract();
  });

  // Toggle on logo click
  logo.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen ? retract() : explode();
  });

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") retract();
  });

  // Particles
  function burst(x, y) {
    const count = 34;
    const particles = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 28 + Math.random() * 18,
        r: 1 + Math.random() * 2,
        hue: 28 + Math.random() * 12
      });
    }
    particleBursts.push(particles);
  }

  function animate() {
    if (!isOpen && particleBursts.length === 0) return;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // draw particles
    particleBursts = particleBursts.filter(group => group.length > 0);
    particleBursts.forEach(group => {
      for (let i = group.length - 1; i >= 0; i--) {
        const p = group[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 1;

        ctx.beginPath();
        ctx.fillStyle = `rgba(245,166,35,${Math.max(0, p.life / 45)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) group.splice(i, 1);
      }
    });

    requestAnimationFrame(animate);
  }

  function iconHelmet() {
    return `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12a8 8 0 0 1 16 0v2a2 2 0 0 1-2 2h-4v-5h6" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M4 14h8v4H6a2 2 0 0 1-2-2v-2Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;
  }

  function iconCalendar() {
    return `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 3v3M17 3v3" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M4 8h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        <path d="M8 12h3M13 12h3M8 16h3M13 16h3" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
  }

  function iconGallery() {
    return `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" stroke="white" stroke-width="2"/>
        <path d="M8 11l2-2 3 3 2-2 3 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 8h.01" stroke="white" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
  }

  // Init
  buildNodes();
  fitCanvas();
  window.addEventListener("resize", fitCanvas);
})();
