// js/dashboards/admin.js

// =====================================================
// Admin Dashboard Controller
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // Auto-init if we are on the admin dashboard page
    if (window.location.pathname.includes('/admin/')) {
        AdminDashboard.init();
    }
});

const AdminDashboard = {

    // --- 1. INITIALIZATION ---
    async init() {
        console.log("🛡️ Initializing Admin Dashboard...");

        // A. Auth Check
        const user = await window.auth.getCurrentUser();
        if (!user) {
            window.location.href = `${window.BASE_PATH}/login.html`;
            return;
        }

        // B. Role Check
        const profile = await window.auth.getUserRole();
        if (!profile || profile.role !== 'admin') {
            console.warn("Unauthorized: Not an admin.");
            window.location.href = `${window.BASE_PATH}/index.html`;
            return;
        }

        // C. Load Data based on current page
        const path = window.location.pathname;

        if (path.endsWith('index.html') || path.endsWith('/admin/')) {
            this.loadAdminStats();
            this.loadRecentAppointments();
            this.loadAnalytics();
        } 
        else if (path.includes('doctors.html')) this.loadDoctors();
        else if (path.includes('tests.html')) this.loadTests();
        else if (path.includes('coupons.html')) this.loadCoupons();
        else if (path.includes('users.html')) this.loadUsers();
    },

    // --- 2. STATISTICS & ANALYTICS ---
    async loadAdminStats() {
        const container = document.getElementById('adminStats');
        if (!container) return;

        if (!window.analytics) {
            console.warn("Analytics module missing.");
            container.innerHTML = `<div class="alert alert-warning">Analytics module not loaded.</div>`;
            return;
        }

        if(window.loader) window.loader.showSectionLoader(container);

        try {
            // Fetch Analytics Data
            const [today, patients, doctors, revenue] = await Promise.all([
                window.analytics.getTodayAppointments(),
                window.analytics.getTotalPatients(),
                window.analytics.getActiveDoctors(),
                window.analytics.getRevenueData(30) // Last 30 days
            ]);

            const stats = {
                today_appointments: today?.count || 0,
                total_patients: patients?.count || 0,
                active_doctors: doctors?.count || 0,
                monthly_revenue: revenue?.total || 0
            };

            this.renderStats(stats, container);

        } catch (error) {
            console.error('Stats Error:', error);
            container.innerHTML = `<p class="text-danger">Failed to load statistics.</p>`;
        } finally {
            if(window.loader) window.loader.hideSectionLoader(container);
        }
    },

    renderStats(stats, container) {
        // Helper to format currency
        const formatMoney = (amount) => `₹${amount.toLocaleString()}`;

        container.innerHTML = `
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white h-100">
                        <div class="card-body">
                            <h6 class="text-uppercase small">Today's Appointments</h6>
                            <h2 class="display-6 fw-bold">${stats.today_appointments}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white h-100">
                        <div class="card-body">
                            <h6 class="text-uppercase small">Total Patients</h6>
                            <h2 class="display-6 fw-bold">${stats.total_patients}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white h-100">
                        <div class="card-body">
                            <h6 class="text-uppercase small">Active Doctors</h6>
                            <h2 class="display-6 fw-bold">${stats.active_doctors}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-dark h-100">
                        <div class="card-body">
                            <h6 class="text-uppercase small">Monthly Revenue</h6>
                            <h2 class="display-6 fw-bold">${formatMoney(stats.monthly_revenue)}</h2>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async loadAnalytics() {
        if (!window.analytics) return;
        
        // Ensure elements exist before trying to render charts
        if(document.getElementById('revenueChart')) {
            window.analytics.renderRevenueChart('revenueChart');
        }
    },

    // --- 3. RECENT APPOINTMENTS ---
    async loadRecentAppointments() {
        const container = document.getElementById('recentAppointments');
        if (!container) return;

        try {
            const { data, error } = await window.supabase
                .from('appointments')
                .select(`*, doctor:doctors(name), patient:profiles(full_name)`)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            this.renderAppointmentsTable(data, container);

        } catch (error) {
            container.innerHTML = `<p class="text-danger">Error loading appointments.</p>`;
        }
    },

    renderAppointmentsTable(appointments, container) {
        if (!appointments.length) {
            container.innerHTML = `<p class="text-muted">No appointments found.</p>`;
            return;
        }

        const rows = appointments.map(appt => `
            <tr>
                <td><small class="text-muted">${appt.booking_id}</small></td>
                <td>${appt.patient?.full_name || appt.guest_name || 'Guest'}</td>
                <td>${appt.doctor?.name || 'Lab Test'}</td>
                <td>${appt.appointment_date}</td>
                <td><span class="badge bg-${this.getStatusColor(appt.status)}">${appt.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-light" onclick="window.adminDashboard.viewAppointment('${appt.id}')">View</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead><tr><th>ID</th><th>Patient</th><th>Doctor/Test</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    getStatusColor(status) {
        switch(status) {
            case 'booked': return 'primary';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    },

    async viewAppointment(id) {
        alert(`View Appointment ID: ${id} \n(Modal functionality needs js/components/modal.js)`);
    },

    // --- 4. DOCTORS MANAGEMENT ---
    async loadDoctors() {
        const container = document.getElementById('doctorsTable');
        if (!container) return;

        const { data, error } = await window.supabase
            .from('doctors')
            .select('*')
            .order('name');

        if (error) {
            container.innerHTML = "Error loading doctors.";
            return;
        }

        container.innerHTML = `
            <table class="table table-hover">
                <thead><tr><th>Name</th><th>Specialization</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    ${data.map(doc => `
                        <tr>
                            <td>${doc.name}</td>
                            <td>${doc.specialization}</td>
                            <td>${doc.is_active ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" onclick="window.location.href='add-doctor.html?id=${doc.id}'">Edit</button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="window.adminDashboard.toggleDoctor('${doc.id}', ${!doc.is_active})">
                                    ${doc.is_active ? 'Disable' : 'Enable'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    async toggleDoctor(id, status) {
        await window.supabase.from('doctors').update({ is_active: status }).eq('id', id);
        this.loadDoctors(); // Refresh
    },

    // --- 5. USERS MANAGEMENT (Fixed) ---
    async loadUsers() {
        const container = document.getElementById('usersTable'); // Ensure you have a <div id="usersTable"></div> in users.html
        if (!container) return;

        const { data, error } = await window.supabase
            .from("profiles")
            .select(`id, full_name, phone, role, created_at`)
            .order('created_at', { ascending: false });

        if (error) {
            container.innerHTML = `<p class="text-danger">Failed to load users.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(user => `
                            <tr>
                                <td>${user.full_name || 'N/A'}</td>
                                <td>${user.phone || '-'}</td>
                                <td><span class="badge bg-secondary">${user.role}</span></td>
                                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <select class="form-select form-select-sm d-inline-block w-auto" 
                                        onchange="window.adminDashboard.updateUserRole('${user.id}', this.value)">
                                        <option value="patient" ${user.role === 'patient' ? 'selected' : ''}>Patient</option>
                                        <option value="lab" ${user.role === 'lab' ? 'selected' : ''}>Lab</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    async updateUserRole(userId, newRole) {
        if(!confirm(`Change user role to ${newRole}?`)) return;

        const { error } = await window.supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) alert("Update failed: " + error.message);
        else alert("Role updated successfully.");
    }
};

// Export
window.adminDashboard = AdminDashboard;
console.log("✅ Admin Dashboard loaded");