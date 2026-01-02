/* =========================================
   LANGUAGE & TRANSLATION CORE (FIXED)
   ========================================= */
const language = {
    currentLang: localStorage.getItem('app_lang') || 'en',
    translations: {},

    async init() {
        await this.loadTranslations(this.currentLang);
        this.bindEvents();
    },

    async loadTranslations(lang) {
        try {
            // Ensure this path matches where your json files actually are
            const response = await fetch(`assets/i18n/${lang}.json`); 
            if (!response.ok) throw new Error('Language file not found');
            
            this.translations = await response.json();
            this.currentLang = lang;
            
            // Set HTML attributes
            document.documentElement.lang = lang;
            document.documentElement.dir = this.translations.meta?.direction || 'ltr';
            localStorage.setItem('app_lang', lang);
            
            // Apply immediately
            this.applyTranslations();
        } catch (error) {
            console.error('Failed to load language:', error);
        }
    },

    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.getNestedValue(this.translations, key);
            
            if (text) {
                // [CRITICAL FIX] Use innerHTML to allow <span> tags to render
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    el.innerHTML = text; 
                }
            }
        });
    },

    getNestedValue(obj, path) {
        return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
    },

    bindEvents() {
        // Global listener for any language toggle button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lang-toggle')) {
                const newLang = this.currentLang === 'en' ? 'bn' : 'en';
                this.loadTranslations(newLang);
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => language.init());

// Expose globally
window.language = language;