// Language Management
let currentLanguage = localStorage.getItem('language') || 'en';
let translations = {};

// Load translations
async function loadTranslations(lang) {
  try {
    const response = await fetch(`/translations/${lang}.json`);
    translations = await response.json();
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  } catch (error) {
    console.error('Failed to load translations:', error);
  }
}

// Get translation by key path (e.g., "nav.home")
function t(key) {
  return key.split('.').reduce((obj, k) => obj?.[k], translations) || key;
}

// Update all elements with data-i18n attribute
function updatePageLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  });
  
  // Update HTML lang attribute
  document.documentElement.lang = currentLanguage;
  
  // Update toggle button
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.textContent = currentLanguage === 'en' ? 'বাংলা' : 'English';
  }

  // Update direction for Bengali (if needed)
  document.documentElement.dir = currentLanguage === 'bn' ? 'ltr' : 'ltr';
}

// Toggle language
function toggleLanguage() {
  const newLang = currentLanguage === 'en' ? 'bn' : 'en';
  loadTranslations(newLang);
}

// Get current language
function getCurrentLanguage() {
  return currentLanguage;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations(currentLanguage);
});

// Export
window.language = {
  t,
  toggleLanguage,
  getCurrentLanguage,
  loadTranslations
};