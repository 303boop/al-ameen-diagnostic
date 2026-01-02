// Main Application Initialization

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Al-Ameen Diagnostic - Application Starting...');

  try {
    // Check if Supabase is initialized
    if (!window.supabaseClient) {
      console.error('❌ Supabase not initialized');
      return;
    }

    // Initialize core features
    await initializeApp();

    // Initialize page-specific features
    initializePageFeatures();

    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    }

    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
  }
});

// Initialize core app features
async function initializeApp() {
  // Load language
  const savedLanguage = localStorage.getItem('language') || 'en';
  await window.language.loadTranslations(savedLanguage);

  // Load theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  window.theme.applyTheme(savedTheme);

  // Initialize navbar
  if (window.navbar && typeof window.navbar.renderNavbar === 'function') {
    await window.navbar.renderNavbar();
  }

  // Initialize footer
  if (window.footer && typeof window.footer.renderFooter === 'function') {
    await window.footer.renderFooter();
  }

  // Initialize lazy loading for images
  if (window.gallery && typeof window.gallery.initLazyLoad === 'function') {
    window.gallery.initLazyLoad();
  }

  // Listen for auth state changes
  window.supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      console.log('✅ User signed in');
      handleAuthStateChange();
    } else if (event === 'SIGNED_OUT') {
      console.log('👋 User signed out');
      handleAuthStateChange();
    }
  });
}

// Handle auth state changes
async function handleAuthStateChange() {
  // Reload navbar to update user menu
  if (window.navbar && typeof window.navbar.renderNavbar === 'function') {
    await window.navbar.renderNavbar();
  }
}

// Initialize page-specific features
function initializePageFeatures() {
  const path = window.location.pathname;

  // Homepage
  if (path === '/' || path.endsWith('/index.html') || path.endsWith('/')) {
    initHomepage();
  }

  // Doctors page
  if (path.includes('/doctors.html')) {
    initDoctorsPage();
  }

  // Doctor detail page
  if (path.includes('/doctor-detail.html')) {
    initDoctorDetailPage();
  }

  // Tests page
  if (path.includes('/tests.html')) {
    initTestsPage();
  }

  // Test detail page
  if (path.includes('/test-detail.html')) {
    initTestDetailPage();
  }

  // Booking page
  if (path.includes('/booking.html')) {
    initBookingPage();
  }

  // Track booking page
  if (path.includes('/track-booking.html')) {
    initTrackBookingPage();
  }

  // Login page
  if (path.includes('/login.html')) {
    initLoginPage();
  }

  // Patient dashboard
  if (path.includes('/dashboards/patient/')) {
    if (window.patientDashboard && typeof window.patientDashboard.initPatientDashboard === 'function') {
      window.patientDashboard.initPatientDashboard();
    }
  }

  // Lab dashboard
  if (path.includes('/dashboards/lab/')) {
    if (window.labDashboard && typeof window.labDashboard.initLabDashboard === 'function') {
      window.labDashboard.initLabDashboard();
    }
  }

  // Admin dashboard
  if (path.includes('/dashboards/admin/')) {
    if (window.adminDashboard && typeof window.adminDashboard.initAdminDashboard === 'function') {
      window.adminDashboard.initAdminDashboard();
    }
  }
}

// Initialize homepage
function initHomepage() {
  console.log('📄 Initializing homepage...');

  // Load featured doctors
  loadFeaturedDoctors();

  // Load featured tests
  loadFeaturedTests();

  // Initialize hero carousel/swiper if exists
  const heroSwiper = document.querySelector('.hero-swiper');
  if (heroSwiper && window.gallery) {
    window.gallery.initCarousel('.hero-swiper', {
      slidesPerView: 1,
      autoplay: {
        delay: 5000
      }
    });
  }
}

// Load featured doctors for homepage
async function loadFeaturedDoctors() {
  const container = document.getElementById('featuredDoctors');
  if (!container) return;

  try {
    const { data, error } = await window.supabaseClient
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .limit(6);

    if (error) throw error;

    if (data && data.length > 0 && window.gallery) {
      const html = window.gallery.createItemCarousel(data, 'doctor');
      container.innerHTML = html;

      // Initialize Swiper
      window.gallery.initCarousel('.item-carousel', {
        slidesPerView: 1,
        spaceBetween: 20,
        breakpoints: {
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 }
        }
      });
    }
  } catch (error) {
    console.error('Error loading featured doctors:', error);
  }
}

// Load featured tests for homepage
async function loadFeaturedTests() {
  const container = document.getElementById('featuredTests');
  if (!container) return;

  try {
    const { data, error } = await window.supabaseClient
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .limit(6);

    if (error) throw error;

    if (data && data.length > 0 && window.gallery) {
      const html = window.gallery.createItemCarousel(data, 'test');
      container.innerHTML = html;

      // Initialize Swiper
      window.gallery.initCarousel('.item-carousel', {
        slidesPerView: 1,
        spaceBetween: 20,
        breakpoints: {
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 }
        }
      });
    }
  } catch (error) {
    console.error('Error loading featured tests:', error);
  }
}

// Initialize doctors page
function initDoctorsPage() {
  console.log('📄 Initializing doctors page...');
  loadAllDoctors();
}

// Load all doctors
async function loadAllDoctors() {
  const container = document.getElementById('doctorsGrid');
  if (!container) return;

  window.loader.showSectionLoader(container);

  try {
    const { data, error } = await window.supabaseClient
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    displayDoctorsGrid(data, container);
  } catch (error) {
    console.error('Error loading doctors:', error);
    container.innerHTML = '<p class="text-danger">Failed to load doctors</p>';
  } finally {
    window.loader.hideSectionLoader(container);
  }
}

// Display doctors grid
function displayDoctorsGrid(doctors, container) {
  if (!doctors || doctors.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No doctors available</p></div>';
    return;
  }

  let html = '<div class="row g-4">';
  
  doctors.forEach(doctor => {
    html += `
      <div class="col-md-4 col-lg-3">
        <div class="doctor-card">
          <img src="${doctor.image_url || '/assets/images/doctors/placeholder.jpg'}" alt="${doctor.name}">
          <h3>${doctor.name}</h3>
          <p>${doctor.specialization}</p>
          <p class="fee">${window.helpers.formatCurrency(doctor.consultation_fee)}</p>
          <a href="/doctor-detail.html?id=${doctor.id}" class="btn btn-primary btn-sm">View Profile</a>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// Initialize doctor detail page
function initDoctorDetailPage() {
  console.log('📄 Initializing doctor detail page...');
  
  const urlParams = new URLSearchParams(window.location.search);
  const doctorId = urlParams.get('id');
  
  if (doctorId) {
    loadDoctorDetails(doctorId);
  }
}

// Load doctor details
async function loadDoctorDetails(doctorId) {
  const container = document.getElementById('doctorDetails');
  if (!container) return;

  window.loader.showPageLoader('Loading doctor details...');

  try {
    const result = await window.booking.getDoctorById(doctorId);

    if (!result.success) {
      throw new Error(result.error);
    }

    displayDoctorDetails(result.data, container);
  } catch (error) {
    console.error('Error loading doctor:', error);
    container.innerHTML = '<p class="text-danger">Failed to load doctor details</p>';
  } finally {
    window.loader.hidePageLoader();
  }
}

// Display doctor details
function displayDoctorDetails(doctor, container) {
  container.innerHTML = `
    <div class="doctor-detail">
      <img src="${doctor.image_url || '/assets/images/doctors/placeholder.jpg'}" alt="${doctor.name}">
      <h1>${doctor.name}</h1>
      <p class="specialization">${doctor.specialization}</p>
      <p class="description">${doctor.description || ''}</p>
      <p class="fee">Consultation Fee: ${window.helpers.formatCurrency(doctor.consultation_fee)}</p>
      <a href="/booking.html?doctor=${doctor.id}" class="btn btn-primary">Book Appointment</a>
    </div>
  `;
}

// Initialize tests page
function initTestsPage() {
  console.log('📄 Initializing tests page...');
  loadAllTests();
}

// Load all tests
async function loadAllTests() {
  const container = document.getElementById('testsGrid');
  if (!container) return;

  window.loader.showSectionLoader(container);

  try {
    const { data, error } = await window.supabaseClient
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    displayTestsGrid(data, container);
  } catch (error) {
    console.error('Error loading tests:', error);
    container.innerHTML = '<p class="text-danger">Failed to load tests</p>';
  } finally {
    window.loader.hideSectionLoader(container);
  }
}

// Display tests grid
function displayTestsGrid(tests, container) {
  if (!tests || tests.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No tests available</p></div>';
    return;
  }

  let html = '<div class="row g-4">';
  
  tests.forEach(test => {
    const price = test.is_discount_active && test.discount_price
      ? `<span class="original-price">${window.helpers.formatCurrency(test.original_price)}</span>
         <span class="discount-price">${window.helpers.formatCurrency(test.discount_price)}</span>`
      : `<span class="price">${window.helpers.formatCurrency(test.original_price)}</span>`;

    html += `
      <div class="col-md-4 col-lg-3">
        <div class="test-card">
          <img src="${test.image_url || '/assets/images/tests/placeholder.jpg'}" alt="${test.name}">
          ${test.is_discount_active ? '<span class="discount-badge">Discount</span>' : ''}
          <h3>${test.name}</h3>
          <div class="price-section">${price}</div>
          <a href="/test-detail.html?id=${test.id}" class="btn btn-primary btn-sm">View Details</a>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// Initialize test detail page
function initTestDetailPage() {
  console.log('📄 Initializing test detail page...');
  
  const urlParams = new URLSearchParams(window.location.search);
  const testId = urlParams.get('id');
  
  if (testId) {
    loadTestDetails(testId);
  }
}

// Load test details
async function loadTestDetails(testId) {
  const container = document.getElementById('testDetails');
  if (!container) return;

  window.loader.showPageLoader('Loading test details...');

  try {
    const { data, error } = await window.supabaseClient
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (error) throw error;

    displayTestDetails(data, container);
  } catch (error) {
    console.error('Error loading test:', error);
    container.innerHTML = '<p class="text-danger">Failed to load test details</p>';
  } finally {
    window.loader.hidePageLoader();
  }
}

// Display test details
function displayTestDetails(test, container) {
  const price = test.is_discount_active && test.discount_price
    ? `<span class="original-price">${window.helpers.formatCurrency(test.original_price)}</span>
       <span class="discount-price">${window.helpers.formatCurrency(test.discount_price)}</span>`
    : `<span class="price">${window.helpers.formatCurrency(test.original_price)}</span>`;

  container.innerHTML = `
    <div class="test-detail">
      <img src="${test.image_url || '/assets/images/tests/placeholder.jpg'}" alt="${test.name}">
      <h1>${test.name}</h1>
      <div class="price-section">${price}</div>
      <p class="description">${test.description || ''}</p>
      ${test.prerequisites ? `<p><strong>Prerequisites:</strong> ${test.prerequisites}</p>` : ''}
      ${test.instructions ? `<p><strong>Instructions:</strong> ${test.instructions}</p>` : ''}
      <a href="/booking.html" class="btn btn-primary">Book Now</a>
    </div>
  `;
}

// Initialize booking page
function initBookingPage() {
  console.log('📄 Initializing booking page...');
  // Booking page specific initialization
}

// Initialize track booking page
function initTrackBookingPage() {
  console.log('📄 Initializing track booking page...');
  // Track booking page specific initialization
}

// Initialize login page
function initLoginPage() {
  console.log('📄 Initializing login page...');
  // Login page specific initialization
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Export main functions
window.app = {
  initializeApp,
  initializePageFeatures
};

console.log('📝 Main.js loaded successfully');