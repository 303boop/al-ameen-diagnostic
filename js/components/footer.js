// ===============================
// Dynamic Footer Component (FIXED)
// ===============================

// Render footer
async function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  let clinicInfo = {
    clinic_name: 'Al-Ameen Diagnostic Center',
    address: 'Baharampur, West Bengal, India',
    phone: '+91 1234567890',
    email: 'info@alameendiagnostic.com'
  };

  // Safe Supabase fetch (won’t break GitHub Pages / offline)
  try {
    if (window.supabaseClient) {
      const { data } = await window.supabaseClient
        .from('clinic_settings')
        .select('*')
        .single();
      if (data) clinicInfo = { ...clinicInfo, ...data };
    }
  } catch (e) {
    console.warn('Footer: clinic_settings not loaded, using defaults');
  }

  const year = new Date().getFullYear();

  footer.innerHTML = `
    <footer class="footer">
      <div class="footer-top">
        <div class="container">
          <div class="row">

            <div class="col-lg-4 col-md-6 mb-4">
              <h3 class="footer-title">${clinicInfo.clinic_name}</h3>
              <p class="footer-description">
                Providing quality healthcare services with modern facilities and expert professionals.
              </p>
              <div class="social-links">
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-linkedin-in"></i></a>
              </div>
            </div>

            <div class="col-lg-2 col-md-6 mb-4">
              <h4 class="footer-widget-title">Quick Links</h4>
              <ul class="footer-links">
                <li><a href="./index.html">Home</a></li>
                <li><a href="./about.html">About</a></li>
                <li><a href="./doctors.html">Doctors</a></li>
                <li><a href="./tests.html">Tests</a></li>
                <li><a href="./departments.html">Departments</a></li>
              </ul>
            </div>

            <div class="col-lg-2 col-md-6 mb-4">
              <h4 class="footer-widget-title">Services</h4>
              <ul class="footer-links">
                <li><a href="./booking.html">Book Appointment</a></li>
                <li><a href="./track-booking.html">Track Booking</a></li>
                <li><a href="./faq.html">FAQs</a></li>
                <li><a href="./blog.html">Health Tips</a></li>
              </ul>
            </div>

            <div class="col-lg-4 col-md-6 mb-4">
              <h4 class="footer-widget-title">Contact</h4>
              <ul class="footer-contact">
                <li><i class="fas fa-map-marker-alt"></i> ${clinicInfo.address}</li>
                <li><i class="fas fa-phone"></i> <a href="tel:${clinicInfo.phone}">${clinicInfo.phone}</a></li>
                <li><i class="fas fa-envelope"></i> <a href="mailto:${clinicInfo.email}">${clinicInfo.email}</a></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container d-flex justify-content-between flex-wrap">
          <p>© ${year} ${clinicInfo.clinic_name}. All rights reserved.</p>
          <div class="footer-legal">
            <a href="./privacy-policy.html">Privacy Policy</a>
            <a href="./terms.html">Terms</a>
          </div>
        </div>
      </div>

      <button class="back-to-top" id="backToTop">
        <i class="fas fa-arrow-up"></i>
      </button>
    </footer>
  `;

  initBackToTop();
}

// Back to top
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 300);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', renderFooter);

// Global export
window.footer = { renderFooter };
