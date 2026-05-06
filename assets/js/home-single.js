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

/* --- menu open/close (safe bubbling) --- */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionMenu);
  }
});

scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* Close overlay */
closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
});

/* Menu item click -> open overlay */
menuItems.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openOverlay(btn.dataset.key);
  });
});

/* Position radial menu around logo */
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
    const a = angles[item.dataset.key] * Math.PI / 180;
    item.style.left = `${cx + Math.cos(a) * radius}px`;
    item.style.top  = `${cy + Math.sin(a) * radius}px`;
  });
}

/* keep menu placement stable on rotate/resize */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionMenu);
  }
});

/* ---------------- FIXTURES drill-down state (UNCHANGED) ---------------- */
let fixturesCache = null;
let fixturesState = {
  level: "tournaments",   // "tournaments" | "matches" | "detail"
  tournamentIndex: null,
  matchIndex: null
};

/* ---------------- SQUAD state (NEW) ---------------- */
let squadCache = null;
let squadState = {
  view: "list",           // "list" | "detail"
  query: "",
  selectedIndex: null,
  scrollTop: 0
};

async function openOverlay(type){
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  scene.classList.remove("is-open");
  overlayBody.innerHTML = `<p class="subtext">Loading…</p>`;

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

  if (type === "fixtures"){
    fixturesState = { level: "tournaments", tournamentIndex: null, matchIndex: null };
    try{
      fixturesCache = await fetch("assets/data/fixtures.json", { cache: "no-store" }).then(r => r.json());
      renderFixturesStep1();
    }catch{
      overlayBody.innerHTML = `<p class="subtext">Could not load fixtures.json</p>`;
    }
    return;
  }

  if (type === "squad"){
    try{
      if (!squadCache){
        squadCache = await fetch("assets/data/squad.json", { cache: "no-store" }).then(r => r.json());
      }
      // reset view but keep query if you want persistence; for now reset
      squadState.view = "list";
      squadState.selectedIndex = null;
      squadState.scrollTop = 0;
      squadState.query = "";
      renderSquadList();
    }catch{
      overlayBody.innerHTML = `<p class="subtext">Could not load squad.json</p>`;
    }
    return;
  }
}

/* ================== FIXTURES (3-tier, unchanged) ================== */

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

  overlayBody.querySelectorAll("[data-tournament-index]").forEach(card => {
    card.addEventListener("click", () => {
      fixturesState.level = "matches";
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

/* ================== SQUAD (NEW redesign) ================== */

function getFirstName(name=""){
  const parts = String(name).trim().split(/\s+/);
  return (parts[0] || "").toLowerCase();
}

function initialsFromName(name=""){
  const parts = String(name).trim().split(/\s+/);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase() || (parts[0]?.slice(0,2).toUpperCase() || "GT");
}

function normalized(str=""){
  return String(str).toLowerCase().trim();
}

function getSortedPlayers(){
  const list = squadCache?.items ? [...squadCache.items] : [];
  // A-Z by first name (as you asked)
  list.sort((p1, p2) => {
    const a = getFirstName(p1.name);
    const b = getFirstName(p2.name);
    return a.localeCompare(b);
  });
  return list;
}

function renderSquadList(){
  squadState.view = "list";
  squadState.selectedIndex = null;

  const all = getSortedPlayers();
  const q = normalized(squadState.query);

  const filtered = q
    ? all.filter(p => normalized(p.name).includes(q))
    : all;

  overlayBody.innerHTML = `
    <div class="fade-in">
      <div class="overlay-header">
        <h1 class="overlay-title">Squad</h1>
      </div>

      <div class="squad-search">
        <input id="squadSearch" type="text" placeholder="Search players (A–Z)…" value="${escapeHtml(squadState.query)}" />
        <button class="clear-btn" id="clearSearch" type="button">Clear</button>
      </div>

      ${filtered.length === 0 ? `
        <div class="empty-state">
          <div class="msg">No players found.</div>
          <button class="clear-btn" id="clearSearch2" type="button">Clear search</button>
        </div>
      ` : `
        <div class="card-grid">
          ${filtered.map((p, idx) => renderPlayerCard(p, idx, q)).join("")}
        </div>
      `}
    </div>
  `;

  const input = overlayBody.querySelector("#squadSearch");
  const clear = overlayBody.querySelector("#clearSearch");
  const clear2 = overlayBody.querySelector("#clearSearch2");

  // search-as-you-type (real-time)
  input.addEventListener("input", () => {
  const cursorPos = input.selectionStart;   // ✅ save caret
  squadState.query = input.value;

  renderSquadList();

  // ✅ restore focus + caret AFTER DOM rebuild
  const newInput = overlayBody.querySelector("#squadSearch");
  if (newInput) {
    newInput.focus();
    newInput.setSelectionRange(cursorPos, cursorPos);
  }
});


  const clearAction = () => {
    squadState.query = "";
    renderSquadList();
  };
  clear.addEventListener("click", clearAction);
  if (clear2) clear2.addEventListener("click", clearAction);

  // click player card -> detail view
  overlayBody.querySelectorAll("[data-player-index]").forEach(el => {
    el.addEventListener("click", () => {
      // preserve scroll and query
      squadState.scrollTop = document.querySelector(".overlay-content")?.scrollTop || 0;
      squadState.selectedIndex = Number(el.dataset.playerIndex);
      renderSquadDetail();
    });
  });

  // restore scroll
  const oc = document.querySelector(".overlay-content");
  if (oc) oc.scrollTop = squadState.scrollTop || 0;
}

function renderPlayerCard(p, idx, q){
  // Use p.avatar if present; else initials
  const avatar = p.avatar ? `
    <div class="avatar"><img src="${p.avatar}" alt=""></div>
  ` : `
    <div class="avatar"><div class="initials">${initialsFromName(p.name)}</div></div>
  `;

  return `
    <div class="card player-card" data-player-index="${idx}">
      ${avatar}
      <p class="player-name">${escapeHtml(p.name)}</p>
      <div class="player-role">${escapeHtml(p.role || "player")}</div>
    </div>
  `;
}

function renderSquadDetail(){
  squadState.view = "detail";

  const all = getSortedPlayers();
  const q = normalized(squadState.query);
  const filtered = q ? all.filter(p => normalized(p.name).includes(q)) : all;
  const player = filtered[squadState.selectedIndex];

  // Safety fallback
  if (!player){
    renderSquadList();
    return;
  }

  const primaryRole = player.primaryRole || capitalize(player.role || "Not provided");
  const battingStyle = player.battingStyle || "Not provided";
  const bowlingStyle = player.bowlingStyle || "Not provided";
  const bio = player.bio || "Not provided";

  const avatar = player.avatar ? `
    <div class="avatar"><img src="${player.avatar}" alt=""></div>
  ` : `
    <div class="avatar"><div class="initials">${initialsFromName(player.name)}</div></div>
  `;

  overlayBody.innerHTML = `
    <div class="fade-in">
      <div class="overlay-header">
        <button class="back-btn" id="backToSquad" type="button">← Back</button>
        <h1 class="overlay-title">${escapeHtml(player.name)}</h1>
        <div style="width:72px;"></div>
      </div>

      <div class="detail-card player-detail">
        ${avatar}

        <div class="detail-row">
          <div class="detail-label">Primary Role</div>
          <div class="detail-value">${escapeHtml(primaryRole)}</div>
        </div>

        <div class="detail-section">
          <h3>Batting Style</h3>
          <p>${escapeHtml(battingStyle)}</p>
        </div>

        <div class="detail-section">
          <h3>Bowling Style</h3>
          <p>${escapeHtml(bowlingStyle)}</p>
        </div>

        <div class="detail-section">
          <h3>Short Description</h3>
          <p>${escapeHtml(bio)}</p>
        </div>
      </div>
    </div>
  `;

  overlayBody.querySelector("#backToSquad").addEventListener("click", () => {
    renderSquadList();
  });

  // restore previous scroll position after returning will happen in renderSquadList
}

/* ---------- helpers ---------- */
function capitalize(s=""){
  const str = String(s);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str=""){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
