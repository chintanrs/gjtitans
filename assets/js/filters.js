(function () {
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const cards = Array.from(document.querySelectorAll(".player-card"));

  function apply(role) {
    cards.forEach(card => {
      const show = role === "all" || card.dataset.role === role;
      card.classList.toggle("is-hidden", !show);
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      apply(btn.dataset.role);
    });
  });

  // default
  apply("all");
})();
