/* =========================================
   DYNAMIC FOOTER COMPONENT
   ========================================= */

const Footer = {
    async renderFooter() {
        const footer = document.getElementById('footer');
        if (!footer) return;

        // Default Info (Fallback)
        let clinicInfo = {
            clinic_name: 'Al-Ameen Diagnostic Center',
            address: 'Baharampur, West Bengal, India',
            phone: '+91 1234567890',
            email: 'info@alameendiagnostic.com'
        };

        // Try Fetching Real Settings from Supabase
        try {
            if (window.supabase) {
                const { data } = await window.supabase
                    .from('clinic_settings')
                    .select('*')
                    .single();
                
                if (data) clinicInfo = { ...clinicInfo, ...data };
            }
        } catch (e) {
            // Silently fail to defaults if offline
            console.warn("Using default footer info");
        }

        const year = new Date().getFullYear();

        // Render HTML
        footer.innerHTML = `
            <footer class="bg-dark text-white pt-5 pb-3 mt-auto">
                <div class="container">
                    <div class="row g-4">
                        
                        <div class="col-lg-4 col-md-6 mb-4">
                            <h5 class="text-uppercase mb-3 text-primary d-flex align-items-center gap-2">
                                <img src="assets/images/logo/logo.png" height="30" alt="Logo" style="filter: brightness(0) invert(1);"> 
                                ${clinicInfo.clinic_name}
                            </h5>
                            <p class="small text-white-50" data-i18n="footer.about_text">
                                Providing quality healthcare services with modern facilities and expert professionals.
                            </p>
                            <div class="d-flex gap-3 mt-3">
                                <a href="#" class="text-white-50 hover-white"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="text-white-50 hover-white"><i class="fab fa-instagram"></i></a>
                                <a href="#" class="text-white-50 hover-white"><i class="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>

                        <div class="col-lg-2 col-md-6 mb-4">
                            <h6 class="text-uppercase mb-3 fw-bold text-white" data-i18n="footer.quick_links">Quick Links</h6>
                            <ul class="list-unstyled small">
                                <li class="mb-2"><a href="index.html" class="text-white-50 text-decoration-none hover-primary">Home</a></li>
                                <li class="mb-2"><a href="about.html" class="text-white-50 text-decoration-none hover-primary">About Us</a></li>
                                <li class="mb-2"><a href="doctors.html" class="text-white-50 text-decoration-none hover-primary">Doctors</a></li>
                                <li class="mb-2"><a href="tests.html" class="text-white-50 text-decoration-none hover-primary">Tests</a></li>
                            </ul>
                        </div>

                        <div class="col-lg-2 col-md-6 mb-4">
                            <h6 class="text-uppercase mb-3 fw-bold text-white" data-i18n="footer.services">Patient Care</h6>
                            <ul class="list-unstyled small">
                                <li class="mb-2"><a href="booking.html" class="text-white-50 text-decoration-none hover-primary">Book Appointment</a></li>
                                <li class="mb-2"><a href="track-booking.html" class="text-white-50 text-decoration-none hover-primary">Track Status</a></li>
                                <li class="mb-2"><a href="login.html" class="text-white-50 text-decoration-none hover-primary">Patient Login</a></li>
                                <li class="mb-2"><a href="contact.html" class="text-white-50 text-decoration-none hover-primary">Contact Support</a></li>
                            </ul>
                        </div>

                        <div class="col-lg-4 col-md-6 mb-4">
                            <h6 class="text-uppercase mb-3 fw-bold text-white" data-i18n="footer.contact">Contact Us</h6>
                            <ul class="list-unstyled small text-white-50">
                                <li class="mb-3 d-flex gap-2">
                                    <i class="fas fa-map-marker-alt mt-1 text-primary"></i> 
                                    <span>${clinicInfo.address}</span>
                                </li>
                                <li class="mb-3 d-flex gap-2">
                                    <i class="fas fa-phone mt-1 text-primary"></i> 
                                    <span>${clinicInfo.phone}</span>
                                </li>
                                <li class="mb-3 d-flex gap-2">
                                    <i class="fas fa-envelope mt-1 text-primary"></i> 
                                    <span>${clinicInfo.email}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <hr class="border-secondary my-4 opacity-25">

                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <small class="text-white-50">
                            &copy; ${year} ${clinicInfo.clinic_name}. All rights reserved.
                        </small>
                        <div class="small">
                            <a href="privacy-policy.html" class="text-white-50 text-decoration-none me-3 hover-white">Privacy Policy</a>
                            <a href="terms.html" class="text-white-50 text-decoration-none hover-white">Terms & Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
        
        // Re-apply translation if available
        if(window.language && window.language.applyTranslations) {
            window.language.applyTranslations();
        }
    }
};

// Global Export
window.footer = Footer;

// Auto-render
document.addEventListener('DOMContentLoaded', () => Footer.renderFooter());