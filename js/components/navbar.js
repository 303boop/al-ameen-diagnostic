// js/components/navbar.js

// =====================================================
// Dynamic Navbar Component
// =====================================================

const Navbar = {
    async renderNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        // 1. Get Base Path (Fixes navigation from subfolders)
        const BP = window.BASE_PATH || '';

        // 2. Get User State
        const user = window.auth && window.auth.getCurrentUser 
            ? await window.auth.getCurrentUser() 
            : null;

        const profile = user && window.auth.getUserRole 
            ? await window.auth.getUserRole() 
            : null;

        const currentLang = window.language && window.language.getCurrentLanguage 
            ? window.language.getCurrentLanguage() 
            : 'en';

        // 3. Build HTML
        const navHTML = `
            <nav class="navbar navbar-expand-lg navbar-light sticky-top bg-white shadow-sm">
            <div class="container">

                <a class="navbar-brand" href="${BP}/index.html">
                    <img src="${BP}/assets/images/logo/logo.png" alt="Al-Ameen" class="logo" style="height: 40px;">
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarContent">
                    <ul class="navbar-nav mx-auto">
                        <li class="nav-item"><a class="nav-link" href="${BP}/index.html">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="${BP}/about.html">About</a></li>
                        <li class="nav-item"><a class="nav-link" href="${BP}/doctors.html">Doctors</a></li>
                        <li class="nav-item"><a class="nav-link" href="${BP}/tests.html">Tests</a></li>
                        <li class="nav-item"><a class="nav-link" href="${BP}/contact.html">Contact</a></li>
                    </ul>

                    <div class="navbar-actions d-flex align-items-center gap-2">

                        <button class="btn btn-sm btn-outline-secondary rounded-circle" id="langToggle" title="Switch Language">
                            <i class="fas fa-globe"></i>
                        </button>

                        <button class="btn btn-sm btn-outline-secondary rounded-circle" id="themeToggle" title="Toggle Theme">
                            <i class="fas fa-moon"></i>
                        </button>

                        ${user ? this.renderUserMenu(profile, BP) : `<a href="${BP}/login.html" class="btn btn-primary btn-sm">Login</a>`}

                        <a href="${BP}/booking.html" class="btn btn-accent btn-sm text-white" style="background-color: var(--primary-color);">
                            <i class="fas fa-calendar-plus"></i> Book Now
                        </a>
                    </div>
                </div>
            </div>
            </nav>
        `;

        navbar.innerHTML = navHTML;
        this.initEvents();
        this.highlightActivePage(BP);
    },

    renderUserMenu(profile, BP) {
        const role = profile?.role || 'patient';
        const name = profile?.full_name || 'User';
        
        // Determine Dashboard Link
        let dashboardLink = `${BP}/dashboards/patient/index.html`;
        if (role === 'admin') dashboardLink = `${BP}/dashboards/admin/index.html`;
        if (role === 'lab') dashboardLink = `${BP}/dashboards/lab/index.html`;

        return `
            <div class="dropdown">
                <button class="btn btn-outline-primary btn-sm dropdown-toggle d-flex align-items-center gap-2" type="button" id="userMenuBtn" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle"></i>
                    <span class="d-none d-md-inline">${name}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuBtn">
                    <li><a class="dropdown-item" href="${dashboardLink}"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Logout</button></li>
                </ul>
            </div>
        `;
    },

    initEvents() {
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.auth) window.auth.signOut();
            });
        }

        // Theme Toggle
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                // Simple toggle logic (requires css variables)
                const html = document.documentElement;
                const current = html.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
            });
        }
    },

    highlightActivePage(BP) {
        const path = window.location.pathname;
        const links = document.querySelectorAll('.nav-link');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            // Check if current path ends with the link href (handling base path)
            if (href && href !== '#' && path.endsWith(href.replace(BP, ''))) {
                link.classList.add('active');
                link.classList.add('fw-bold');
                link.classList.add('text-primary');
            }
        });
    }
};

// Global Export
window.navbar = Navbar;