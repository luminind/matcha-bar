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
  const height = 252 * 0.8 * progress;
  const surface = 292 - height;
  liquid.setAttribute("y", String(surface));
  liquid.setAttribute("height", String(height));
  liquidGlint?.setAttribute("d", `M52 ${surface} Q124 ${surface - 11} 198 ${surface + 3}`);
  liquidGlint?.setAttribute("opacity", String(progress > 0.01 ? 0.55 : 0));
  iceCluster?.setAttribute("transform", `translate(0 ${130 - 160 * progress})`);
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

const quoteForm = document.querySelector("#quote-form");
const dateField = document.querySelector("#event-date");
const phoneField = document.querySelector("#contact-phone");

function formatEventDate() {
  if (!dateField) return;
  const caret = dateField.selectionStart ?? dateField.value.length;
  const digitsBeforeCaret = dateField.value.slice(0, caret).replace(/\D/g, "").length;
  const digits = dateField.value.replace(/\D/g, "").slice(0, 8);
  let formatted = digits.slice(0, 2);
  if (digits.length >= 2) formatted += "/" + digits.slice(2, 4);
  if (digits.length >= 4) formatted += "/" + digits.slice(4, 8);
  dateField.value = formatted;
  const newCaret = Math.min(formatted.length, digitsBeforeCaret + (digitsBeforeCaret >= 2 ? 1 : 0) + (digitsBeforeCaret >= 4 ? 1 : 0));
  dateField.setSelectionRange(newCaret, newCaret);

  let valid = !digits.length;
  if (digits.length === 8) {
    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    valid = year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
  }
  dateField.setCustomValidity(valid ? "" : "Saisissez une date valide au format JJ/MM/AAAA.");
}

dateField?.addEventListener("beforeinput", (event) => {
  const start = dateField.selectionStart;
  const end = dateField.selectionEnd;
  if (start === null || start !== end) return;
  if (event.inputType === "deleteContentBackward" && dateField.value[start - 1] === "/") {
    event.preventDefault();
    dateField.setRangeText("", Math.max(0, start - 2), start, "end");
    formatEventDate();
  } else if (event.inputType === "deleteContentForward" && dateField.value[start] === "/" && start + 1 < dateField.value.length) {
    event.preventDefault();
    dateField.setRangeText("", start, start + 2, "start");
    formatEventDate();
  }
});
dateField?.addEventListener("input", formatEventDate);

function formatPhone() {
  if (!phoneField) return;
  const caret = phoneField.selectionStart ?? phoneField.value.length;
  const digitsBeforeCaret = phoneField.value.slice(0, caret).replace(/\D/g, "").length;
  const digits = phoneField.value.replace(/\D/g, "").slice(0, 10);
  phoneField.value = digits.match(/.{1,2}/g)?.join(" ") ?? "";
  const newCaret = Math.min(phoneField.value.length, digitsBeforeCaret + Math.max(0, Math.floor((digitsBeforeCaret - 1) / 2)));
  phoneField.setSelectionRange(newCaret, newCaret);
  phoneField.setCustomValidity(!digits.length || digits.length === 10 ? "" : "Saisissez un numéro à 10 chiffres.");
}

phoneField?.addEventListener("beforeinput", (event) => {
  const start = phoneField.selectionStart;
  const end = phoneField.selectionEnd;
  if (start === null || start !== end) return;
  if (event.inputType === "deleteContentBackward" && phoneField.value[start - 1] === " ") {
    event.preventDefault();
    phoneField.setRangeText("", Math.max(0, start - 2), start, "end");
    formatPhone();
  } else if (event.inputType === "deleteContentForward" && phoneField.value[start] === " " && start + 1 < phoneField.value.length) {
    event.preventDefault();
    phoneField.setRangeText("", start, start + 2, "start");
    formatPhone();
  }
});
phoneField?.addEventListener("input", formatPhone);

quoteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.querySelector("#form-status");
  const button = quoteForm.querySelector('button[type="submit"]');
  if (!status || !button) return;

  button.disabled = true;
  status.textContent = "Envoi de votre demande…";
  try {
    const response = await fetch(quoteForm.action, {
      method: "POST",
      body: new FormData(quoteForm),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Échec de l’envoi");
    quoteForm.reset();
    dateField?.setCustomValidity("");
    phoneField?.setCustomValidity("");
    status.textContent = "Merci ! Votre demande a bien été envoyée. Nous vous répondrons dès que possible.";
  } catch {
    status.textContent = "L’envoi n’a pas fonctionné. Réessayez ou écrivez-nous à matchabar.event@gmail.com.";
  } finally {
    button.disabled = false;
  }
});

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
