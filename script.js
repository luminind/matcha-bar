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
const iceCluster = document.querySelector(".ice-cluster");
const liquidGlint = document.querySelector(".liquid-glint");

function updatePour() {
  if ((!pourSection && !pourVisual) || !liquid) return;
  const isMobile = window.matchMedia("(max-width: 650px)").matches;
  const bounds = (isMobile ? pourVisual : pourSection)?.getBoundingClientRect();
  if (!bounds) return;
  const start = window.innerHeight * (isMobile ? 0.9 : 0.78);
  const end = window.innerHeight * (isMobile ? 0.25 : 0.04);
  const progress = reducedMotion ? 1 : Math.max(0, Math.min(1, (start - bounds.top) / (start - end)));
  const height = 252 * progress;
  const surface = 292 - height;
  liquid.setAttribute("y", String(surface));
  liquid.setAttribute("height", String(height));
  liquidGlint?.setAttribute("d", `M52 ${surface} Q124 ${surface - 11} 198 ${surface + 3}`);
  liquidGlint?.setAttribute("opacity", String(progress > 0.01 ? 0.55 : 0));
  iceCluster?.setAttribute("transform", `translate(0 ${130 - 200 * progress})`);
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

document.querySelectorAll(".gallery-video").forEach((figure) => {
  const video = figure.querySelector("video");
  const button = figure.querySelector(".video-toggle");
  if (!video || !button) return;

  let userPaused = reducedMotion;
  const updateButton = () => {
    button.textContent = video.paused ? "▶" : "❚❚";
    button.setAttribute("aria-label", `${video.paused ? "Lire" : "Mettre en pause"} : ${video.getAttribute("aria-label")}`);
  };
  button.hidden = false;
  video.addEventListener("play", updateButton);
  video.addEventListener("pause", updateButton);
  button.addEventListener("click", () => {
    if (video.paused) {
      userPaused = false;
      video.play().catch(updateButton);
    } else {
      userPaused = true;
      video.pause();
    }
  });
  updateButton();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !userPaused) video.play().catch(updateButton);
      else if (!entry.isIntersecting) video.pause();
    }, { threshold: 0.25 });
    observer.observe(video);
  }
});

document.querySelector("#demo-send")?.addEventListener("click", () => {
  const status = document.querySelector("#form-status");
  if (status) status.textContent = "Merci ! Ceci est un aperçu : aucune demande n’a été envoyée.";
});

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
