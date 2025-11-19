const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const modal = document.getElementById("signup-modal");
const modalCloseButtons = modal ? modal.querySelectorAll("[data-modal-close]") : [];
const modalTriggers = document.querySelectorAll("[data-modal-trigger]");
// Form is now handled by Tally embed
let modalOpenedOnce = false;
let modalFocusHandler = null;

function toggleNav() {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  navMenu.classList.toggle("is-open");
}

function closeNav() {
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
}

function trapFocus(element) {
  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea",
    "input",
    "select",
    "[tabindex]:not([tabindex='-1'])"
  ];
  const focusableElements = element.querySelectorAll(focusableSelectors.join(","));
  if (!focusableElements.length) {
    modalFocusHandler = null;
    return;
  }
  const firstEl = focusableElements[0];
  const lastEl = focusableElements[focusableElements.length - 1];

  modalFocusHandler = function handleKey(e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else if (document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  };

  element.addEventListener("keydown", modalFocusHandler);
}

function releaseFocusTrap(element) {
  if (element && modalFocusHandler) {
    element.removeEventListener("keydown", modalFocusHandler);
    modalFocusHandler = null;
  }
}

function openModal() {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  const focusTarget = modal.querySelector("input, button, [href]");
  if (focusTarget) {
    focusTarget.focus({ preventScroll: true });
  }
  trapFocus(modal);
  modalOpenedOnce = true;
}

function closeModal() {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  releaseFocusTrap(modal);
}

function smoothScrollTo(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth" });
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    toggleNav();
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      closeNav();
    }
  });
}

const internalLinks = document.querySelectorAll('a[href^="#"]');
internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    // Skip modal triggers - they handle their own behavior
    if (link.hasAttribute("data-modal-trigger")) {
      event.preventDefault();
      return;
    }
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    event.preventDefault();
    smoothScrollTo(hash);
  });
});

if (modal) {
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal();
    });
  });

  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal();
    });
  });

  const overlay = modal.querySelector(".modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", () => {
      closeModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });
}

// Form submission is now handled by Tally embed
// Listen for Tally form submission to close modal
if (modal) {
  window.addEventListener('message', (event) => {
    // Tally sends a message when form is submitted
    if (event.data && event.data.type === 'tally:form-submitted') {
      setTimeout(() => {
        closeModal();
      }, 1000); // Give time for success message to show
    }
  });
}

const revealTargets = document.querySelectorAll(
  ".hero-text, .hero-visual, .section-inner, .plan-card, .blog-card, .testimonial-card, .faq-item, .step"
);

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2
  }
);

revealTargets.forEach((target) => {
  target.classList.add("reveal");
  observer.observe(target);
});
