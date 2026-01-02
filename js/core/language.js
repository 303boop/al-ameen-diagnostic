/* =========================================
   LANGUAGE & TRANSLATION CORE
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
            // Adjust path if needed. Assuming /assets/i18n/ exists.
            const response = await fetch(`assets/i18n/${lang}.json`);
            if (!response.ok) throw new Error('Language file not found');
            this.translations = await response.json();
            this.currentLang = lang;
            document.documentElement.lang = lang;
            document.documentElement.dir = this.translations.meta?.direction || 'ltr';
            localStorage.setItem('app_lang', lang);
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
                // [CRITICAL FIX] Use innerHTML to render <span> tags correctly
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

    async setLanguage(lang) {
        if (lang === this.currentLang) return;
        await this.loadTranslations(lang);
        
        // Dispatch event for other components (like Navbar) to re-render if needed
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lang-toggle')) {
                const lang = e.target.closest('.lang-toggle').dataset.lang;
                if(lang) this.setLanguage(lang);
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => language.init());

// Expose to window
window.language = language;