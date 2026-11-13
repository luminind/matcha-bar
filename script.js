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
const pourVisual = document.querySelector(".pour-visual");
const liquid = document.querySelector(".cup-liquid");
const fillNumber = document.querySelector(".fill-number");
const matchaCloud = document.querySelector(".matcha-cloud");
const readyStraw = document.querySelector(".ready-straw");

function updatePour() {
  if ((!pourSection && !pourVisual) || !liquid) return;
  const isMobile = window.matchMedia("(max-width: 650px)").matches;
  const bounds = (isMobile ? pourVisual : pourSection)?.getBoundingClientRect();
  if (!bounds) return;
  const start = window.innerHeight * (isMobile ? 0.9 : 0.78);
  const end = window.innerHeight * (isMobile ? 0.25 : 0.04);
  const progress = reducedMotion ? 1 : Math.max(0, Math.min(1, (start - bounds.top) / (start - end)));
  const height = 243 * progress;
  const front = 62 + height;
  const wave = Math.min(42, 8 + height * 0.17);
  const liquidPath = [
    "M48 62 C68 55 86 69 104 61 S139 58 158 63 S188 69 203 61",
    `L203 ${front + wave * 0.45}`,
    `C195 ${front + wave * 0.85} 190 ${front - wave * 0.35} 178 ${front + wave * 0.12}`,
    `C166 ${front - wave * 0.45} 160 ${front + wave * 1.35} 147 ${front + wave * 0.95}`,
    `C135 ${front + wave * 0.58} 127 ${front - wave * 0.5} 115 ${front - wave * 0.08}`,
    `C103 ${front + wave * 0.35} 95 ${front + wave * 1.4} 82 ${front + wave * 0.9}`,
    `C68 ${front + wave * 0.45} 60 ${front - wave * 0.45} 48 ${front + wave * 0.1}Z`,
  ].join(" ");
  liquid.setAttribute("d", liquidPath);
  liquid.setAttribute("opacity", String(progress));
  matchaCloud?.setAttribute("opacity", String(Math.max(0, Math.min(0.9, (height - 24) / 80))));
  readyStraw?.classList.toggle("is-ready", progress >= 1);
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
