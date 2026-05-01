(async function () {
  const grid = document.getElementById("squadGrid");
  if (!grid) return;

  try {
    const res = await fetch("assets/data/squad.json", { cache: "no-store" });
    const data = await res.json();

    grid.innerHTML = "";
    (data.items || []).forEach(p => {
      const card = document.createElement("article");
      card.className = "player-card";
      card.dataset.role = p.role;

      const niceRole =
        p.role === "allrounder" ? "All Rounder" :
        p.role === "batsman" ? "Batsman" :
        p.role === "bowler" ? "Bowler" : p.role;

      card.innerHTML = `
        <div class="player-name">${p.name}</div>
        <div class="player-role">${niceRole}</div>
      `;
      grid.appendChild(card);
    });

    window.dispatchEvent(new CustomEvent("squad:rendered"));
  } catch {
    grid.innerHTML = `<div class="data-error">Could not load squad data.</div>`;
  }
})();
