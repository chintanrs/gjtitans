(function () {
  const scrollCue = document.getElementById("scrollCue");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll cue -> content
  if (scrollCue) {
    scrollCue.addEventListener("click", () => {
      document.getElementById("content").scrollIntoView({ behavior: "smooth" });
    });
  }

  // Logo shrink on scroll
  function onScroll() {
    document.body.classList.toggle("is-scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll (IntersectionObserver)
  function revealVisiblePage() {
    const activePage = document.querySelector(".page.is-active");
    if (!activePage) return;

    const revealEls = Array.from(activePage.querySelectorAll(".reveal:not(.is-in)"));

    if (prefersReducedMotion) {
      revealEls.forEach(el => el.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    revealEls.forEach(el => observer.observe(el));
  }

  window.addEventListener("page:changed", revealVisiblePage);
  // initial reveal
  revealVisiblePage();
})();