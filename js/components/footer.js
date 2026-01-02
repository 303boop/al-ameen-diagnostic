// js/components/footer.js

// =====================================================
// Dynamic Footer Component
// =====================================================

const Footer = {
    async renderFooter() {
        const footer = document.getElementById('footer');
        if (!footer) return;

        const BP = window.BASE_PATH || '';
        const year = new Date().getFullYear();

        // Default Info
        let clinicInfo = {
            clinic_name: 'Al-Ameen Diagnostic Center',
            address: 'Baharampur, West Bengal, India',
            phone: '+91 1234567890',
            email: 'info@alameendiagnostic.com'
        };

        // Try Fetching Settings (Silent Fail Safe)
        try {
            if (window.supabase) {
                const { data } = await window.supabase
                    .from('clinic_settings')
                    .select('*')
                    .single();
                
                if (data) clinicInfo = { ...clinicInfo, ...data };
            }
        } catch (e) {
            // Use defaults if offline or table missing
        }

        footer.innerHTML = `
            <footer class="bg-dark text-white pt-5 pb-3 mt-auto">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-4 col-md-6 mb-4">
                            <h5 class="text-uppercase mb-3 text-primary">${clinicInfo.clinic_name}</h5>
                            <p class="small text-muted">
                                Providing quality healthcare services with modern facilities and expert professionals.
                            </p>
                            <div class="d-flex gap-3">
                                <a href="#" class="text-white"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="text-white"><i class="fab fa-instagram"></i></a>
                                <a href="#" class="text-white"><i class="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>

                        <div class="col-lg-2 col-md-6 mb-4">
                            <h6 class="text-uppercase mb-3 fw-bold">Quick Links</h6>
                            <ul class="list-unstyled small">
                                <li><a href="${BP}/index.html" class="text-white-50 text-decoration-none">Home</a></li>
                                <li><a href="${BP}/about.html" class="text-white-50 text-decoration-none">About</a></li>
                                <li><a href="${BP}/doctors.html" class="text-white-50 text-decoration-none">Doctors</a></li>
                                <li><a href="${BP}/tests.html" class="text-white-50 text-decoration-none">Tests</a></li>
                            </ul>
                        </div>

                        <div class="col-lg-2 col-md-6 mb-4">
                            <h6 class="text-uppercase mb-3 fw-bold">Patient Care</h6>
                            <ul class="list-unstyled small">
                                <li><a href="${BP}/booking.html" class="text-white-50 text-decoration-none">Book Appointment</a></li>
                                <li><a href="${BP}/track-booking.html" class="text-white-50 text-decoration-none">Track Status</a></li>
                                <li><a href="${BP}/dashboards/patient/index.html" class="text-white-50 text-decoration-none">Patient Login</a></li>
                            </ul>
                        </div>

                        <div class="col-lg-4 col-md-6 mb-4">
                            <h6 class="text-uppercase mb-3 fw-bold">Contact Us</h6>
                            <ul class="list-unstyled small text-white-50">
                                <li class="mb-2"><i class="fas fa-map-marker-alt me-2"></i> ${clinicInfo.address}</li>
                                <li class="mb-2"><i class="fas fa-phone me-2"></i> ${clinicInfo.phone}</li>
                                <li class="mb-2"><i class="fas fa-envelope me-2"></i> ${clinicInfo.email}</li>
                            </ul>
                        </div>
                    </div>

                    <hr class="border-secondary my-4">

                    <div class="d-flex justify-content-between align-items-center flex-wrap">
                        <small class="text-muted">&copy; ${year} ${clinicInfo.clinic_name}. All rights reserved.</small>
                        <div class="small">
                            <a href="${BP}/privacy-policy.html" class="text-muted text-decoration-none me-3">Privacy</a>
                            <a href="${BP}/terms.html" class="text-muted text-decoration-none">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
};

// Global Export
window.footer = Footer;

// Auto-render
document.addEventListener('DOMContentLoaded', () => Footer.renderFooter());