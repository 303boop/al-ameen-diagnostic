// js/dashboards/lab.js

// =====================================================
// Lab Dashboard Controller
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/lab/')) {
        LabDashboard.init();
    }
});

const LabDashboard = {
    
    // --- 1. INITIALIZATION ---
    async init() {
        console.log("🧪 Initializing Lab Dashboard...");

        // A. Auth Check
        const user = await window.auth.getCurrentUser();
        if (!user) {
            window.location.href = `${window.BASE_PATH}/login.html`;
            return;
        }

        // B. Role Check
        const profile = await window.auth.getUserRole();
        if (!profile || profile.role !== 'lab') {
            console.warn("Unauthorized: Not a lab tech.");
            window.location.href = `${window.BASE_PATH}/index.html`;
            return;
        }

        // C. Load Data
        this.loadStats();
        this.loadTodayAppointments();
        
        // D. Setup Search Listener (if on index page)
        const searchInput = document.getElementById('bookingIdSearch');
        const searchBtn = document.getElementById('searchBtn');
        if(searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.searchByBookingId(searchInput.value));
        }
    },

    // --- 2. STATISTICS ---
    async loadStats() {
        const container = document.getElementById('labStats');
        if (!container) return;

        if(window.loader) window.loader.showSectionLoader(container);

        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Get Today's Work
            const { data: todayApps, error: todayError } = await window.supabase
                .from('appointments')
                .select('*')
                .eq('appointment_date', today);
            
            if (todayError) throw todayError;

            // 2. Get Pending Reports (Completed appointments with NO report)
            // Note: This is a simplified check. For production, use a more specific RPC or filter.
            const { data: completedApps } = await window.supabase
                .from('appointments')
                .select('id, reports(id)')
                .eq('status', 'completed');

            // Count how many have empty reports array
            const pendingReportsCount = completedApps 
                ? completedApps.filter(app => !app.reports || app.reports.length === 0).length 
                : 0;

            const stats = {
                today_total: todayApps.length,
                today_pending: todayApps.filter(a => a.status === 'booked').length,
                today_completed: todayApps.filter(a => a.status === 'completed').length,
                pending_reports: pendingReportsCount
            };

            this.renderStats(stats, container);

        } catch (error) {
            console.error("Stats Error:", error);
            container.innerHTML = `<p class="text-danger">Failed to load statistics.</p>`;
        } finally {
            if(window.loader) window.loader.hideSectionLoader(container);
        }
    },

    renderStats(stats, container) {
        container.innerHTML = `
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-calendar-day fa-2x mb-2"></i>
                            <h5>Today's Total</h5>
                            <h3>${stats.today_total}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-dark h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-hourglass-half fa-2x mb-2"></i>
                            <h5>Pending</h5>
                            <h3>${stats.today_pending}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-check-double fa-2x mb-2"></i>
                            <h5>Completed</h5>
                            <h3>${stats.today_completed}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger text-white h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-file-upload fa-2x mb-2"></i>
                            <h5>Reports Due</h5>
                            <h3>${stats.pending_reports}</h3>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- 3. APPOINTMENTS ---
    async loadTodayAppointments() {
        const container = document.getElementById('todayAppointments');
        if (!container) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await window.supabase
                .from('appointments')
                .select(`*, doctor:doctors(name), patient:profiles(full_name), test:tests(name)`)
                .eq('appointment_date', today)
                .order('serial_number');

            if (error) throw error;

            this.renderAppointments(data, container);

        } catch (error) {
            console.error(error);
            container.innerHTML = `<p class="text-danger">Error loading appointments.</p>`;
        }
    },

    renderAppointments(appointments, container) {
        if (!appointments.length) {
            container.innerHTML = `<div class="alert alert-info">No appointments scheduled for today.</div>`;
            return;
        }

        const rows = appointments.map(appt => {
            const patientName = appt.patient?.full_name || appt.guest_name || 'Guest';
            const serviceName = appt.doctor ? `Dr. ${appt.doctor.name}` : (appt.test ? appt.test.name : 'Unknown');
            
            // Action Buttons Logic
            let actions = '';
            if (appt.status === 'booked') {
                actions = `<button class="btn btn-sm btn-info text-white" onclick="window.labDashboard.updateStatus('${appt.id}', 'checked_in')">Check In</button>`;
            } else if (appt.status === 'checked_in') {
                actions = `<button class="btn btn-sm btn-success" onclick="window.labDashboard.updateStatus('${appt.id}', 'completed')">Complete</button>`;
            } else if (appt.status === 'completed') {
                actions = `<a href="upload-report.html?id=${appt.id}" class="btn btn-sm btn-outline-primary">Upload Report</a>`;
            }

            return `
                <tr>
                    <td><strong>#${appt.serial_number}</strong></td>
                    <td>${appt.booking_id}</td>
                    <td>${patientName}</td>
                    <td>${serviceName}</td>
                    <td>${appt.estimated_time}</td>
                    <td><span class="badge bg-${this.getStatusColor(appt.status)}">${appt.status}</span></td>
                    <td>${actions}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead><tr><th>Serial</th><th>ID</th><th>Patient</th><th>Service</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    getStatusColor(status) {
        return status === 'booked' ? 'warning' : status === 'checked_in' ? 'info' : status === 'completed' ? 'success' : 'secondary';
    },

    async updateStatus(id, status) {
        if (!confirm(`Mark this appointment as ${status}?`)) return;

        const { error } = await window.supabase
            .from('appointments')
            .update({ status: status })
            .eq('id', id);

        if (error) {
            alert("Error: " + error.message);
        } else {
            // Refresh
            this.loadStats();
            this.loadTodayAppointments();
        }
    },

    // --- 4. SEARCH ---
    async searchByBookingId(bookingId) {
        if (!bookingId) return alert("Enter a Booking ID");

        // Simple redirect to search result page or filter current view
        // For now, let's filter the current view or show a modal
        const { data, error } = await window.supabase
            .from('appointments')
            .select(`*, doctor:doctors(name), patient:profiles(full_name)`)
            .eq('booking_id', bookingId)
            .single();

        if (error || !data) {
            alert("Booking not found!");
        } else {
            alert(`Found: ${data.guest_name || data.patient?.full_name} - Status: ${data.status}`);
            // In a real app, you'd render this into a 'SearchResult' div
        }
    },

    // --- 5. REPORT UPLOAD (For upload-report.html) ---
    async handleUpload(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('uploadBtn');
        submitBtn.disabled = true;
        submitBtn.innerText = "Uploading...";

        const fileInput = document.getElementById('reportFile');
        const appointmentId = new URLSearchParams(window.location.search).get('id');
        const file = fileInput.files[0];

        if (!file || !appointmentId) {
            alert("Missing file or appointment ID");
            submitBtn.disabled = false;
            return;
        }

        try {
            const user = await window.auth.getCurrentUser();
            
            // 1. Upload to Supabase Storage
            const fileName = `${appointmentId}_${Date.now()}.pdf`;
            const bucketName = window.APP_CONSTANTS.STORAGE_BUCKETS.REPORTS || 'reports';
            
            const { data: fileData, error: uploadError } = await window.supabase.storage
                .from(bucketName)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = window.supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            // 3. Save Record in Database
            const { error: dbError } = await window.supabase
                .from('reports')
                .insert([{
                    appointment_id: appointmentId,
                    file_url: publicUrl,
                    uploaded_by: user.id,
                    report_type: 'diagnostic_test'
                }]);

            if (dbError) throw dbError;

            alert("Report Uploaded Successfully!");
            window.location.href = 'index.html'; // Go back to dashboard

        } catch (error) {
            console.error("Upload Error:", error);
            alert("Upload Failed: " + error.message);
            submitBtn.disabled = false;
            submitBtn.innerText = "Upload";
        }
    }
};

// Expose globally
window.labDashboard = LabDashboard;

// Auto-attach upload listener if we are on upload page
if (document.getElementById('uploadReportForm')) {
    document.getElementById('uploadReportForm').addEventListener('submit', (e) => LabDashboard.handleUpload(e));
}