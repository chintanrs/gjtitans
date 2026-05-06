const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const menuItems = document.querySelectorAll(".menu-item");

const overlay = document.getElementById("overlay");
const overlayBody = document.getElementById("overlayBody");
const closeBtn = document.getElementById("closeOverlay");

/* Radial positions */
const angles = {
  squad: -90,
  gallery: 180,
  fixtures: 35
};

/* Toggle radial menu */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if(scene.classList.contains("is-open")){
    positionMenu();
  }
});

/* Close menu if clicking outside */
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* Menu item click */
menuItems.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openOverlay(btn.dataset.key);
  });
});

/* Position menu */
function positionMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const radius = Math.min(180, Math.min(innerWidth, innerHeight) * 0.32);

  menuItems.forEach(item => {
    const a = angles[item.dataset.key] * Math.PI/180;
    item.style.left = `${cx + Math.cos(a)*radius}px`;
    item.style.top  = `${cy + Math.sin(a)*radius}px`;
  });
}

/* Overlay logic */
async function openOverlay(type){
  overlay.classList.add("active");
  scene.classList.remove("is-open");

  if(type === "gallery"){
    overlayBody.innerHTML = "<h1>Gallery</h1><p>Coming soon</p>";
    return;
  }

  if(type === "squad"){
    const res = await fetch("assets/data/squad.json");
    const data = await res.json();

    overlayBody.innerHTML =
      "<h1>Squad</h1>" +
      data.items.map(p => `<p>${p.name} — ${p.role}</p>`).join("");
    return;
  }

  if(type === "fixtures"){
    const res = await fetch("assets/data/fixtures.json");
    const data = await res.json();

    let html = "<h1>Fixtures</h1>";

    data.tournaments.forEach(t => {
      html += `<h2>${t.name} ${t.season}</h2>`;
      t.fixtures.forEach(f => {
        html += `
          <p>
            <strong>${f.date} • ${f.time}</strong><br>
            ${f.teamA} vs ${f.teamB}<br>
            ${f.venue}
          </p>`;
      });
    });

    overlayBody.innerHTML = html;
  }
}

/* Close overlay */
closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
});
