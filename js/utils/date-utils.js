// Date Utility Functions (Fixed & Timezone-Safe)

/* =========================
   INTERNAL HELPERS
========================= */
function toLocalDate(dateInput) {
  if (!dateInput) return null;

  // Handle YYYY-MM-DD safely
  if (typeof dateInput === "string" && dateInput.includes("-")) {
    const [y, m, d] = dateInput.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? null : date;
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

/* =========================
   TODAY (LOCAL)
========================= */
function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
}

/* =========================
   DATE AFTER N DAYS
========================= */
function getDateAfterDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

/* =========================
   DISPLAY DATE
========================= */
function formatDisplayDate(dateString) {
  const date = toLocalDate(dateString);
  if (!date) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* =========================
   DAY NAME
========================= */
function getDayName(dateString) {
  const date = toLocalDate(dateString);
  if (!date) return "";

  return date.toLocaleDateString("en-IN", { weekday: "long" });
}

/* =========================
   IS TODAY
========================= */
function isToday(dateString) {
  const date = toLocalDate(dateString);
  if (!date) return false;

  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/* =========================
   RELATIVE TIME
========================= */
function getRelativeTime(dateString) {
  const date = toLocalDate(dateString);
  if (!date) return "";

  const now = new Date();
  const diffMs = now - date;

  // Future dates
  if (diffMs < 0) {
    const mins = Math.ceil(Math.abs(diffMs) / 60000);
    if (mins < 60) return `in ${mins} minute${mins > 1 ? "s" : ""}`;
    const hrs = Math.ceil(mins / 60);
    if (hrs < 24) return `in ${hrs} hour${hrs > 1 ? "s" : ""}`;
    const days = Math.ceil(hrs / 24);
    return `in ${days} day${days > 1 ? "s" : ""}`;
  }

  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return formatDisplayDate(dateString);
}

/* =========================
   EXPORT
========================= */
window.dateUtils = {
  getTodayDate,
  getDateAfterDays,
  formatDisplayDate,
  getDayName,
  isToday,
  getRelativeTime,
};