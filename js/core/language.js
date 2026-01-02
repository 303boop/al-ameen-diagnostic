// Language Management (Fixed & Robust)

let currentLanguage = localStorage.getItem("language") || "en";
let translations = {};

/* =========================
   LOAD TRANSLATIONS
========================= */
async function loadTranslations(lang) {
  try {
    const response = await fetch(`./translations/${lang}.json`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Translation file not found: ${lang}.json`);
    }

    translations = await response.json();
    currentLanguage = lang;
    localStorage.setItem("language", lang);

    updatePageLanguage();

    // Notify other modules
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { lang } })
    );
  } catch (error) {
    console.error("❌ Failed to load translations:", error);
  }
}

/* =========================
   TRANSLATION GETTER
========================= */
function t(key) {
  if (!translations || Object.keys(translations).length === 0) {
    return key;
  }

  return (
    key
      .split(".")
      .reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), translations) ||
    key
  );
}

/* =========================
   UPDATE PAGE TEXT
========================= */
function updatePageLanguage() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = t(key);

    if (
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA"
    ) {
      el.placeholder = translation;
    } else {
      el.textContent = translation;
    }
  });

  // HTML language attribute
  document.documentElement.lang = currentLanguage;

  // Language toggle button
  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.textContent =
      currentLanguage === "en" ? "বাংলা" : "English";
  }

  // Direction (both en & bn are LTR)
  document.documentElement.dir = "ltr";
}

/* =========================
   TOGGLE LANGUAGE
========================= */
function toggleLanguage() {
  const nextLang = currentLanguage === "en" ? "bn" : "en";
  loadTranslations(nextLang);
}

/* =========================
   GET CURRENT LANGUAGE
========================= */
function getCurrentLanguage() {
  return currentLanguage;
}

/* =========================
   INIT (SAFE)
========================= */
function initLanguage() {
  loadTranslations(currentLanguage);
}

// DOM ready + fallback (important)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanguage);
} else {
  initLanguage();
}

/* =========================
   EXPORT
========================= */
window.language = {
  t,
  toggleLanguage,
  getCurrentLanguage,
  loadTranslations,
};
