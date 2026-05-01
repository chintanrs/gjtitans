(function () {
  const navButtons = Array.from(document.querySelectorAll(".nav__btn"));
  const pages = Array.from(document.querySelectorAll(".page"));

  function setActiveTab(tabId) {
    navButtons.forEach(b => b.classList.toggle("is-active", b.dataset.tab === tabId));
    pages.forEach(p => p.classList.toggle("is-active", p.id === tabId));

    // reveal items in the newly shown page
    window.dispatchEvent(new CustomEvent("page:changed", { detail: { tabId } }));
  }

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      setActiveTab(btn.dataset.tab);
      document.getElementById("content").scrollIntoView({ behavior: "smooth" });
    });
  });

  // default
  setActiveTab("fixtures");
})();