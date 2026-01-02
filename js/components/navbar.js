// ===============================
// Dynamic Navbar Component (FIXED)
// ===============================

// Render navbar
async function renderNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Safe guards (prevent JS crash)
  const user = window.auth?.getCurrentUser
    ? await window.auth.getCurrentUser()
    : null;

  const profile = user && window.auth?.getUserRole
    ? await window.auth.getUserRole()
    : null;

  const currentLang = window.language?.getCurrentLanguage
    ? window.language.getCurrentLanguage()
    : 'en';

  const navHTML = `
    <nav class="navbar navbar-expand-lg navbar-light sticky-top">
      <div class="container">

        <!-- Logo -->
        <a class="navbar-brand" href="./index.html">
          <img src="./assets/images/logo/logo.png" alt="Al-Ameen Diagnostic" class="logo">
        </a>

        <!-- Mobile Toggle -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Nav Items -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item"><a class="nav-link" href="./index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="./about.html">About</a></li>
            <li class="nav-item"><a class="nav-link" href="./doctors.html">Doctors</a></li>
            <li class="nav-item"><a class="nav-link" href="./tests.html">Tests</a></li>
            <li class="nav-item"><a class="nav-link" href="./departments.html">Departments</a></li>
            <li class="nav-item"><a class="nav-link" href="./contact.html">Contact</a></li>
          </ul>

          <!-- Right Actions -->
          <div class="navbar-actions d-flex align-items-center gap-2">

            <!-- Language -->
            <button class="nav-icon-btn" id="langToggle">
              ${currentLang === 'en' ? 'বাংলা' : 'English'}
            </button>

            <!-- Theme -->
            <button class="nav-icon-btn" id="themeToggle">
              <i class="fas fa-moon"></i>
            </button>

            ${
              user
                ? `
              <div class="user-dropdown">
                <button class="user-avatar" id="userMenuToggle">
                  <i class="fas fa-user-circle"></i>
                  <span class="user-name">${profile?.full_name || 'User'}</span>
                </button>
                <div class="user-menu" id="userMenu">
                  <a href="${getDashboardURL(profile?.role)}" class="user-menu-item">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                  </a>
                  <hr>
                  <button class="user-menu-item" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              </div>
            `
                : `<a href="./login.html" class="btn btn-primary btn-sm">Login</a>`
            }

            <a href="./booking.html" class="btn btn-accent btn-sm">
              <i class="fas fa-calendar-plus"></i> Book Now
            </a>
          </div>
        </div>
      </div>
    </nav>
  `;

  navbar.innerHTML = navHTML;

  initNavbarEvents(user);
}

// Dashboard routing
function getDashboardURL(role) {
  if (role === 'admin') return './dashboards/admin/index.html';
  if (role === 'lab') return './dashboards/lab/index.html';
  return './dashboards/patient/index.html';
}

// Navbar events
function initNavbarEvents(user) {
  // Language toggle
  document.getElementById('langToggle')?.addEventListener('click', () => {
    window.language?.toggleLanguage?.();
  });

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    window.theme?.toggleTheme?.();
  });

  // User menu
  const toggle = document.getElementById('userMenuToggle');
  const menu = document.getElementById('userMenu');

  if (toggle && menu) {
    toggle.addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      menu.classList.remove('show');
    });
  }

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    window.auth?.signOut?.();
  });

  highlightActivePage();
  initScrollBehavior();
}

// Active link
function highlightActivePage() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (path.endsWith(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });
}

// Scroll behavior
function initScrollBehavior() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Init
document.addEventListener('DOMContentLoaded', renderNavbar);

// Global export
window.navbar = { renderNavbar };
