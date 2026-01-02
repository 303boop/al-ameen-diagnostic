# API Documentation

This document outlines the JavaScript API functions available in the Al-Ameen Diagnostic website.

## Authentication (`js/core/auth.js`)

### `auth.signUp(email, password, fullName, phone)`

Create a new user account.

**Parameters:**
- `email` (string): User's email address
- `password` (string): Password (min 6 characters)
- `fullName` (string): User's full name
- `phone` (string): Phone number

**Returns:** `Promise<{success: boolean, data?: object, error?: string}>`

**Example:**
```javascript
const result = await auth.signUp(
  'user@example.com',
  'password123',
  'John Doe',
  '1234567890'
);
```

### `auth.signIn(email, password)`

Login existing user.

**Returns:** `Promise<{success: boolean, data?: object, error?: string}>`

### `auth.signOut()`

Logout current user.

**Returns:** `Promise<{success: boolean, error?: string}>`

---

## Booking (`js/features/booking.js`)

### `booking.createAppointment(appointmentData)`

Create a new appointment.

**Parameters:**
```javascript
{
  doctor_id: string,
  appointment_date: string,  // YYYY-MM-DD
  guest_name?: string,       // For guest booking
  guest_phone?: string,
  guest_email?: string,
  notes?: string,
  coupon_code?: string
}
```

**Returns:** `Promise<{success: boolean, data?: object}>`

### `booking.getAppointmentByBookingId(bookingId)`

Search appointment by booking ID.

**Returns:** `Promise<{success: boolean, data?: object}>`

---

## Utilities

### `helpers.formatCurrency(amount)`

Format number as currency (₹).

### `helpers.formatDate(date, format?)`

Format date string.

### `helpers.formatTime(time)`

Format time (24h to 12h with AM/PM).

### `helpers.generateBookingID()`

Generate unique booking ID in format `ALM-DDMMYY-XXX`.

---

## Language (`js/core/language.js`)

### `language.toggleLanguage()`

Switch between English and Bengali.

### `language.t(key)`

Get translation for a key.

**Example:**
```javascript
const title = language.t('hero.title');
```

---

## Theme (`js/core/theme.js`)

### `theme.toggleTheme()`

Switch between light and dark mode.

### `theme.getCurrentTheme()`

Get current theme ('light' or 'dark').

---

## Toast Notifications (`js/utils/toast.js`)

### `toast.success(message, duration?)`

Show success notification.

### `toast.error(message, duration?)`

Show error notification.

### `toast.warning(message, duration?)`

Show warning notification.

### `toast.info(message, duration?)`

Show info notification.

---

## Modals (`js/components/modal.js`)

### `modal.showModal(options)`

Show custom modal.

**Options:**
```javascript
{
  title: string,
  content: string,
  size: 'small'|'medium'|'large',
  buttons: Array<{id, text, type, onClick}>
}
```

### `modal.showConfirm(title, message, onConfirm, onCancel)`

Show confirmation dialog.

### `modal.showAlert(title, message, type)`

Show alert dialog.

---

## Loader (`js/components/loader.js`)

### `loader.showPageLoader(message?)`

Show full page loading overlay.

### `loader.hidePageLoader()`

Hide page loader.

### `loader.showButtonLoader(buttonElement)`

Show loading state on button.

### `loader.hideButtonLoader(buttonElement)`

Hide button loading state.

---

For more details, see the inline documentation in each JavaScript file.