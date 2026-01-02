// Form Validation (Fixed & Production-Safe)

/* =========================
   BASIC VALIDATORS
========================= */

// Validate email
function validateEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

// Validate phone (Indian format, +91 safe)
function validatePhone(phone = "") {
  const cleaned = String(phone).replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(cleaned.slice(-10));
}

// Validate password (min 6 chars)
function validatePassword(password = "") {
  return String(password).length >= 6;
}

// Validate required field (safe)
function validateRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  return String(value).trim().length > 0;
}

// Validate future date (LOCAL SAFE)
function validateFutureDate(dateString) {
  if (!dateString) return false;

  const [y, m, d] = dateString.split("-").map(Number);
  if (!y || !m || !d) return false;

  const selected = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selected >= today;
}

// Validate coupon code format
function validateCouponCode(code = "") {
  return /^[A-Z0-9]{4,10}$/.test(String(code).trim().toUpperCase());
}

/* =========================
   ERROR UI HANDLING
========================= */

function showError(inputElement, message) {
  if (!inputElement) return;

  const formGroup =
    inputElement.closest(".form-group") || inputElement.parentElement;

  clearError(inputElement);

  inputElement.classList.add("is-invalid");
  inputElement.setAttribute("aria-invalid", "true");

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message text-danger small mt-1";
  errorDiv.textContent = message;

  formGroup.appendChild(errorDiv);
}

function clearError(inputElement) {
  if (!inputElement) return;

  const formGroup =
    inputElement.closest(".form-group") || inputElement.parentElement;

  inputElement.classList.remove("is-invalid");
  inputElement.removeAttribute("aria-invalid");

  const errorMessage = formGroup.querySelector(".error-message");
  if (errorMessage) errorMessage.remove();
}

/* =========================
   FORM VALIDATION
========================= */

function validateForm(formElement) {
  if (!formElement) return false;

  let isValid = true;
  const inputs = formElement.querySelectorAll("[required]");

  inputs.forEach(input => {
    clearError(input);

    // Checkbox / radio
    if (input.type === "checkbox" || input.type === "radio") {
      if (!input.checked) {
        showError(input, "This field is required");
        isValid = false;
      }
      return;
    }

    const value = input.value;

    if (!validateRequired(value)) {
      showError(input, "This field is required");
      isValid = false;
      return;
    }

    // Type-specific validation
    if (input.type === "email" && !validateEmail(value)) {
      showError(input, "Please enter a valid email");
      isValid = false;
    } else if (input.type === "tel" && !validatePhone(value)) {
      showError(input, "Please enter a valid 10-digit phone number");
      isValid = false;
    } else if (input.type === "password" && !validatePassword(value)) {
      showError(input, "Password must be at least 6 characters");
      isValid = false;
    } else if (input.type === "date" && !validateFutureDate(value)) {
      showError(input, "Please select a valid future date");
      isValid = false;
    }
  });

  return isValid;
}

/* =========================
   EXPORT
========================= */
if (!window.validator) {
  window.validator = {
    validateEmail,
    validatePhone,
    validatePassword,
    validateRequired,
    validateFutureDate,
    validateCouponCode,
    showError,
    clearError,
    validateForm,
  };
}
