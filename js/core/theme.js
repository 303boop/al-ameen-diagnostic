// Theme Management (Safe & Minimal)

// Default to light theme
let currentTheme = localStorage.getItem("theme") || "light";

/* =========================
   APPLY THEME
========================= */
function applyTheme(theme) {
  // Only allow known themes
  if (theme !== "light" && theme !== "dark") {
    theme = "light";
  }

  document.documentElement.setAttribute("data-theme", theme);
  currentTheme = theme;
  localStorage.setItem("theme", theme);

  // Update toggle icon (if exists)
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.innerHTML =
      theme === "light"
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
  }

  // Notify listeners (optional usage)
  window.dispatchEvent(
    new CustomEvent("themeChanged", { detail: { theme } })
  );
}

/* =========================
   TOGGLE THEME
========================= */
function toggleTheme() {
  // If you ever want to DISABLE dark mode,
  // just comment the next line and return.
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  applyTheme(nextTheme);
}

/* =========================
   GET CURRENT THEME
========================= */
function getCurrentTheme() {
  return currentTheme;
}

/* =========================
   INIT (SAFE)
========================= */
function initTheme() {
  applyTheme(currentTheme);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}

/* =========================
   EXPORT
========================= */
window.theme = {
  toggleTheme,
  getCurrentTheme,
  applyTheme,
};
