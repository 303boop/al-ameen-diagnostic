/* =========================================
   ADMIN DASHBOARD CONTROLLER
   ========================================= */

const AdminDashboard = {
    
    // Initialize based on current page
    init() {
        const path = window.location.pathname;
        
        if (path.includes('index.html')) this.loadStats();
        if (path.includes('doctors.html')) this.loadDoctors();
        if (path.includes('tests.html')) this.loadTests();
        if (path.includes('appointments.html')) this.loadAppointments();
        
        // Auto-bind form submissions if they exist on the page
        this.bindEvents();
    },

    bindEvents() {
        // We bind these globally so <form onsubmit="..."> works if you used that method
        // But ideally, we listen for the ID
        const docForm = document.getElementById('addDoctorForm');
        if (docForm) {
            docForm.addEventListener('submit', (e) => this.saveDoctor(e));
        }

        const testForm = document.getElementById('addTestForm');
        if (testForm) {
            testForm.addEventListener('submit', (e) => this.saveTest(e));
        }
    },

    // ---------------------------------------------------------------
    // 1. DOCTOR MANAGEMENT
    // ---------------------------------------------------------------
    
    async loadDoctors() {
        const container = document.getElementById('doctorsTableBody');
        if(!container) return;

        container.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';

        const { data, error } = await window.supabase
            .from('doctors')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            window.toast.error('Failed to load doctors');
            return;
        }

        container.innerHTML = data.map(doc => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${doc.image_url || '../../assets/images/placeholder.jpg'}" class="rounded-circle me-2" width="40" height="40">
                        <div>
                            <div class="fw-bold">${doc.name}</div>
                            <small class="text-muted">${doc.specialization}</small>
                        </div>
                    </div>
                </td>
                <td>${window.helpers.formatCurrency(doc.consultation_fee)}</td>
                <td>${window.helpers.formatTime(doc.start_time)} - ${window.helpers.formatTime(doc.end_time)}</td>
                <td><span class="badge bg-${doc.is_active ? 'success' : 'secondary'}">${doc.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.adminDashboard.editDoctor('${doc.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.adminDashboard.deleteDoctor('${doc.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    // [CRITICAL FIX] This is the function your form was looking for
    async saveDoctor(e) {
        e.preventDefault();
        
        const btn = e.target.querySelector('button[type="submit"]');
        window.loader.showButtonLoader(btn);

        // Gather Form Data
        const formData = {
            name: document.getElementById('docName').value,
            specialization: document.getElementById('docSpec').value,
            consultation_fee: document.getElementById('docFee').value,
            start_time: document.getElementById('docStart').value,
            end_time: document.getElementById('docEnd').value,
            max_patients_per_day: document.getElementById('docLimit').value,
            image_url: document.getElementById('docImage').value,
            video_url: document.getElementById('docVideo').value,
            description: document.getElementById('docBio').value,
            is_active: document.getElementById('docStatus').checked
        };

        try {
            const { error } = await window.supabase
                .from('doctors')
                .insert([formData]);

            if (error) throw error;

            window.toast.success('Doctor added successfully!');
            setTimeout(() => window.location.href = 'doctors.html', 1000);

        } catch (err) {
            console.error(err);
            window.toast.error('Failed to save doctor: ' + err.message);
        } finally {
            window.loader.hideButtonLoader(btn);
        }
    },

    async deleteDoctor(id) {
        if(!confirm('Are you sure you want to remove this doctor?')) return;

        const { error } = await window.supabase.from('doctors').delete().eq('id', id);
        if(error) window.toast.error(error.message);
        else {
            window.toast.success('Doctor removed');
            this.loadDoctors();
        }
    },

    // ---------------------------------------------------------------
    // 2. TEST MANAGEMENT
    // ---------------------------------------------------------------

    async loadTests() {
        const container = document.getElementById('testsTableBody');
        if(!container) return;

        const { data, error } = await window.supabase.from('tests').select('*').order('name');
        
        if(error) return window.toast.error(error.message);

        container.innerHTML = data.map(test => `
            <tr>
                <td>${test.name}</td>
                <td>${window.helpers.formatCurrency(test.original_price)}</td>
                <td>
                    ${test.is_discount_active 
                        ? `<span class="text-success fw-bold">${window.helpers.formatCurrency(test.discount_price)}</span>` 
                        : '<span class="text-muted">-</span>'}
                </td>
                <td><span class="badge bg-${test.is_active ? 'success' : 'secondary'}">${test.is_active ? 'Active' : 'Hidden'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.adminDashboard.deleteTest('${test.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    // [CRITICAL FIX] Function for the "Add Test" form
    async saveTest(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        window.loader.showButtonLoader(btn);

        const formData = {
            name: document.getElementById('testName').value,
            description: document.getElementById('testDesc').value,
            original_price: document.getElementById('testPrice').value,
            discount_price: document.getElementById('testDiscount').value || null,
            is_discount_active: document.getElementById('testDiscountToggle')?.checked || false,
            duration_minutes: 15, // Default or add input for it
            prerequisites: document.getElementById('testPrep').value,
            image_url: document.getElementById('testImage').value,
            is_active: document.getElementById('testStatus').checked
        };

        try {
            const { error } = await window.supabase.from('tests').insert([formData]);
            if (error) throw error;

            window.toast.success('Test added successfully!');
            setTimeout(() => window.location.href = 'tests.html', 1000);
        } catch (err) {
            window.toast.error(err.message);
        } finally {
            window.loader.hideButtonLoader(btn);
        }
    },

    async deleteTest(id) {
        if(!confirm('Delete this test?')) return;
        const { error } = await window.supabase.from('tests').delete().eq('id', id);
        if(error) window.toast.error(error.message);
        else {
            window.toast.success('Test deleted');
            this.loadTests();
        }
    },

    // ---------------------------------------------------------------
    // 3. STATS (Dashboard Home)
    // ---------------------------------------------------------------
    async loadStats() {
        // Simple counts
        const tableCounts = ['doctors', 'tests', 'appointments', 'profiles'];
        const elements = ['totalDoctors', 'totalTests', 'totalAppts', 'totalPatients'];

        // Use Promise.all for parallel fetching
        // Note: Real implementation would handle this more gracefully
        // This is a placeholder for the logic inside analytics.js usually
        if(window.analytics) {
            const appts = await window.analytics.getAppointmentStats('2024-01-01', '2025-12-31');
            if(appts.success) {
                document.getElementById('totalBookings').innerText = appts.stats.total;
                document.getElementById('pendingBookings').innerText = appts.stats.booked;
            }
        }
    }
};

// Global Export
window.adminDashboard = AdminDashboard;

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Supabase is ready
    setTimeout(() => AdminDashboard.init(), 100);
});