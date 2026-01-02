/* =========================================
   DYNAMIC NAVBAR COMPONENT
   ========================================= */

const navbarComponent = {
    async render() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        // 1. Check User Session
        let user = null;
        let role = 'patient';
        
        if (window.auth) {
            user = await window.auth.getCurrentUser();
            if (user) {
                // Fetch profile to get role
                const { data } = await window.supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (data) role = data.role;
            }
        }

        // 2. Define Dashboard Path based on Role
        let dashboardPath = 'dashboards/patient/index.html';
        if (role === 'admin') dashboardPath = 'dashboards/admin/index.html';
        if (role === 'lab') dashboardPath = 'dashboards/lab/index.html';

        // 3. Build HTML
        navbar.innerHTML = `
        <nav class="navbar navbar-expand-lg sticky-top">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
                    <img src="assets/images/logo/logo.png" alt="Logo" class="logo" height="40" onerror="this.style.display='none'">
                    <span class="fw-bold text-primary">Al-Ameen</span>
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <i class="fas fa-bars"></i>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav mx-auto">
                        <li class="nav-item"><a class="nav-link" href="index.html" data-i18n="nav.home">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="about.html" data-i18n="nav.about">About</a></li>
                        <li class="nav-item"><a class="nav-link" href="doctors.html" data-i18n="nav.doctors">Doctors</a></li>
                        <li class="nav-item"><a class="nav-link" href="tests.html" data-i18n="nav.tests">Tests</a></li>
                        <li class="nav-item"><a class="nav-link" href="contact.html" data-i18n="nav.contact">Contact</a></li>
                    </ul>

                    <div class="navbar-actions d-flex align-items-center gap-2 mt-3 mt-lg-0">
                        
                        <button class="btn btn-outline-primary btn-sm rounded-circle lang-toggle" style="width: 35px; height: 35px; padding: 0;">
                            <i class="fas fa-globe"></i>
                        </button>

                        <button class="btn btn-outline-primary btn-sm rounded-circle" id="themeToggle" style="width: 35px; height: 35px; padding: 0;">
                            <i class="fas fa-moon"></i>
                        </button>

                        ${user ? `
                            <a href="${dashboardPath}" class="btn btn-primary btn-sm">
                                <i class="fas fa-columns me-1"></i> <span data-i18n="nav.dashboard">Dashboard</span>
                            </a>
                        ` : `
                            <a href="login.html" class="btn btn-outline-primary btn-sm" data-i18n="nav.login">Login</a>
                            <a href="booking.html" class="btn btn-primary btn-sm shadow-sm" data-i18n="nav.book_appointment">Book Now</a>
                        `}
                    </div>
                </div>
            </div>
        </nav>
        `;

        // 4. Initialize Logic
        this.initEvents();
        
        // Re-apply translations for the newly injected HTML
        if(window.language && window.language.applyTranslations) {
            window.language.applyTranslations();
        }
    },

    initEvents() {
        // Theme Toggle Logic
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                if(window.theme) window.theme.toggleTheme();
            });
        }

        // Language Toggle Logic
        const langBtn = document.querySelector('.lang-toggle');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                if(window.language) window.language.toggleLanguage();
            });
        }

        // Highlight Active Link
        const path = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            if(link.getAttribute('href') === path) {
                link.classList.add('active', 'text-primary', 'fw-bold');
            }
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => navbarComponent.render());