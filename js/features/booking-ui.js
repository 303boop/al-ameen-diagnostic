// js/features/booking-ui.js

// =====================================================
// Booking UI Controller
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are on the booking page
    if (document.getElementById('bookingForm')) {
        BookingUI.init();
    }
});

const BookingUI = {
    
    async init() {
        console.log("📅 Initializing Booking UI...");
        
        // 1. Set Min Date to Today
        const dateInput = document.getElementById('appointmentDate');
        if (dateInput) {
            dateInput.min = new Date().toISOString().split('T')[0];
        }

        // 2. Load Data
        await this.loadDoctors();
        await this.loadTests();

        // 3. Handle URL Params (Pre-select Doctor or Test)
        this.handleUrlParams();

        // 4. Pre-fill User Data (if logged in)
        this.prefillUserData();

        // 5. Setup Event Listeners
        this.setupListeners();
    },

    // --- DATA LOADING ---

    async loadDoctors() {
        const select = document.getElementById('doctorSelect');
        const result = await window.booking.getAvailableDoctors();
        
        select.innerHTML = '<option value="">Select a Doctor</option>';
        
        if (result.success) {
            result.data.forEach(doc => {
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${doc.name} (${doc.specialization})`;
                select.appendChild(option);
            });
        }
    },

    async loadTests() {
        const select = document.getElementById('testSelect');
        const result = await window.booking.getAvailableTests();
        
        select.innerHTML = '<option value="">Select a Lab Test</option>';
        
        if (result.success) {
            result.data.forEach(test => {
                const option = document.createElement('option');
                option.value = test.id;
                option.textContent = `${test.name} - ₹${test.discount_price || test.original_price}`;
                select.appendChild(option);
            });
        }
    },

    // --- LOGIC HANDLERS ---

    handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const doctorId = params.get('doctor_id') || params.get('doctor'); // handle both
        const testId = params.get('test_id') || params.get('test');

        if (testId) {
            // Switch to Test Mode
            document.getElementById('typeTest').checked = true;
            this.toggleBookingType('test');
            document.getElementById('testSelect').value = testId;
        } else if (doctorId) {
            // Switch to Doctor Mode (Default)
            document.getElementById('typeDoctor').checked = true;
            this.toggleBookingType('doctor');
            document.getElementById('doctorSelect').value = doctorId;
        }
    },

    async prefillUserData() {
        const user = await window.auth.getCurrentUser();
        if (user) {
            // Get profile details
            const profile = await window.auth.getUserRole(); // returns { role, full_name, phone }
            
            if (profile) {
                document.getElementById('patientName').value = profile.full_name || '';
                document.getElementById('patientPhone').value = profile.phone || '';
            }
            document.getElementById('patientEmail').value = user.email || '';
            
            // Optional: make email read-only so they don't think they can change account email here
            document.getElementById('patientEmail').readOnly = true; 
        }
    },

    toggleBookingType(type) {
        const docGroup = document.getElementById('doctorInputGroup');
        const testGroup = document.getElementById('testInputGroup');
        const docSelect = document.getElementById('doctorSelect');
        const testSelect = document.getElementById('testSelect');

        if (type === 'test') {
            docGroup.classList.add('d-none');
            testGroup.classList.remove('d-none');
            docSelect.required = false;
            testSelect.required = true;
            docSelect.value = ""; // clear selection
        } else {
            testGroup.classList.add('d-none');
            docGroup.classList.remove('d-none');
            testSelect.required = false;
            docSelect.required = true;
            testSelect.value = ""; // clear selection
        }
    },

    setupListeners() {
        // A. Toggle Buttons
        const radios = document.getElementsByName('bookingType');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleBookingType(e.target.value);
            });
        });

        // B. Form Submit
        const form = document.getElementById('bookingForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleBookingSubmit();
        });
    },

    async handleBookingSubmit() {
        const submitBtn = document.getElementById('submitBooking');
        const originalText = submitBtn.innerText;
        
        // 1. Gather Data
        const type = document.querySelector('input[name="bookingType"]:checked').value;
        const doctorId = document.getElementById('doctorSelect').value;
        const testId = document.getElementById('testSelect').value;
        
        const formData = {
            doctor_id: type === 'doctor' ? doctorId : null,
            test_id: type === 'test' ? testId : null,
            appointment_date: document.getElementById('appointmentDate').value,
            guest_name: document.getElementById('patientName').value,
            guest_phone: document.getElementById('patientPhone').value,
            guest_email: document.getElementById('patientEmail').value,
            notes: document.getElementById('patientNotes').value,
            coupon_code: document.getElementById('couponCode').value
        };

        // 2. Validate
        if (type === 'doctor' && !formData.doctor_id) {
            alert("Please select a doctor."); // Replace with toast if available
            return;
        }
        if (type === 'test' && !formData.test_id) {
            alert("Please select a test.");
            return;
        }

        // 3. Send to Backend
        submitBtn.disabled = true;
        submitBtn.innerText = "Processing...";

        const result = await window.booking.createAppointment(formData);

        submitBtn.disabled = false;
        submitBtn.innerText = originalText;

        // 4. Handle Result
        if (result.success) {
            // Hide form, show success message
            // Ideally, show a nice modal. For now, simple redirect/alert
            alert("Booking Confirmed! Booking ID: " + result.data.booking_id);
            window.location.href = `${window.BASE_PATH}/booking-confirmation.html?id=${result.data.booking_id}`;
        } else {
            console.error(result.error);
            alert("Booking Failed: " + result.error);
        }
    }
};