// Dynamic Footer Component

// Render footer
async function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  // Fetch clinic settings
  const { data: settings } = await supabaseClient
    .from('clinic_settings')
    .select('*')
    .single();

  const clinicInfo = settings || {
    clinic_name: 'Al-Ameen Diagnostic Center',
    address: 'Baharampur, West Bengal, India',
    phone: '+91 1234567890',
    email: 'info@alameendiagnostic.com'
  };

  const currentYear = new Date().getFullYear();

  const footerHTML = `
    <footer class="footer">
      <div class="footer-top">
        <div class="container">
          <div class="row">
            <!-- About Section -->
            <div class="col-lg-4 col-md-6 mb-4">
              <div class="footer-widget">
                <h3 class="footer-title">${clinicInfo.clinic_name}</h3>
                <p class="footer-description" data-i18n="footer.about_text">
                  Providing quality healthcare services with modern facilities and expert medical professionals.
                </p>
                <div class="social-links">
                  <a href="#" class="social-link" title="Facebook">
                    <i class="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" class="social-link" title="Twitter">
                    <i class="fab fa-twitter"></i>
                  </a>
                  <a href="#" class="social-link" title="Instagram">
                    <i class="fab fa-instagram"></i>
                  </a>
                  <a href="#" class="social-link" title="LinkedIn">
                    <i class="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" class="social-link" title="YouTube">
                    <i class="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="col-lg-2 col-md-6 mb-4">
              <div class="footer-widget">
                <h4 class="footer-widget-title" data-i18n="footer.quick_links">Quick Links</h4>
                <ul class="footer-links">
                  <li><a href="/index.html" data-i18n="nav.home">Home</a></li>
                  <li><a href="/about.html" data-i18n="nav.about">About Us</a></li>
                  <li><a href="/doctors.html" data-i18n="nav.doctors">Doctors</a></li>
                  <li><a href="/tests.html" data-i18n="nav.tests">Tests</a></li>
                  <li><a href="/departments.html" data-i18n="nav.departments">Departments</a></li>
                  <li><a href="/gallery.html">Gallery</a></li>
                </ul>
              </div>
            </div>

            <!-- Services -->
            <div class="col-lg-2 col-md-6 mb-4">
              <div class="footer-widget">
                <h4 class="footer-widget-title">Services</h4>
                <ul class="footer-links">
                  <li><a href="/booking.html">Book Appointment</a></li>
                  <li><a href="/track-booking.html">Track Booking</a></li>
                  <li><a href="/contact.html">Contact Us</a></li>
                  <li><a href="/faq.html">FAQs</a></li>
                  <li><a href="/blog.html">Health Tips</a></li>
                </ul>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="col-lg-4 col-md-6 mb-4">
              <div class="footer-widget">
                <h4 class="footer-widget-title" data-i18n="footer.contact">Contact Info</h4>
                <ul class="footer-contact">
                  <li>
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${clinicInfo.address}</span>
                  </li>
                  <li>
                    <i class="fas fa-phone"></i>
                    <a href="tel:${clinicInfo.phone}">${clinicInfo.phone}</a>
                  </li>
                  <li>
                    <i class="fas fa-envelope"></i>
                    <a href="mailto:${clinicInfo.email}">${clinicInfo.email}</a>
                  </li>
                  ${clinicInfo.emergency_contact ? `
                  <li>
                    <i class="fas fa-ambulance"></i>
                    <a href="tel:${clinicInfo.emergency_contact}" class="emergency-contact">
                      Emergency: ${clinicInfo.emergency_contact}
                    </a>
                  </li>
                  ` : ''}
                </ul>
                ${clinicInfo.opening_time && clinicInfo.closing_time ? `
                <div class="footer-hours">
                  <i class="fas fa-clock"></i>
                  <span>Open: ${helpers.formatTime(clinicInfo.opening_time)} - ${helpers.formatTime(clinicInfo.closing_time)}</span>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p class="footer-copyright" data-i18n="footer.copyright">
                © ${currentYear} ${clinicInfo.clinic_name}. All rights reserved.
              </p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <ul class="footer-legal">
                <li><a href="/privacy-policy.html">Privacy Policy</a></li>
                <li><a href="/terms.html">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Top Button -->
      <button class="back-to-top" id="backToTop" title="Back to top">
        <i class="fas fa-arrow-up"></i>
      </button>
    </footer>
  `;

  footer.innerHTML = footerHTML;

  // Initialize back to top button
  initBackToTop();
}

// Back to top button
function initBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderFooter);

// Export
window.footer = {
  renderFooter
};