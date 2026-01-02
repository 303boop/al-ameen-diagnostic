// js/dashboards/patient.js

// =====================================================
// Patient Dashboard Controller
// =====================================================

const PatientDashboard = {
    
    // --- 1. INITIALIZATION ---
    async init() {
        console.log("🏥 Initializing Patient Dashboard...");

        // A. Auth Check
        const user = await window.auth.getCurrentUser();
        if (!user) {
            window.location.href = `${window.BASE_PATH}/login.html`;
            return;
        }

        // B. Role Check
        const profile = await window.auth.getUserRole();
        if (!profile || profile.role !== 'patient') {
            console.warn("Unauthorized access: Redirecting to home.");
            window.location.href = `${window.BASE_PATH}/index.html`;
            return;
        }

        // C. Update UI with User Info
        this.updateHeader(profile);

        // D. Load Data
        this.loadStats(user.id);
        this.loadUpcomingAppointments(user.id);
        this.loadRecentReports(user.id);
    },

    updateHeader(profile) {
        // Optional: specific logic to update the dashboard sidebar/header with name
        const nameEl = document.getElementById('patientNameDisplay');
        if (nameEl) nameEl.innerText = profile.full_name || "Patient";
    },

    // --- 2. STATISTICS ---
    async loadStats(userId) {
        const container = document.getElementById('patientStats');
        if (!container) return;

        // Uses your global loader if available, otherwise silent
        if (window.loader) window.loader.showSectionLoader(container);

        try {
            // Fetch Appointments
            const { data: appts, error: apptError } = await window.supabase
                .from('appointments')
                .select('status, appointment_date')
                .eq('patient_id', userId);

            if (apptError) throw apptError;

            // Fetch Reports Count
            const { count: reportsCount, error: reportError } = await window.supabase
                .from('reports')
                .select('*', { count: 'exact', head: true })
                .eq('patient_id', userId);

            if (reportError) throw reportError;

            // Calculate Stats
            const now = new Date();
            const stats = {
                total: appts.length,
                upcoming: appts.filter(a => new Date(a.appointment_date) >= now && a.status === 'booked').length,
                completed: appts.filter(a => a.status === 'completed').length,
                reports: reportsCount || 0
            };

            this.renderStats(stats, container);

        } catch (error) {
            console.error("Stats Error:", error);
            container.innerHTML = `<p class="text-danger">Failed to load statistics.</p>`;
        } finally {
            if (window.loader) window.loader.hideSectionLoader(container);
        }
    },

    renderStats(stats, container) {
        container.innerHTML = `
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="stat-card bg-white p-3 rounded shadow-sm">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-primary text-white rounded-circle p-3 me-3">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div>
                                <h3 class="mb-0">${stats.total}</h3>
                                <p class="text-muted mb-0">Total</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-white p-3 rounded shadow-sm">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-warning text-white rounded-circle p-3 me-3">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div>
                                <h3 class="mb-0">${stats.upcoming}</h3>
                                <p class="text-muted mb-0">Upcoming</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-white p-3 rounded shadow-sm">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-success text-white rounded-circle p-3 me-3">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <h3 class="mb-0">${stats.completed}</h3>
                                <p class="text-muted mb-0">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-white p-3 rounded shadow-sm">
                        <div class="d-flex align-items-center">
                            <div class="stat-icon bg-info text-white rounded-circle p-3 me-3">
                                <i class="fas fa-file-medical"></i>
                            </div>
                            <div>
                                <h3 class="mb-0">${stats.reports}</h3>
                                <p class="text-muted mb-0">Reports</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- 3. UPCOMING APPOINTMENTS ---
    async loadUpcomingAppointments(userId) {
        const container = document.getElementById('upcomingAppointments');
        if (!container) return;

        try {
            const today = new Date().toISOString().split('T')[0];

            // Fetch Data (Including Test or Doctor info)
            const { data, error } = await window.supabase
                .from('appointments')
                .select(`
                    *,
                    doctor:doctors(name, specialization, image_url),
                    test:tests(name)
                `)
                .eq('patient_id', userId)
                .gte('appointment_date', today)
                .in('status', ['booked', 'checked_in'])
                .order('appointment_date', { ascending: true })
                .limit(5);

            if (error) throw error;

            this.renderAppointments(data, container);

        } catch (error) {
            console.error("Appointments Error:", error);
            container.innerHTML = `<p class="text-danger">Could not load appointments.</p>`;
        }
    },

    renderAppointments(appointments, container) {
        if (!appointments || appointments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted">No upcoming appointments.</p>
                    <a href="${window.BASE_PATH}/booking.html" class="btn btn-primary">Book Now</a>
                </div>
            `;
            return;
        }

        // Generate HTML
        container.innerHTML = appointments.map(appt => {
            // Determine Title (Doctor Name or Test Name)
            const title = appt.doctor ? `Dr. ${appt.doctor.name}` : (appt.test ? appt.test.name : "Appointment");
            const subtitle = appt.doctor ? appt.doctor.specialization : "Lab Test";
            const img = appt.doctor?.image_url || `${window.BASE_PATH}/assets/images/logo/logo.png`; // Fallback image

            return `
            <div class="card mb-3 shadow-sm border-0">
                <div class="card-body d-flex align-items-center">
                    <img src="${img}" class="rounded-circle me-3" width="50" height="50" style="object-fit:cover;" alt="Avatar">
                    
                    <div class="flex-grow-1">
                        <h5 class="mb-1">${title}</h5>
                        <p class="mb-1 text-muted small">${subtitle}</p>
                        <div class="small">
                            <span class="me-3"><i class="fas fa-calendar-alt text-primary"></i> ${appt.appointment_date}</span>
                            <span class="me-3"><i class="fas fa-clock text-warning"></i> ${appt.estimated_time}</span>
                            <span><i class="fas fa-hashtag text-secondary"></i> Serial: ${appt.serial_number}</span>
                        </div>
                    </div>

                    <div>
                        <button class="btn btn-outline-danger btn-sm" 
                            onclick="window.patientDashboard.handleCancel('${appt.id}')">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    },

    // --- 4. RECENT REPORTS ---
    async loadRecentReports(userId) {
        const container = document.getElementById('recentReports');
        if (!container) return;

        try {
            const { data, error } = await window.supabase
                .from('reports')
                .select(`*, test:tests(name)`)
                .eq('patient_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            this.renderReports(data, container);

        } catch (error) {
            console.error("Reports Error:", error);
        }
    },

    renderReports(reports, container) {
        if (!reports || reports.length === 0) {
            container.innerHTML = `<p class="text-muted">No reports available yet.</p>`;
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="card mb-2 border-0 bg-light">
                <div class="card-body d-flex justify-content-between align-items-center py-2">
                    <div>
                        <h6 class="mb-0">${report.test?.name || 'Diagnostic Report'}</h6>
                        <small class="text-muted">${new Date(report.created_at).toLocaleDateString()}</small>
                    </div>
                    <a href="${report.file_url}" target="_blank" class="btn btn-sm btn-primary">
                        <i class="fas fa-download"></i> View
                    </a>
                </div>
            </div>
        `).join('');
    },

    // --- 5. ACTIONS ---
    async handleCancel(apptId) {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;

        // Use the global booking module we fixed earlier
        if (window.booking) {
            const result = await window.booking.cancelAppointment(apptId, "Cancelled by Patient");
            if (result.success) {
                alert("Appointment cancelled.");
                location.reload(); // Simple reload to refresh data
            } else {
                alert("Error: " + result.error);
            }
        }
    }
};

// Export to Window
window.patientDashboard = PatientDashboard;
console.log("✅ Patient Dashboard module loaded");