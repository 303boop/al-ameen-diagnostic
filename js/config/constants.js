// Application Constants

// Booking ID prefix
const BOOKING_PREFIX = 'ALM';

// Status values
const APPOINTMENT_STATUS = {
  BOOKED: 'booked',
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const REPORT_TYPES = {
  DIAGNOSTIC: 'diagnostic_test',
  PRESCRIPTION: 'prescription',
  SCAN: 'scan',
  OTHER: 'other'
};

const USER_ROLES = {
  ADMIN: 'admin',
  LAB: 'lab',
  PATIENT: 'patient'
};

// Date format
const DATE_FORMAT = 'DD/MM/YYYY';
const TIME_FORMAT = 'hh:mm A';

// Pagination
const ITEMS_PER_PAGE = 12;

// Storage buckets
const STORAGE_BUCKETS = {
  REPORTS: 'reports',
  DOCTORS: 'doctors',
  TESTS: 'tests'
};

// Export
window.APP_CONSTANTS = {
  BOOKING_PREFIX,
  APPOINTMENT_STATUS,
  REPORT_TYPES,
  USER_ROLES,
  DATE_FORMAT,
  TIME_FORMAT,
  ITEMS_PER_PAGE,
  STORAGE_BUCKETS
};