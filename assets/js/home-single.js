const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const menuItems = [...document.querySelectorAll(".menu-item")];

const overlay = document.getElementById("overlay");
const overlayBody = document.getElementById("overlayBody");
const closeBtn = document.getElementById("closeOverlay");

/* Close overlay */
closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
});

/* Perfect dial order */
const dialOrder = ["squad", "fixtures", "gallery", "about"];
const angleMap = (() => {
  const n = dialOrder.length;
  const start = -90;
  const step = 360 / n;
  const map = {};
  dialOrder.forEach((key, i) => (map[key] = start + i * step));
  return map;
})();

logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if (scene.classList.contains("is-open")) requestAnimationFrame(positionMenu);
});

scene.addEventListener("click", () => scene.classList.remove("is-open"));

menuItems.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openOverlay(btn.dataset.key);
  });
});

function positionMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const isMobile = window.innerWidth <= 480;
  const radius = Math.min(
    isMobile ? 260 : 240,
    Math.min(innerWidth, innerHeight) * (isMobile ? 0.38 : 0.32)
  );

  menuItems.forEach(item => {
    const key = item.dataset.key;
    const deg = angleMap[key] ?? 0;
    const a = deg * Math.PI / 180;
    item.style.left = `${cx + Math.cos(a) * radius}px`;
    item.style.top  = `${cy + Math.sin(a) * radius}px`;
  });
}

window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) requestAnimationFrame(positionMenu);
});

/* ---------- FIXTURES STATE ---------- */
let fixturesCache = null;
let fixturesState = { level:"tournaments", tournamentIndex:null, matchIndex:null };

/* ---------- SQUAD STATE ---------- */
let squadCache = null;
let squadState = { query:"", selectedIndex:null };

async function openOverlay(type){
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden","false");
  scene.classList.remove("is-open");

  if (type === "gallery"){
    overlayBody.innerHTML = `
      <div class="fade-in">
        <h1 class="overlay-title">Gallery</h1>
        <p class="subtext">Photos coming soon 📸</p>
      </div>`;
    return;
  }

  if (type === "about"){
    await renderAbout();
    return;
  }

  if (type === "fixtures"){
    fixturesState = { level:"tournaments", tournamentIndex:null, matchIndex:null };
    fixturesCache = await fetch("assets/data/fixtures.json", { cache:"no-store" }).then(r=>r.json());
    renderFixturesStep1();
    return;
  }

  if (type === "squad"){
    squadCache = await fetch("assets/data/squad.json", { cache:"no-store" }).then(r=>r.json());
    squadState.query = "";
    squadState.selectedIndex = null;
    renderSquadList();
    return;
  }
}

/* About JSON loader (safe) */
async function renderAbout(){
  try{
    const res = await fetch("assets/data/about.json", { cache:"no-store" });
    const data = await res.json();

    overlayBody.innerHTML = `
      <div class="fade-in">
        <h1 class="overlay-title">${escapeHtml(data.header || "Our Roots")}</h1>
        ${(data.sections || []).map(s => `<p class="subtext">${escapeHtml(s.text || "")}</p>`).join("")}
      </div>`;
  }catch{
    overlayBody.innerHTML = `
      <div class="fade-in">
        <h1 class="overlay-title">Our Roots</h1>
        <p class="subtext">We’re a group of friends in the GTA — born and raised in India — and cricket has always been part of our heritage and our DNA.</p>
      </div>`;
  }
}

/* ===== FIXTURES 3‑tier ===== */
function renderFixturesStep1(){
  const tournaments = fixturesCache?.tournaments || [];

  overlayBody.innerHTML = `
    <div class="fade-in">
      <h1 class="overlay-title">Fixtures</h1>
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
    </div>`;

  overlayBody.querySelectorAll("[data-tournament-index]").forEach(card => {
    card.addEventListener("click", () => {
      fixturesState.tournamentIndex = Number(card.dataset.tournamentIndex);
      renderFixturesStep2();
    });
  });
}

function renderFixturesStep2(){
  const t = fixturesCache.tournaments[fixturesState.tournamentIndex];
  const fixtures = t.fixtures || [];

  overlayBody.innerHTML = `
    <div class="fade-in">
      <button class="back-btn" id="backToTournaments" type="button">← Back</button>
      <h1 class="overlay-title">${t.name} ${t.season}</h1>
      <p class="subtext">Select a match</p>

      <div class="card-grid">
        ${fixtures.map((f, idx) => `
          <div class="card" data-match-index="${idx}">
            <div class="card-title">${f.teamA} vs ${f.teamB}</div>
            <div class="card-meta"><span class="match-time">${f.date} • ${f.time}</span></div>
          </div>
        `).join("")}
      </div>
    </div>`;

  overlayBody.querySelector("#backToTournaments").addEventListener("click", renderFixturesStep1);
  overlayBody.querySelectorAll("[data-match-index]").forEach(card => {
    card.addEventListener("click", () => {
      fixturesState.matchIndex = Number(card.dataset.matchIndex);
      renderFixturesStep3();
    });
  });
}

function renderFixturesStep3(){
  const t = fixturesCache.tournaments[fixturesState.tournamentIndex];
  const f = t.fixtures[fixturesState.matchIndex];

  overlayBody.innerHTML = `
    <div class="fade-in">
      <button class="back-btn" id="backToMatches" type="button">← Back</button>
      <h1 class="overlay-title">Match Details</h1>

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
    </div>`;

  overlayBody.querySelector("#backToMatches").addEventListener("click", renderFixturesStep2);
}

/* ===== SQUAD list + search + detail ===== */
function renderSquadList(){
  const list = [...(squadCache.items || [])].sort((a,b)=>a.name.localeCompare(b.name));
  const q = squadState.query.toLowerCase().trim();
  const filtered = q ? list.filter(p=>p.name.toLowerCase().includes(q)) : list;

  overlayBody.innerHTML = `
    <div class="fade-in">
      <h1 class="overlay-title">Squad</h1>

      <div class="squad-search">
        <input id="squadSearch" type="text" placeholder="Search players (A–Z)…" value="${escapeHtml(squadState.query)}">
        <button class="clear-btn" id="clearSearch" type="button">Clear</button>
      </div>

      ${filtered.length === 0 ? `
        <p class="subtext">No players found.</p>
        <button class="clear-btn" id="clearSearch2" type="button">Clear search</button>
      ` : `
        <div class="card-grid">
          ${filtered.map((p, idx)=>`
            <div class="card player-card" data-player-index="${idx}">
              <div class="avatar">
                ${p.avatar ? `<img src="${p.avatar}" alt="">` : `<div class="initials">${initialsFromName(p.name)}</div>`}
              </div>
              <div class="player-name">${escapeHtml(p.name)}</div>
              <div class="player-role">${escapeHtml(p.role || "")}</div>
            </div>
          `).join("")}
        </div>
      `}
    </div>`;

  const input = overlayBody.querySelector("#squadSearch");
  input.addEventListener("input", () => {
    const caret = input.selectionStart;
    squadState.query = input.value;
    renderSquadList();
    const newInput = overlayBody.querySelector("#squadSearch");
    if (newInput){
      newInput.focus();
      newInput.setSelectionRange(caret, caret);
    }
  });

  const clearAction = () => { squadState.query=""; renderSquadList(); };
  overlayBody.querySelector("#clearSearch").addEventListener("click", clearAction);
  const clear2 = overlayBody.querySelector("#clearSearch2");
  if (clear2) clear2.addEventListener("click", clearAction);

  overlayBody.querySelectorAll("[data-player-index]").forEach(el=>{
    el.addEventListener("click", ()=>{
      squadState.selectedIndex = Number(el.dataset.playerIndex);
      renderSquadDetail(filtered);
    });
  });
}

function renderSquadDetail(filtered){
  const p = filtered[squadState.selectedIndex];
  if (!p){ renderSquadList(); return; }

  overlayBody.innerHTML = `
    <div class="fade-in">
      <button class="back-btn" id="backToSquad" type="button">← Back</button>
      <h1 class="overlay-title">${escapeHtml(p.name)}</h1>

      <div class="detail-card">
        <div class="avatar">
          ${p.avatar ? `<img src="${p.avatar}" alt="">` : `<div class="initials">${initialsFromName(p.name)}</div>`}
        </div>

        <div class="detail-row">
          <div class="detail-label">Primary Role</div>
          <div class="detail-value">${escapeHtml(p.primaryRole || p.role || "Not provided")}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Batting Style</div>
          <div class="detail-value">${escapeHtml(p.battingStyle || "Not provided")}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Bowling Style</div>
          <div class="detail-value">${escapeHtml(p.bowlingStyle || "Not provided")}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Short Description</div>
          <div class="detail-value">${escapeHtml(p.bio || "Not provided")}</div>
        </div>
      </div>
    </div>`;

  overlayBody.querySelector("#backToSquad").addEventListener("click", renderSquadList);
}

/* helpers */
function escapeHtml(str=""){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function initialsFromName(name=""){
  const parts = String(name).trim().split(/\s+/);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a+b).toUpperCase() || (parts[0]?.slice(0,2).toUpperCase() || "GL");
}
``
