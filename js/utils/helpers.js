// Helper Functions (Fixed & Production-Safe)

/* =========================
   INTERNAL UTIL
========================= */
function safeNumber(val) {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

/* =========================
   FORMAT CURRENCY (INR)
========================= */
function formatCurrency(amount) {
  const value = safeNumber(amount);
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/* =========================
   FORMAT DATE (LOCAL SAFE)
========================= */
function formatDate(dateInput, format = "DD/MM/YYYY") {
  if (!dateInput) return "";

  let date;

  // Handle YYYY-MM-DD safely
  if (typeof dateInput === "string" && dateInput.includes("-")) {
    const [y, m, d] = dateInput.split("-").map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return "";

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", year);
}

/* =========================
   FORMAT TIME (HH:MM → 12H)
========================= */
function formatTime(time) {
  if (!time || !time.includes(":")) return "";

  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "";

  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${pad(m)} ${ampm}`;
}

/* =========================
   GENERATE BOOKING ID
   (Simple helper, NOT transactional)
========================= */
function generateBookingID() {
  const now = new Date();
  const date = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${String(
    now.getFullYear()
  ).slice(-2)}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ALM-${date}-${random}`;
}

/* =========================
   DEBOUNCE (SAFE)
========================= */
function debounce(fn, wait = 300) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(context, args), wait);
  };
}

/* =========================
   THROTTLE
========================= */
function throttle(fn, limit = 300) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/* =========================
   ESCAPE HTML (XSS SAFE)
========================= */
function sanitizeHTML(str) {
  if (typeof str !== "string") return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* =========================
   COPY TO CLIPBOARD
========================= */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch (error) {
    console.error("Copy failed:", error);
    return false;
  }
}

/* =========================
   EXPORT (PROTECTED)
========================= */
if (!window.helpers) {
  window.helpers = {
    formatCurrency,
    formatDate,
    formatTime,
    generateBookingID,
    debounce,
    throttle,
    sanitizeHTML,
    copyToClipboard,
  };
}
