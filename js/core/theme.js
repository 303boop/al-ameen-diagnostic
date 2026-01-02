// Theme Management
let currentTheme = localStorage.getItem('theme') || 'light';

// Apply theme
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  
  // Update toggle icon
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'light' 
      ? '<i class="fas fa-moon"></i>' 
      : '<i class="fas fa-sun"></i>';
  }

  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

// Toggle theme
function toggleTheme() {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

// Get current theme
function getCurrentTheme() {
  return currentTheme;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
});

// Export
window.theme = {
  toggleTheme,
  getCurrentTheme,
  applyTheme
};