// js/config/constants.js

// =====================================================
// Application Constants
// =====================================================
// NOTE: window.BASE_PATH is handled in supabase.js

// 1. Business Logic
const BOOKING_PREFIX = "ALM"; // e.g., ALM-10234

// 2. Database Enums (Must match Supabase "CHECK" constraints)
const APPOINTMENT_STATUS = Object.freeze({
    BOOKED: "booked",
    CHECKED_IN: "checked_in",
    COMPLETED: "completed",
    CANCELLED: "cancelled"
});

const REPORT_TYPES = Object.freeze({
    DIAGNOSTIC: "diagnostic_test",
    PRESCRIPTION: "prescription",
    SCAN: "scan",
    OTHER: "other"
});

const USER_ROLES = Object.freeze({
    ADMIN: "admin",
    LAB: "lab",
    PATIENT: "patient"
});

const NOTIFICATION_TYPES = Object.freeze({
    BOOKING_CONFIRMED: "booking_confirmed",
    REPORT_READY: "report_ready",
    REMINDER: "reminder"
});

// 3. UI Helpers
const ITEMS_PER_PAGE = 12;
const CURRENCY = "₹"; 

// 4. Supabase Storage Bucket Names
const STORAGE_BUCKETS = Object.freeze({
    REPORTS: "reports",
    DOCTORS: "doctors",
    TESTS: "tests" // Ensure you created this bucket in Supabase
});

// 5. Date Formats (for formatting libraries if used later)
const DATE_FORMAT = {
    DISPLAY: 'DD MMM YYYY', // 01 Jan 2024
    DB: 'YYYY-MM-DD'       // 2024-01-01
};

// =========================
// EXPORT
// =========================
// Prevent overwriting if loaded twice
if (!window.APP_CONSTANTS) {
    window.APP_CONSTANTS = Object.freeze({
        BOOKING_PREFIX,
        APPOINTMENT_STATUS,
        REPORT_TYPES,
        USER_ROLES,
        NOTIFICATION_TYPES,
        ITEMS_PER_PAGE,
        CURRENCY,
        STORAGE_BUCKETS,
        DATE_FORMAT
    });
}

console.log("✅ Constants loaded");