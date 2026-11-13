const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

function closeMenu() {
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Ouvrir le menu");
  mainNav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Ouvrir le menu" : "Fermer le menu");
  mainNav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const pourSection = document.querySelector(".concept-section");
const liquid = document.querySelector(".cup-liquid");
const fillNumber = document.querySelector(".fill-number");

function updatePour() {
  if (!pourSection || !liquid) return;
  const bounds = pourSection.getBoundingClientRect();
  const travel = window.innerHeight + bounds.height;
  const progress = reducedMotion ? 1 : Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / Math.max(1, travel)));
  const height = 224 * progress;
  liquid.setAttribute("y", String(292 - height));
  liquid.setAttribute("height", String(height));
  if (fillNumber) fillNumber.textContent = `${Math.round(progress * 100)}%`;
}

const progressBar = document.querySelector(".scroll-progress span");
const revealElements = [...document.querySelectorAll(".reveal")];

function revealPassedSections() {
  revealElements.forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight + 120) {
      element.classList.add("is-visible");
    }
  });
}

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
  updatePour();
  revealPassedSections();
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

if (!reducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".section-heading, .service-item, .menu-photo, .drink-card, .gallery-photo, .form-card").forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
  revealElements.push(...document.querySelectorAll(".reveal"));
}

document.querySelector("#demo-send")?.addEventListener("click", () => {
  const status = document.querySelector("#form-status");
  if (status) status.textContent = "Merci ! Ceci est un aperçu : aucune demande n’a été envoyée.";
});

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
