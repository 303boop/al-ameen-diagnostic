// Application Constants (Read-only & Safe)

// Booking ID prefix
const BOOKING_PREFIX = "ALM";

// Status values
const APPOINTMENT_STATUS = Object.freeze({
  BOOKED: "booked",
  CHECKED_IN: "checked_in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const REPORT_TYPES = Object.freeze({
  DIAGNOSTIC: "diagnostic_test",
  PRESCRIPTION: "prescription",
  SCAN: "scan",
  OTHER: "other",
});

const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  LAB: "lab",
  PATIENT: "patient",
});

// Date & time formats
const DATE_FORMAT = "DD/MM/YYYY";
const TIME_FORMAT = "hh:mm A";

// Pagination
const ITEMS_PER_PAGE = 12;

// Storage buckets
const STORAGE_BUCKETS = Object.freeze({
  REPORTS: "reports",
  DOCTORS: "doctors",
  TESTS: "tests",
});

// Export once (protect from overwrite)
if (!window.APP_CONSTANTS) {
  window.APP_CONSTANTS = Object.freeze({
    BOOKING_PREFIX,
    APPOINTMENT_STATUS,
    REPORT_TYPES,
    USER_ROLES,
    DATE_FORMAT,
    TIME_FORMAT,
    ITEMS_PER_PAGE,
    STORAGE_BUCKETS,
  });
}
