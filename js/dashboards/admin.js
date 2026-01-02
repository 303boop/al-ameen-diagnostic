/* =========================================
   ADMIN DASHBOARD CONTROLLER (FIXED)
   ========================================= */

const AdminDashboard = {
    
    init() {
        const path = window.location.pathname;
        if (path.includes('doctors.html')) this.loadDoctors();
        if (path.includes('tests.html')) this.loadTests();
        if (path.includes('index.html')) this.loadStats();
        
        // Auto-bind Forms if they exist on the current page
        this.bindForms();
    },

    bindForms() {
        // Doctor Form
        const docForm = document.getElementById('addDoctorForm');
        if (docForm) {
            // Remove old listeners to prevent duplicates
            const newForm = docForm.cloneNode(true);
            docForm.parentNode.replaceChild(newForm, docForm);
            
            newForm.addEventListener('submit', (e) => {
                e.preventDefault(); // This will now definitely work
                this.saveDoctor(newForm);
            });
        }

        // Test Form
        const testForm = document.getElementById('addTestForm');
        if (testForm) {
            const newForm = testForm.cloneNode(true);
            testForm.parentNode.replaceChild(newForm, testForm);
            
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTest(newForm);
            });
        }
    },

    // ---------------------------------------------------------------
    // 1. DOCTOR MANAGEMENT
    // ---------------------------------------------------------------
    
    async saveDoctor(formElement) {
        const btn = formElement.querySelector('button[type="submit"]');
        window.loader.showButtonLoader(btn);

        // Gather Data directly from the form element passed
        const formData = {
            name: formElement.querySelector('#docName').value,
            specialization: formElement.querySelector('#docSpec').value,
            consultation_fee: formElement.querySelector('#docFee').value,
            start_time: formElement.querySelector('#docStart').value,
            end_time: formElement.querySelector('#docEnd').value,
            max_patients_per_day: formElement.querySelector('#docLimit').value,
            image_url: formElement.querySelector('#docImage').value,
            video_url: formElement.querySelector('#docVideo').value,
            description: formElement.querySelector('#docBio').value,
            is_active: formElement.querySelector('#docStatus').checked
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
            window.toast.error('Error: ' + err.message);
        } finally {
            window.loader.hideButtonLoader(btn);
        }
    },

    async loadDoctors() {
        const container = document.getElementById('doctorsTableBody');
        if(!container) return;

        container.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';

        const { data, error } = await window.supabase
            .from('doctors')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return window.toast.error(error.message);

        container.innerHTML = data.map(doc => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${doc.image_url || '../../assets/images/placeholder.jpg'}" class="rounded-circle me-2" width="40" height="40" onerror="this.src='../../assets/images/placeholder.jpg'">
                        <div>
                            <div class="fw-bold">${doc.name}</div>
                            <small class="text-muted">${doc.specialization}</small>
                        </div>
                    </div>
                </td>
                <td>₹${doc.consultation_fee}</td>
                <td>${doc.start_time} - ${doc.end_time}</td>
                <td><span class="badge bg-${doc.is_active ? 'success' : 'secondary'}">${doc.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.adminDashboard.deleteDoctor('${doc.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    async deleteDoctor(id) {
        if(!confirm('Are you sure?')) return;
        const { error } = await window.supabase.from('doctors').delete().eq('id', id);
        if(error) window.toast.error(error.message);
        else {
            window.toast.success('Deleted');
            this.loadDoctors();
        }
    },

    // ---------------------------------------------------------------
    // 2. TEST MANAGEMENT
    // ---------------------------------------------------------------

    async saveTest(formElement) {
        const btn = formElement.querySelector('button[type="submit"]');
        window.loader.showButtonLoader(btn);

        const formData = {
            name: formElement.querySelector('#testName').value,
            description: formElement.querySelector('#testDesc').value,
            original_price: formElement.querySelector('#testPrice').value,
            discount_price: formElement.querySelector('#testDiscount').value || null,
            is_discount_active: formElement.querySelector('#testDiscountToggle')?.checked || false,
            duration_minutes: 15,
            prerequisites: formElement.querySelector('#testPrep').value,
            image_url: formElement.querySelector('#testImage').value,
            is_active: formElement.querySelector('#testStatus').checked
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

    async loadTests() {
        // ... (Same logic as doctors but for tests table) ...
        const container = document.getElementById('testsTableBody');
        if(!container) return;
        
        const { data, error } = await window.supabase.from('tests').select('*');
        if(error) return;

        container.innerHTML = data.map(test => `
            <tr>
                <td>${test.name}</td>
                <td>₹${test.original_price}</td>
                <td>${test.is_discount_active ? '₹'+test.discount_price : '-'}</td>
                <td><span class="badge bg-${test.is_active ? 'success' : 'secondary'}">${test.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.adminDashboard.deleteTest('${test.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    async deleteTest(id) {
        if(!confirm('Delete this test?')) return;
        const { error } = await window.supabase.from('tests').delete().eq('id', id);
        if(!error) {
            window.toast.success('Test deleted');
            this.loadTests();
        }
    }
};

// Global Export
window.adminDashboard = AdminDashboard;

// Auto-init with small delay to ensure DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => AdminDashboard.init(), 100);
});