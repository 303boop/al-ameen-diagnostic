// Form Validation

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone (Indian format)
function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/\s+/g, ''));
}

// Validate password (min 6 chars)
function validatePassword(password) {
  return password.length >= 6;
}

// Validate required field
function validateRequired(value) {
  return value && value.trim().length > 0;
}

// Validate date (not in past)
function validateFutureDate(date) {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}

// Validate coupon code format
function validateCouponCode(code) {
  return /^[A-Z0-9]{4,10}$/.test(code);
}

// Show error message
function showError(inputElement, message) {
  const formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
  
  // Remove existing error
  const existingError = formGroup.querySelector('.error-message');
  if (existingError) existingError.remove();
  
  // Add error class
  inputElement.classList.add('is-invalid');
  
  // Create error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message text-danger small mt-1';
  errorDiv.textContent = message;
  formGroup.appendChild(errorDiv);
}

// Clear error message
function clearError(inputElement) {
  const formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
  
  // Remove error class
  inputElement.classList.remove('is-invalid');
  
  // Remove error message
  const errorMessage = formGroup.querySelector('.error-message');
  if (errorMessage) errorMessage.remove();
}

// Validate form
function validateForm(formElement) {
  let isValid = true;
  const inputs = formElement.querySelectorAll('[required]');
  
  inputs.forEach(input => {
    const value = input.value.trim();
    
    clearError(input);
    
    if (!validateRequired(value)) {
      showError(input, 'This field is required');
      isValid = false;
      return;
    }
    
    // Type-specific validation
    if (input.type === 'email' && !validateEmail(value)) {
      showError(input, 'Please enter a valid email');
      isValid = false;
    } else if (input.type === 'tel' && !validatePhone(value)) {
      showError(input, 'Please enter a valid 10-digit phone number');
      isValid = false;
    } else if (input.type === 'password' && !validatePassword(value)) {
      showError(input, 'Password must be at least 6 characters');
      isValid = false;
    } else if (input.type === 'date' && !validateFutureDate(value)) {
      showError(input, 'Please select a future date');
      isValid = false;
    }
  });
  
  return isValid;
}

// Export
window.validator = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validateFutureDate,
  validateCouponCode,
  showError,
  clearError,
  validateForm
};