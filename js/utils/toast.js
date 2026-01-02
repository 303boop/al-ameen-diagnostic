// Toast Notification System (Fixed & Production-Safe)

/* =========================
   INTERNAL HELPERS
========================= */
function escapeHTML(str) {
  if (typeof str !== "string") return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getToastIcon(type) {
  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };
  return icons[type] || icons.info;
}

/* =========================
   CONTAINER
========================= */
function getToastContainer() {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

/* =========================
   SHOW TOAST
========================= */
function showToast(message, type = "info", duration = 3000) {
  const container = getToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  toast.innerHTML = `
    <i class="fas ${getToastIcon(type)}"></i>
    <span class="toast-message">${escapeHTML(message)}</span>
    <button class="toast-close" aria-label="Close notification">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Close button handler
  toast.querySelector(".toast-close").addEventListener("click", () => {
    removeToast(toast);
  });

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add("show"));

  // Auto-remove (pause on hover)
  let timeout = setTimeout(() => removeToast(toast), duration);

  toast.addEventListener("mouseenter", () => clearTimeout(timeout));
  toast.addEventListener("mouseleave", () => {
    timeout = setTimeout(() => removeToast(toast), duration);
  });
}

/* =========================
   REMOVE TOAST
========================= */
function removeToast(toast) {
  if (!toast) return;
  toast.classList.remove("show");
  setTimeout(() => toast.remove(), 300);
}

/* =========================
   EXPORT
========================= */
if (!window.toast) {
  window.toast = {
    success: (msg, duration) => showToast(msg, "success", duration),
    error: (msg, duration) => showToast(msg, "error", duration),
    warning: (msg, duration) => showToast(msg, "warning", duration),
    info: (msg, duration) => showToast(msg, "info", duration),
  };
}
