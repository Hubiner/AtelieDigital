const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const menuOverlay = document.querySelector(".menu-overlay");
const navLinks = document.querySelectorAll("[data-nav-link]");
const toast = document.querySelector(".toast");
const copyButton = document.querySelector(".copy-button");
const typewriterElement = document.querySelector(".typewriter");
const timelineItems = document.querySelectorAll(".timeline-item");
const skillFills = document.querySelectorAll(".skill-fill");
const tiltCards = document.querySelectorAll(".tilt-card");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const translateButton = document.querySelector("[data-translate-toggle]");
const translateButtonText = translateButton?.querySelector(".translate-fab__text");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const translateScriptId = "google-translate-script";

let translateScriptPromise;
let translateReadyResolve;

const translateReadyPromise = new Promise((resolve) => {
  translateReadyResolve = resolve;
});

function setMenuState(isOpen) {
  if (!menuToggle || !menuOverlay) return;

  body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuOverlay.setAttribute("aria-hidden", String(!isOpen));
}

menuToggle?.addEventListener("click", () => {
  const nextState = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenuState(nextState);
});

menuOverlay?.addEventListener("click", (event) => {
  if (event.target === menuOverlay) {
    setMenuState(false);
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

function showToast(message, isError = false) {
  if (!toast) return;

  toast.textContent = message;
  toast.style.borderColor = isError
    ? "rgba(255, 127, 150, 0.45)"
    : "rgba(108, 246, 216, 0.35)";
  toast.classList.add("is-visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

copyButton?.addEventListener("click", async () => {
  const email = copyButton.dataset.email;

  if (!email) return;

  try {
    await copyText(email);
    copyButton.textContent = "E-mail copiado";
    copyButton.setAttribute("aria-label", "E-mail copiado para a área de transferência");
    showToast("E-mail copiado com sucesso.");
  } catch (error) {
    showToast("Não foi possível copiar o e-mail.", true);
  }

  window.setTimeout(() => {
    copyButton.textContent = "Copiar e-mail";
    copyButton.setAttribute("aria-label", "Copiar e-mail");
  }, 1800);
});

function startTypewriter() {
  if (!typewriterElement) return;

  const words = (typewriterElement.dataset.words || "")
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  if (!words.length) return;

  if (reduceMotion) {
    typewriterElement.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let letterIndex = 0;
  let isDeleting = false;

  function tick() {
    const currentWord = words[wordIndex];

    typewriterElement.textContent = currentWord.slice(0, letterIndex);

    if (!isDeleting) {
      letterIndex += 1;

      if (letterIndex > currentWord.length) {
        isDeleting = true;
        window.setTimeout(tick, 1250);
        return;
      }

      window.setTimeout(tick, 82);
      return;
    }

    letterIndex -= 1;

    if (letterIndex < 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      letterIndex = 0;
      window.setTimeout(tick, 220);
      return;
    }

    window.setTimeout(tick, 44);
  }

  tick();
}

timelineItems.forEach((item) => {
  const trigger = item.querySelector(".timeline-trigger");

  trigger?.addEventListener("click", () => {
    const willOpen = !item.classList.contains("is-open");

    timelineItems.forEach((currentItem) => {
      const currentTrigger = currentItem.querySelector(".timeline-trigger");
      currentItem.classList.remove("is-open");
      currentTrigger?.setAttribute("aria-expanded", "false");
    });

    if (willOpen) {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
});

if ("IntersectionObserver" in window) {
  const skillObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const value = target.getAttribute("data-skill") || "0";
        target.style.width = `${value}%`;
        observer.unobserve(target);
      });
    },
    { threshold: 0.35 }
  );

  skillFills.forEach((skill) => skillObserver.observe(skill));
} else {
  skillFills.forEach((skill) => {
    skill.style.width = `${skill.getAttribute("data-skill") || "0"}%`;
  });
}

function setupTilt() {
  tiltCards.forEach((card) => {
    if (!card.dataset.tiltBound) {
      const maxTilt = 10;

      const resetCard = () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
      };

      card.addEventListener("mousemove", (event) => {
        if (!desktopPointer.matches || reduceMotion) return;

        const rect = card.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const rotateY = (offsetX / rect.width - 0.5) * maxTilt * 2;
        const rotateX = (offsetY / rect.height - 0.5) * -maxTilt * 2;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", resetCard);
      card.dataset.tiltBound = "true";
    }

    if (!desktopPointer.matches || reduceMotion) {
      card.style.transform = "";
    }
  });
}

function setupCursorState() {
  const disableCursor = !desktopPointer.matches;
  body.classList.toggle("cursor-disabled", disableCursor);

  if (disableCursor) {
    body.classList.remove("cursor-ready", "cursor-hover");
  }
}

function moveCursor(event) {
  if (
    body.classList.contains("cursor-disabled") ||
    !cursorDot ||
    !cursorRing
  ) {
    return;
  }

  body.classList.add("cursor-ready");
  const x = `${event.clientX}px`;
  const y = `${event.clientY}px`;

  cursorDot.style.setProperty("--cursor-x", x);
  cursorDot.style.setProperty("--cursor-y", y);
  cursorRing.style.setProperty("--cursor-x", x);
  cursorRing.style.setProperty("--cursor-y", y);
}

function updateTranslateButton(state) {
  if (!translateButton) return;

  const states = {
    original: {
      label: "Traduzir página para inglês",
      title: "Traduzir página",
      text: "PT / EN",
    },
    loading: {
      label: "Carregando tradutor",
      title: "Carregando tradutor",
      text: "Loading",
    },
    translated: {
      label: "Restaurar página em português",
      title: "Restaurar português",
      text: "EN / PT",
    },
  };

  const currentState = states[state];
  translateButton.dataset.state = state;
  translateButton.setAttribute("aria-label", currentState.label);
  translateButton.setAttribute("title", currentState.title);

  if (translateButtonText) {
    translateButtonText.textContent = currentState.text;
  }
}

function setGoogleTranslateCookie(value) {
  document.cookie = `googtrans=${value}; path=/; SameSite=Lax`;
}

function clearGoogleTranslateCookie() {
  const hostname = window.location.hostname;
  const domains = hostname ? [hostname, `.${hostname}`] : [];

  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  domains.forEach((domain) => {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
  });
}

function waitForTranslateCombo() {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    function lookup() {
      const combo = document.querySelector(".goog-te-combo");

      if (combo) {
        resolve(combo);
        return;
      }

      attempts += 1;

      if (attempts > 30) {
        reject(new Error("Google Translate combo indisponível."));
        return;
      }

      window.setTimeout(lookup, 150);
    }

    lookup();
  });
}

function hideGoogleTranslateArtifacts() {
  document.body.style.top = "0px";

  document
    .querySelectorAll(
      [
        "iframe.VIpgJd-ZVi9od-ORHb-OEVmcd.skiptranslate",
        ".goog-te-banner-frame.skiptranslate",
        "#goog-gt-tt",
        ".VIpgJd-yAWNEb-L7lbkb",
        ".VIpgJd-ZVi9od-aZ2wEe-wOHMyf",
      ].join(",")
    )
    .forEach((element) => {
      element.style.display = "none";
      element.style.visibility = "hidden";
    });

  document.querySelectorAll(".goog-text-highlight").forEach((element) => {
    element.style.backgroundColor = "transparent";
    element.style.boxShadow = "none";
  });
}

function loadTranslateScript() {
  if (translateScriptPromise) {
    return translateScriptPromise;
  }

  if (window.google?.translate?.TranslateElement) {
    translateReadyResolve();
    translateScriptPromise = Promise.resolve();
    return translateScriptPromise;
  }

  translateScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(translateScriptId);

    if (existingScript) {
      translateReadyPromise.then(resolve).catch(reject);
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "pt",
          includedLanguages: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );

      translateReadyResolve();
      resolve();
    };

    const script = document.createElement("script");
    script.id = translateScriptId;
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => reject(new Error("Falha ao carregar o Google Translate."));
    document.body.append(script);
  });

  return translateScriptPromise;
}

async function translatePageToEnglish() {
  updateTranslateButton("loading");
  showToast("Carregando tradução...");

  try {
    setGoogleTranslateCookie("/pt/en");
    await loadTranslateScript();
    const combo = await waitForTranslateCombo();

    combo.value = "en";
    combo.dispatchEvent(new Event("change"));

    window.setTimeout(hideGoogleTranslateArtifacts, 250);
    window.setTimeout(hideGoogleTranslateArtifacts, 1200);

    updateTranslateButton("translated");
    showToast("Página traduzida para inglês.");
  } catch (error) {
    clearGoogleTranslateCookie();
    updateTranslateButton("original");
    showToast("Não foi possível carregar a tradução agora.", true);
  }
}

function restorePortuguesePage() {
  sessionStorage.setItem("translate-restored", "1");
  clearGoogleTranslateCookie();
  window.location.reload();
}

translateButton?.addEventListener("click", () => {
  const currentState = translateButton.dataset.state;

  if (currentState === "translated") {
    restorePortuguesePage();
    return;
  }

  translatePageToEnglish();
});

if (sessionStorage.getItem("translate-restored") === "1") {
  sessionStorage.removeItem("translate-restored");
  showToast("Página restaurada para português.");
}

document.addEventListener("pointermove", moveCursor);

document.querySelectorAll("a, button, .tilt-card, .timeline-trigger").forEach((element) => {
  element.addEventListener("mouseenter", () => {
    if (!body.classList.contains("cursor-disabled")) {
      body.classList.add("cursor-hover");
    }
  });

  element.addEventListener("mouseleave", () => {
    body.classList.remove("cursor-hover");
  });
});

desktopPointer.addEventListener("change", () => {
  setupCursorState();
  setupTilt();
});

setupCursorState();
setupTilt();
startTypewriter();
updateTranslateButton("original");
