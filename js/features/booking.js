// js/features/booking.js

// =====================================================
// Booking Management Feature
// =====================================================

// Safety Check
if (!window.supabase || !window.APP_CONSTANTS) {
    console.error("❌ Critical dependencies missing in booking.js");
}

const Booking = {
    
    // --- 1. HELPERS ---

    generateBookingID() {
        const prefix = window.APP_CONSTANTS.BOOKING_PREFIX || "ALM";
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${date}-${random}`;
    },

    calculateEstimatedTime(startTime, serialNumber, avgTime = 15) {
        if (!startTime) return "09:00"; // Default fallback
        const [h, m] = startTime.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m, 0);
        date.setMinutes(date.getMinutes() + (serialNumber - 1) * avgTime);
        return date.toTimeString().slice(0, 5); // HH:MM
    },

    // --- 2. DATA FETCHING ---

    async getAvailableDoctors() {
        try {
            const { data, error } = await window.supabase
                .from("doctors")
                .select("*")
                .eq("is_active", true)
                .order("name");

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getAvailableTests() {
        try {
            const { data, error } = await window.supabase
                .from("tests")
                .select("*")
                .eq("is_active", true)
                .order("name");

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getDoctorById(id) {
        try {
            const { data, error } = await window.supabase
                .from("doctors")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getTestById(id) {
        try {
            const { data, error } = await window.supabase
                .from("tests")
                .select("*")
                .eq("id", id)
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --- 3. QUEUE LOGIC ---

    async getNextSerialNumber(resourceId, date, isTest = false) {
        const column = isTest ? "test_id" : "doctor_id";
        
        try {
            const { data, error } = await window.supabase
                .from("appointments")
                .select("serial_number")
                .eq(column, resourceId)
                .eq("appointment_date", date)
                .order("serial_number", { ascending: false })
                .limit(1);

            if (error) throw error;

            const nextSerial = (data && data.length > 0) ? data[0].serial_number + 1 : 1;
            return { success: true, serial: nextSerial };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --- 4. CORE: CREATE APPOINTMENT ---

    async createAppointment(formData) {
        try {
            // A. Validate Inputs
            if (!formData.appointment_date) throw new Error("Date is required.");
            if (!formData.doctor_id && !formData.test_id) throw new Error("Select a Doctor or a Test.");

            // B. Check Auth (or Guest)
            // Use the AUTH module we created earlier
            const user = await window.auth.getCurrentUser();
            
            if (!user && !formData.guest_name) {
                throw new Error("Please log in or provide guest details.");
            }

            // C. Determine Type (Doctor vs Test)
            const isTest = !!formData.test_id;
            const resourceId = isTest ? formData.test_id : formData.doctor_id;

            // D. Get Queue Position
            const queueRes = await this.getNextSerialNumber(resourceId, formData.appointment_date, isTest);
            if (!queueRes.success) throw new Error("Queue Error: " + queueRes.error);

            // E. Calculate Timing
            let estimatedTime = "09:00"; // Default for tests
            if (!isTest) {
                const docRes = await this.getDoctorById(formData.doctor_id);
                if (docRes.success) {
                    estimatedTime = this.calculateEstimatedTime(docRes.data.start_time, queueRes.serial);
                }
            }

            // F. Build Payload
            const payload = {
                booking_id: this.generateBookingID(),
                appointment_date: formData.appointment_date,
                serial_number: queueRes.serial,
                estimated_time: estimatedTime,
                status: window.APP_CONSTANTS.APPOINTMENT_STATUS.BOOKED,
                patient_notes: formData.notes || "",
                coupon_code: formData.coupon_code || null,
                
                // Foreign Keys
                doctor_id: formData.doctor_id || null,
                test_id: formData.test_id || null,
                
                // User vs Guest
                patient_id: user ? user.id : null,
                guest_name: user ? null : formData.guest_name,
                guest_phone: user ? null : formData.guest_phone,
                guest_email: user ? null : formData.guest_email
            };

            // G. Insert to Supabase
            const { data, error } = await window.supabase
                .from("appointments")
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            return { success: true, data: data };

        } catch (error) {
            console.error("Create Appointment Error:", error);
            return { success: false, error: error.message };
        }
    },

    // --- 5. HISTORY & MANAGEMENT ---

    async getAppointmentByBookingId(bookingId) {
        try {
            // We fetch doctor AND test details to handle both types
            const { data, error } = await window.supabase
                .from("appointments")
                .select(`
                    *,
                    doctor:doctors(name, specialization, image_url),
                    test:tests(name, duration_minutes)
                `)
                .eq("booking_id", bookingId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getUserAppointments(userId) {
        try {
            const { data, error } = await window.supabase
                .from("appointments")
                .select(`
                    *,
                    doctor:doctors(name, specialization),
                    test:tests(name)
                `)
                .eq("patient_id", userId)
                .order("appointment_date", { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async cancelAppointment(id, reason) {
        try {
            const { data, error } = await window.supabase
                .from("appointments")
                .update({ 
                    status: window.APP_CONSTANTS.APPOINTMENT_STATUS.CANCELLED,
                    cancellation_reason: reason 
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// --- INITIALIZATION ---
// This allows main.js to call booking.initBookingForm() if you add UI logic later
// For now, we export the data layer.
window.booking = Booking;
console.log("✅ Booking module loaded");