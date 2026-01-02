// Dynamic Navbar Component

// Render navbar
async function renderNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const user = await getCurrentUser();
  const profile = user ? await getUserRole() : null;

  const navHTML = `
    <nav class="navbar navbar-expand-lg navbar-light sticky-top">
      <div class="container">
        <!-- Logo -->
        <a class="navbar-brand" href="/index.html">
          <img src="/assets/images/logo/logo.png" alt="Al-Ameen Diagnostic" class="logo">
          <span class="brand-name">Al-Ameen Diagnostic</span>
        </a>

        <!-- Mobile Toggle -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Nav Items -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
              <a class="nav-link" href="/index.html" data-i18n="nav.home">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/about.html" data-i18n="nav.about">About Us</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/doctors.html" data-i18n="nav.doctors">Doctors</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/tests.html" data-i18n="nav.tests">Tests</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/departments.html" data-i18n="nav.departments">Departments</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/contact.html" data-i18n="nav.contact">Contact</a>
            </li>
          </ul>

          <!-- Right Side Actions -->
          <div class="navbar-actions">
            <!-- Search Icon -->
            <button class="nav-icon-btn" id="searchToggle" title="Search">
              <i class="fas fa-search"></i>
            </button>

            <!-- Language Toggle -->
            <button class="nav-icon-btn" id="langToggle" onclick="window.language.toggleLanguage()" title="Change Language">
              ${language.getCurrentLanguage() === 'en' ? 'বাংলা' : 'English'}
            </button>

            <!-- Theme Toggle -->
            <button class="nav-icon-btn" id="themeToggle" onclick="window.theme.toggleTheme()" title="Toggle Theme">
              <i class="fas fa-moon"></i>
            </button>

            ${user ? `
              <!-- Notification Bell -->
              <div class="notification-wrapper">
                <button class="nav-icon-btn" id="notificationBell" title="Notifications">
                  <i class="fas fa-bell"></i>
                  <span class="notification-badge" style="display: none;">0</span>
                </button>
                <div class="notification-dropdown" id="notificationDropdown"></div>
              </div>

              <!-- User Dropdown -->
              <div class="user-dropdown">
                <button class="user-avatar" id="userMenuToggle">
                  <i class="fas fa-user-circle"></i>
                  <span class="user-name">${profile?.full_name || 'User'}</span>
                </button>
                <div class="user-menu" id="userMenu">
                  <div class="user-menu-header">
                    <p class="user-menu-name">${profile?.full_name || 'User'}</p>
                    <p class="user-menu-role">${profile?.role || 'patient'}</p>
                  </div>
                  <a href="${getDashboardURL(profile?.role)}" class="user-menu-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <span data-i18n="nav.dashboard">Dashboard</span>
                  </a>
                  ${profile?.role === 'patient' ? `
                    <a href="/dashboards/patient/appointments.html" class="user-menu-item">
                      <i class="fas fa-calendar"></i>
                      <span>My Appointments</span>
                    </a>
                    <a href="/dashboards/patient/reports.html" class="user-menu-item">
                      <i class="fas fa-file-medical"></i>
                      <span>My Reports</span>
                    </a>
                    <a href="/dashboards/patient/profile.html" class="user-menu-item">
                      <i class="fas fa-user-edit"></i>
                      <span>Edit Profile</span>
                    </a>
                  ` : ''}
                  <hr>
                  <button class="user-menu-item" onclick="window.auth.signOut()">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ` : `
              <!-- Login Button -->
              <a href="/login.html" class="btn btn-primary btn-sm" data-i18n="nav.login">Login</a>
            `}

            <!-- Book Appointment CTA -->
            <a href="/booking.html" class="btn btn-accent btn-sm ms-2">
              <i class="fas fa-calendar-plus"></i>
              <span data-i18n="nav.book_appointment">Book Now</span>
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Search Modal -->
    <div class="search-modal" id="searchModal">
      <div class="search-modal-content">
        <button class="search-close" id="searchClose">
          <i class="fas fa-times"></i>
        </button>
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            id="globalSearch" 
            placeholder="Search doctors, tests, departments..." 
            class="search-input"
          >
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>
    </div>
  `;

  navbar.innerHTML = navHTML;

  // Initialize features
  initNavbarFeatures(user);
}

// Get dashboard URL based on role
function getDashboardURL(role) {
  switch (role) {
    case 'admin':
      return '/dashboards/admin/index.html';
    case 'lab':
      return '/dashboards/lab/index.html';
    case 'patient':
    default:
      return '/dashboards/patient/index.html';
  }
}

// Initialize navbar features
function initNavbarFeatures(user) {
  // User menu toggle
  const userMenuToggle = document.getElementById('userMenuToggle');
  const userMenu = document.getElementById('userMenu');
  
  if (userMenuToggle && userMenu) {
    userMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      userMenu.classList.remove('show');
    });
  }

  // Search modal
  const searchToggle = document.getElementById('searchToggle');
  const searchModal = document.getElementById('searchModal');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');

  if (searchToggle && searchModal) {
    searchToggle.addEventListener('click', () => {
      searchModal.classList.add('show');
      searchInput.focus();
    });

    searchClose.addEventListener('click', () => {
      searchModal.classList.remove('show');
      searchInput.value = '';
      searchResults.innerHTML = '';
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchModal.classList.contains('show')) {
        searchModal.classList.remove('show');
      }
    });

    // Search functionality
    window.search.initSearchAutocomplete(searchInput, searchResults);
  }

  // Notification bell
  if (user) {
    const notificationBell = document.getElementById('notificationBell');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    if (notificationBell && notificationDropdown) {
      window.notifications.initNotificationBell(notificationBell, notificationDropdown);
    }
  }

  // Active page highlight
  highlightActivePage();

  // Scroll behavior
  initScrollBehavior();
}

// Highlight active page
function highlightActivePage() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath === href || currentPath.endsWith(href)) {
      link.classList.add('active');
    }
  });
}

// Navbar scroll behavior
function initScrollBehavior() {
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow on scroll
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > 100) {
      navbar.classList.add('nav-hidden');
    } else {
      navbar.classList.remove('nav-hidden');
    }

    lastScroll = currentScroll;
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderNavbar);

// Export
window.navbar = {
  renderNavbar
};