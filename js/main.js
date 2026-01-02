// js/main.js

// =====================================================
// Application Initialization & Routing
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Al-Ameen Diagnostic - Application Starting...");

    try {
        // 1. Safety Check for Dependencies
        if (!window.supabase || !window.auth || !window.APP_CONSTANTS) {
            console.error("❌ Critical dependencies missing. Check script order in HTML.");
            return;
        }

        // 2. Initialize Core Components
        await initializeGlobalComponents();

        // 3. Initialize Page-Specific Logic
        initializePageRouting();

        // 4. Initialize Animations (AOS)
        if (typeof AOS !== "undefined") {
            AOS.init({
                duration: 800,
                easing: "ease-in-out",
                once: true,
                offset: 50,
            });
        }

        console.log("✅ Application initialized successfully");

    } catch (error) {
        console.error("❌ Init Error:", error);
    }
});

// =====================================================
// Core Component Initialization
// =====================================================
async function initializeGlobalComponents() {
    // A. Load Navbar
    if (window.navbar && window.navbar.renderNavbar) {
        await window.navbar.renderNavbar();
    }

    // B. Load Footer
    if (window.footer && window.footer.renderFooter) {
        window.footer.renderFooter();
    }

    // C. Theme & Language (Future Proofing)
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute('data-theme', savedTheme);

    // D. Global Auth Listener
    // If user logs in/out in a different tab, this updates the UI
    window.supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            if (window.navbar) await window.navbar.renderNavbar();
            
            // Redirect logic if they log out while on a dashboard
            if (event === 'SIGNED_OUT' && window.location.pathname.includes('/dashboards/')) {
                window.location.href = `${window.BASE_PATH}/login.html`;
            }
        }
    });
}

// =====================================================
// Page Routing Logic
// =====================================================
function initializePageRouting() {
    const path = window.location.pathname;
    const basePath = window.BASE_PATH || "";

    // Helper to check path
    const isPage = (name) => path.includes(name) || path === basePath + name;

    // --- Public Pages ---
    if (path === basePath + "/" || path.endsWith("/index.html") || path === basePath) {
        initHomepage();
    } 
    else if (isPage("/doctors.html")) {
        initDoctorsPage();
    }
    else if (isPage("/doctor-detail.html")) {
        initDoctorDetailPage();
    }
    else if (isPage("/tests.html")) {
        initTestsPage();
    }
    else if (isPage("/test-detail.html")) {
        initTestDetailPage();
    }
    else if (isPage("/login.html")) {
        // Login logic is handled directly in login.html script usually, 
        // but we can add global listeners here if needed.
    }
    else if (isPage("/booking.html")) {
        // We will build this next
        if (window.booking) window.booking.initBookingForm();
    }

    // --- Dashboards ---
    // We check if the specific dashboard module is loaded before calling init
    if (path.includes("/dashboards/patient/") && window.patientDashboard) {
        window.patientDashboard.init();
    }
    else if (path.includes("/dashboards/admin/") && window.adminDashboard) {
        window.adminDashboard.init();
    }
    else if (path.includes("/dashboards/lab/") && window.labDashboard) {
        window.labDashboard.init();
    }
}

// =====================================================
// Public Page Functions
// =====================================================

// --- Homepage ---
function initHomepage() {
    console.log("🏠 Loading Homepage...");
    loadFeaturedDoctors();
    loadFeaturedTests(); 
}

// --- Doctors ---
async function loadFeaturedDoctors() {
    const container = document.getElementById("featuredDoctors");
    if (!container) return;

    const { data, error } = await window.supabase
        .from("doctors")
        .select("*")
        .eq("is_active", true)
        .limit(4);

    if (error) {
        console.error("Error loading doctors:", error);
        return;
    }

    if (data && window.gallery) {
        container.innerHTML = window.gallery.createItemCarousel(data, "doctor");
        // Initialize Swiper if needed here
    }
}

async function loadFeaturedTests() {
    const container = document.getElementById("featuredTests");
    if (!container) return;

    const { data, error } = await window.supabase
        .from("tests")
        .select("*")
        .eq("is_active", true)
        .limit(4);

    if (error) {
        console.error("Error loading tests:", error);
        return;
    }

    // Basic Grid Render (Replace with your card component)
    container.innerHTML = data.map(test => `
        <div class="col-md-3">
            <div class="card h-100 shadow-sm border-0">
                <div class="card-body">
                    <h5 class="card-title">${test.name}</h5>
                    <p class="text-primary fw-bold">₹${test.discount_price || test.original_price}</p>
                    <a href="${window.BASE_PATH}/booking.html?test_id=${test.id}" class="btn btn-sm btn-outline-primary w-100">Book Now</a>
                </div>
            </div>
        </div>
    `).join('');
}

// --- Doctors Page ---
function initDoctorsPage() {
    loadAllDoctors();
}

async function loadAllDoctors() {
    const container = document.getElementById("doctorsGrid");
    if (!container) return;

    const { data, error } = await window.supabase
        .from("doctors")
        .select("*")
        .eq("is_active", true);

    if (error) {
        container.innerHTML = `<p class="text-danger">Failed to load doctors.</p>`;
        return;
    }

    container.innerHTML = data.map(doc => `
        <div class="col-md-4 mb-4">
            <div class="doctor-card p-3 border rounded">
                <h5>${doc.name}</h5>
                <p class="text-muted">${doc.specialization}</p>
                <a href="${window.BASE_PATH}/doctor-detail.html?id=${doc.id}" class="btn btn-primary btn-sm">View Profile</a>
            </div>
        </div>
    `).join('');
}

// --- Doctor Detail ---
function initDoctorDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if(id) loadDoctorDetails(id);
}

async function loadDoctorDetails(id) {
    const container = document.getElementById("doctorDetails");
    if (!container) return;

    const { data, error } = await window.supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();
    
    if(error || !data) {
        container.innerHTML = "Doctor not found.";
        return;
    }

    // Update UI
    container.innerHTML = `
        <h1>${data.name}</h1>
        <p>${data.specialization}</p>
        <p>${data.description || 'No description available.'}</p>
        <a href="${window.BASE_PATH}/booking.html?doctor_id=${data.id}" class="btn btn-success">Book Appointment</a>
    `;
}

// --- Tests Page ---
function initTestsPage() {
    loadAllTests();
}

async function loadAllTests() {
    const container = document.getElementById("testsGrid");
    if(!container) return;

    const { data, error } = await window.supabase
        .from("tests")
        .select("*")
        .eq("is_active", true);

    if(error) {
        container.innerHTML = "Failed to load tests.";
        return;
    }

    container.innerHTML = data.map(test => `
         <div class="col-md-4 mb-4">
            <div class="test-card p-3 border rounded">
                <h5>${test.name}</h5>
                <p>₹${test.original_price}</p>
                <a href="${window.BASE_PATH}/test-detail.html?id=${test.id}" class="btn btn-primary btn-sm">Details</a>
            </div>
        </div>
    `).join('');
}

// --- Test Detail ---
function initTestDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if(id) loadTestDetails(id);
}

async function loadTestDetails(id) {
    const container = document.getElementById("testDetails");
    if (!container) return;

    const { data, error } = await window.supabase
        .from("tests")
        .select("*")
        .eq("id", id)
        .single();
    
    if(error || !data) {
        container.innerHTML = "Test not found.";
        return;
    }

    container.innerHTML = `
        <h1>${data.name}</h1>
        <p>${data.description}</p>
        <p class="h4">Price: ₹${data.original_price}</p>
        <a href="${window.BASE_PATH}/booking.html?test_id=${data.id}" class="btn btn-success mt-3">Book Test</a>
    `;
}

  