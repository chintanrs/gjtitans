const scrollCue = document.getElementById("scrollCue");

if (scrollCue) {
  scrollCue.addEventListener("click", () => {
    document.getElementById("content").scrollIntoView({ behavior: "smooth" });
  });
}

window.addEventListener("scroll", () => {
  document.body.classList.toggle("is-scrolled", window.scrollY > 20);
}, { passive: true });
``
