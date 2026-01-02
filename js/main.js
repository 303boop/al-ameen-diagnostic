// =====================================================
// main.js — Application Initialization (PART 1)
// Al-Ameen Diagnostic Center
// =====================================================

const BASE_PATH = "/al-ameen-diagnostic";

/* =====================================================
   DOM READY
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Al-Ameen Diagnostic - Application Starting...");

  try {
    // Supabase check (FIXED)
    if (!window.supabase) {
      console.error("❌ Supabase not initialized");
      return;
    }

    // Core init
    await initializeApp();

    // Page routing
    initializePageFeatures();

    // AOS
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 800,
        easing: "ease-in-out",
        once: true,
        offset: 100,
      });
    }

    console.log("✅ Application initialized successfully");
  } catch (error) {
    console.error("❌ Application initialization failed:", error);
  }
});

/* =====================================================
   CORE INITIALIZATION
===================================================== */
async function initializeApp() {
  /* ---------- Language ---------- */
  if (window.language?.loadTranslations) {
    const savedLanguage = localStorage.getItem("language") || "en";
    await window.language.loadTranslations(savedLanguage);
  }

  /* ---------- Theme ---------- */
  if (window.theme?.applyTheme) {
    const savedTheme = localStorage.getItem("theme") || "light";
    window.theme.applyTheme(savedTheme);
  }

  /* ---------- Navbar ---------- */
  if (window.navbar?.renderNavbar) {
    await window.navbar.renderNavbar();
  }

  /* ---------- Footer ---------- */
  if (window.footer?.renderFooter) {
    await window.footer.renderFooter();
  }

  /* ---------- Lazy images ---------- */
  window.gallery?.initLazyLoad?.();

  /* ---------- Auth state ---------- */
  supabase.auth.onAuthStateChange(async (event) => {
    console.log("🔐 Auth event:", event);
    if (window.navbar?.renderNavbar) {
      await window.navbar.renderNavbar();
    }
  });
}

/* =====================================================
   PAGE ROUTER
===================================================== */
function initializePageFeatures() {
  const path = window.location.pathname;

  // Homepage
  if (
    path === BASE_PATH + "/" ||
    path.endsWith("/index.html") ||
    path.endsWith("/al-ameen-diagnostic/")
  ) {
    initHomepage();
  }

  if (path.includes("doctors.html")) initDoctorsPage();
  if (path.includes("doctor-detail.html")) initDoctorDetailPage();
  if (path.includes("tests.html")) initTestsPage();
  if (path.includes("test-detail.html")) initTestDetailPage();
  if (path.includes("booking.html")) initBookingPage();
  if (path.includes("track-booking.html")) initTrackBookingPage();
  if (path.includes("login.html")) initLoginPage();

  // Dashboards
  if (path.includes("/dashboards/patient/"))
    window.patientDashboard?.initPatientDashboard?.();

  if (path.includes("/dashboards/lab/"))
    window.labDashboard?.initLabDashboard?.();

  if (path.includes("/dashboards/admin/"))
    window.adminDashboard?.initAdminDashboard?.();
}

// =====================================================
// main.js — Homepage & Doctors (PART 2)
// =====================================================

/* =====================================================
   HOMEPAGE
===================================================== */
function initHomepage() {
  console.log("📄 Initializing homepage...");
  loadFeaturedDoctors();
  loadFeaturedTests();

  const heroSwiper = document.querySelector(".hero-swiper");
  if (heroSwiper && window.gallery) {
    window.gallery.initCarousel(heroSwiper, {
      slidesPerView: 1,
      autoplay: { delay: 5000 },
    });
  }
}

/* =====================================================
   FEATURED DOCTORS
===================================================== */
async function loadFeaturedDoctors() {
  const container = document.getElementById("featuredDoctors");
  if (!container) return;

  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true)
      .limit(6);

    if (error) throw error;
    if (!data?.length) return;

    container.innerHTML = gallery.createItemCarousel(data, "doctor");

    gallery.initCarousel(
      container.querySelector(".item-carousel"),
      {
        slidesPerView: 1,
        spaceBetween: 20,
        breakpoints: {
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        },
      }
    );
  } catch (e) {
    console.error("Error loading featured doctors:", e);
  }
}

/* =====================================================
   DOCTORS PAGE
===================================================== */
function initDoctorsPage() {
  console.log("📄 Initializing doctors page...");
  loadAllDoctors();
}

async function loadAllDoctors() {
  const container = document.getElementById("doctorsGrid");
  if (!container) return;

  window.loader?.showSectionLoader?.(container);

  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    displayDoctorsGrid(data, container);
  } catch (err) {
    container.innerHTML =
      '<p class="text-danger">Failed to load doctors</p>';
  } finally {
    window.loader?.hideSectionLoader?.(container);
  }
}

function displayDoctorsGrid(doctors, container) {
  if (!doctors?.length) {
    container.innerHTML =
      '<div class="empty-state"><p>No doctors available</p></div>';
    return;
  }

  let html = '<div class="row g-4">';

  doctors.forEach((doctor) => {
    html += `
      <div class="col-md-4 col-lg-3">
        <div class="doctor-card">
          <img src="${
            doctor.image_url ||
            BASE_PATH + "/assets/images/doctors/placeholder.jpg"
          }" alt="${helpers.sanitizeHTML(doctor.name)}">
          <h3>${helpers.sanitizeHTML(doctor.name)}</h3>
          <p>${helpers.sanitizeHTML(doctor.specialization || "")}</p>
          <p class="fee">${helpers.formatCurrency(
            doctor.consultation_fee
          )}</p>
          <a href="${BASE_PATH}/doctor-detail.html?id=${
      doctor.id
    }" class="btn btn-primary btn-sm">View Profile</a>
        </div>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
}

/* =====================================================
   DOCTOR DETAIL
===================================================== */
function initDoctorDetailPage() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (id) loadDoctorDetails(id);
}

async function loadDoctorDetails(doctorId) {
  const container = document.getElementById("doctorDetails");
  if (!container) return;

  window.loader?.showPageLoader?.("Loading doctor details...");

  try {
    const result = await booking.getDoctorById(doctorId);
    if (!result.success) throw new Error(result.error);
    displayDoctorDetails(result.data, container);
  } catch (e) {
    container.innerHTML =
      '<p class="text-danger">Failed to load doctor details</p>';
  } finally {
    window.loader?.hidePageLoader?.();
  }
}

function displayDoctorDetails(doctor, container) {
  container.innerHTML = `
    <div class="doctor-detail">
      <img src="${
        doctor.image_url ||
        BASE_PATH + "/assets/images/doctors/placeholder.jpg"
      }">
      <h1>${helpers.sanitizeHTML(doctor.name)}</h1>
      <p class="specialization">${helpers.sanitizeHTML(
        doctor.specialization
      )}</p>
      <p class="description">${helpers.sanitizeHTML(
        doctor.description || ""
      )}</p>
      <p class="fee">Consultation Fee: ${helpers.formatCurrency(
        doctor.consultation_fee
      )}</p>
      <a href="${BASE_PATH}/booking.html?doctor=${
    doctor.id
  }" class="btn btn-primary">Book Appointment</a>
    </div>
  `;
}

// =====================================================
// main.js — Tests, Booking, Globals (PART 3)
// =====================================================

/* =====================================================
   TESTS PAGE
===================================================== */
function initTestsPage() {
  loadAllTests();
}

async function loadAllTests() {
  const container = document.getElementById("testsGrid");
  if (!container) return;

  window.loader?.showSectionLoader?.(container);

  try {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    displayTestsGrid(data, container);
  } catch {
    container.innerHTML =
      '<p class="text-danger">Failed to load tests</p>';
  } finally {
    window.loader?.hideSectionLoader?.(container);
  }
}

function displayTestsGrid(tests, container) {
  if (!tests?.length) {
    container.innerHTML =
      '<div class="empty-state"><p>No tests available</p></div>';
    return;
  }

  let html = '<div class="row g-4">';

  tests.forEach((test) => {
    const price = test.is_discount_active && test.discount_price
      ? `<span class="original-price">${helpers.formatCurrency(
          test.original_price
        )}</span>
         <span class="discount-price">${helpers.formatCurrency(
           test.discount_price
         )}</span>`
      : `<span class="price">${helpers.formatCurrency(
          test.original_price
        )}</span>`;

    html += `
      <div class="col-md-4 col-lg-3">
        <div class="test-card">
          <img src="${
            test.image_url ||
            BASE_PATH + "/assets/images/tests/placeholder.jpg"
          }">
          ${test.is_discount_active ? '<span class="discount-badge">Discount</span>' : ""}
          <h3>${helpers.sanitizeHTML(test.name)}</h3>
          <div class="price-section">${price}</div>
          <a href="${BASE_PATH}/test-detail.html?id=${
      test.id
    }" class="btn btn-primary btn-sm">View Details</a>
        </div>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
}

/* =====================================================
   TEST DETAIL
===================================================== */
function initTestDetailPage() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (id) loadTestDetails(id);
}

async function loadTestDetails(testId) {
  const container = document.getElementById("testDetails");
  if (!container) return;

  window.loader?.showPageLoader?.("Loading test details...");

  try {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (error) throw error;
    displayTestDetails(data, container);
  } catch {
    container.innerHTML =
      '<p class="text-danger">Failed to load test details</p>';
  } finally {
    window.loader?.hidePageLoader?.();
  }
}

function displayTestDetails(test, container) {
  const price = test.is_discount_active && test.discount_price
    ? `<span class="original-price">${helpers.formatCurrency(
        test.original_price
      )}</span>
       <span class="discount-price">${helpers.formatCurrency(
         test.discount_price
       )}</span>`
    : `<span class="price">${helpers.formatCurrency(
        test.original_price
      )}</span>`;

  container.innerHTML = `
    <div class="test-detail">
      <img src="${
        test.image_url ||
        BASE_PATH + "/assets/images/tests/placeholder.jpg"
      }">
      <h1>${helpers.sanitizeHTML(test.name)}</h1>
      <div class="price-section">${price}</div>
      <p>${helpers.sanitizeHTML(test.description || "")}</p>
      <a href="${BASE_PATH}/booking.html" class="btn btn-primary">Book Now</a>
    </div>
  `;
}

/* =====================================================
   BOOKING / TRACK / LOGIN
===================================================== */
function initBookingPage() {
  booking?.initBookingForm?.();
}

function initTrackBookingPage() {
  console.log("📄 Track booking page");
}

function initLoginPage() {
  console.log("📄 Login page");
}

/* =====================================================
   GLOBAL ERROR HANDLERS
===================================================== */
window.addEventListener("error", (e) =>
  console.error("Global error:", e.error)
);

window.addEventListener("unhandledrejection", (e) =>
  console.error("Unhandled promise:", e.reason)
);

/* =====================================================
   EXPORT
===================================================== */
window.app = {
  initializeApp,
  initializePageFeatures,
};

console.log("📝 main.js loaded successfully");
