const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const menuItems = [...document.querySelectorAll(".menu-item")];

const overlay = document.getElementById("overlay");
const overlayBody = document.getElementById("overlayBody");
const closeBtn = document.getElementById("closeOverlay");

/* Radial menu angles */
const angles = {
  squad: -90,
  gallery: 180,
  fixtures: 35
};

/* --- Fix click bubbling (menu must open) --- */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionMenu);
  }
});

/* Close radial menu only when clicking background */
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* Menu item click -> open overlay */
menuItems.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openOverlay(btn.dataset.key);
  });
});

/* Close overlay */
closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
});

/* Position radial menu around logo */
function positionMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const radius = Math.min(210, Math.min(innerWidth, innerHeight) * 0.32);

  menuItems.forEach(item => {
    const a = angles[item.dataset.key] * Math.PI / 180;
    item.style.left = `${cx + Math.cos(a) * radius}px`;
    item.style.top  = `${cy + Math.sin(a) * radius}px`;
  });
}

/* ---------------- Fixtures drill-down state ---------------- */
let fixturesCache = null;
let fixturesState = {
  level: "tournaments",   // "tournaments" | "matches" | "detail"
  tournamentIndex: null,
  matchIndex: null
};

/* Overlay router */
async function openOverlay(type){
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  scene.classList.remove("is-open");

  if (type === "gallery"){
    overlayBody.innerHTML = `
      <div class="fade-in">
        <div class="overlay-header">
          <h1 class="overlay-title">Gallery</h1>
        </div>
        <p class="subtext">Photos coming soon 📸</p>
      </div>
    `;
    return;
  }

  if (type === "squad"){
    overlayBody.innerHTML = `<p class="subtext">Loading…</p>`;
    try{
      const data = await fetch("assets/data/squad.json", { cache: "no-store" }).then(r => r.json());
      overlayBody.innerHTML = `
        <div class="fade-in">
          <div class="overlay-header">
            <h1 class="overlay-title">Squad</h1>
          </div>
          <p class="subtext">Team roster (data-driven)</p>
          <div class="card-grid">
            ${data.items.map(p => `
              <div class="card" style="cursor:default;">
                <div class="card-title">${p.name}</div>
                <div class="card-meta">${p.role}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }catch(err){
      overlayBody.innerHTML = `<p class="subtext">Could not load squad.json</p>`;
    }
    return;
  }

  if (type === "fixtures"){
    overlayBody.innerHTML = `<p class="subtext">Loading…</p>`;
    fixturesState = { level: "tournaments", tournamentIndex: null, matchIndex: null };

    try{
      fixturesCache = await fetch("assets/data/fixtures.json", { cache: "no-store" }).then(r => r.json());
      renderFixturesStep1();
    }catch(err){
      overlayBody.innerHTML = `<p class="subtext">Could not load fixtures.json</p>`;
    }
  }
}

/* ---------- Step 1: Tournament Selection ---------- */
function renderFixturesStep1(){
  const tournaments = fixturesCache?.tournaments || [];

  overlayBody.innerHTML = `
    <div class="fade-in">
      <div class="overlay-header">
        <h1 class="overlay-title">Fixtures</h1>
      </div>
      <p class="subtext">Select a tournament</p>

      <div class="card-grid">
        ${tournaments.map((t, idx) => `
          <div class="card" data-tournament-index="${idx}">
            <div class="card-top">
              <div class="card-left">
                <img class="card-icon" src="assets/images/trophy.png" alt="">
                <div>
                  <p class="card-title">${t.name}</p>
                  <p class="card-meta">${t.season}</p>
                </div>
              </div>
              <div class="badge">${(t.fixtures || []).length} matches</div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  // bind clicks
  overlayBody.querySelectorAll("[data-tournament-index]").forEach(card => {
    card.addEventListener("click", () => {
      fixturesState.level = "matches";
      fixturesState.tournamentIndex = Number(card.dataset.tournamentIndex);
      renderFixturesStep2();
    });
  });
}

/* ---------- Step 2: Match Overview ---------- */
function renderFixturesStep2(){
  const t = fixturesCache.tournaments[fixturesState.tournamentIndex];
  const fixtures = t.fixtures || [];

  overlayBody.innerHTML = `
    <div class="fade-in">
      <div class="overlay-header">
        <button class="back-btn" id="backToTournaments" type="button">← Back</button>
        <h1 class="overlay-title">${t.name} ${t.season}</h1>
        <div style="width:72px;"></div>
      </div>
      <p class="subtext">Select a match</p>

      <div class="card-grid">
        ${fixtures.map((f, idx) => `
          <div class="card" data-match-index="${idx}">
            <div class="card-title">${f.teamA} vs ${f.teamB}</div>
            <div class="card-meta">
              <span class="match-time">${f.date} • ${f.time}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  overlayBody.querySelector("#backToTournaments").addEventListener("click", () => {
    fixturesState.level = "tournaments";
    fixturesState.tournamentIndex = null;
    renderFixturesStep1();
  });

  overlayBody.querySelectorAll("[data-match-index]").forEach(card => {
    card.addEventListener("click", () => {
      fixturesState.level = "detail";
      fixturesState.matchIndex = Number(card.dataset.matchIndex);
      renderFixturesStep3();
    });
  });
}

/* ---------- Step 3: Match Specifics ---------- */
function renderFixturesStep3(){
  const t = fixturesCache.tournaments[fixturesState.tournamentIndex];
  const f = t.fixtures[fixturesState.matchIndex];

  overlayBody.innerHTML = `
    <div class="fade-in">
      <div class="overlay-header">
        <button class="back-btn" id="backToMatches" type="button">← Back</button>
        <h1 class="overlay-title">Match Details</h1>
        <div style="width:72px;"></div>
      </div>

      <div class="detail-card">
        <div class="detail-row">
          <div class="detail-label">Teams</div>
          <div class="detail-value">${f.teamA} vs ${f.teamB}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value">${f.date} • ${f.time}</div>
        </div>

        <div class="detail-row">
          <div class="detail-label">Venue</div>
          <div class="detail-value">${f.venue}</div>
        </div>
      </div>
    </div>
  `;

  overlayBody.querySelector("#backToMatches").addEventListener("click", () => {
    fixturesState.level = "matches";
    fixturesState.matchIndex = null;
    renderFixturesStep2();
  });
}

/* keep menu placement stable */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionMenu);
  }
});
