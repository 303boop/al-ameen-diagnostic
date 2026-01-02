// Booking Management (Fixed & Production-Safe)

/* =========================
   SAFETY CHECKS
========================= */
if (!window.supabase) {
  console.error("❌ Supabase not initialized");
}

/* =========================
   HELPERS
========================= */

// Generate Booking ID → ALM-YYYYMMDD-XXXX
function generateBookingID() {
  const prefix = APP_CONSTANTS.BOOKING_PREFIX;
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${random}`;
}

/* =========================
   GET AVAILABLE DOCTORS
========================= */
async function getAvailableDoctors() {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   GET AVAILABLE TESTS
========================= */
async function getAvailableTests() {
  try {
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching tests:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   GET DOCTOR BY ID
========================= */
async function getDoctorById(doctorId) {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", doctorId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   GET NEXT SERIAL NUMBER
========================= */
async function getNextSerialNumber(doctorId, appointmentDate) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("serial_number")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", appointmentDate)
      .order("serial_number", { ascending: false })
      .limit(1);

    if (error) throw error;

    const nextSerial = data.length ? data[0].serial_number + 1 : 1;
    return { success: true, serial: nextSerial };
  } catch (error) {
    console.error("Error getting serial:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   CALCULATE ESTIMATED TIME
========================= */
function calculateEstimatedTime(startTime, serialNumber, avgTime = 15) {
  const [h, m] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0);

  date.setMinutes(date.getMinutes() + (serialNumber - 1) * avgTime);

  return date.toTimeString().slice(0, 5);
}

/* =========================
   CREATE APPOINTMENT
========================= */
async function createAppointment(appointmentData) {
  try {
    const user = await getCurrentUser();

    if (!appointmentData.doctor_id || !appointmentData.appointment_date) {
      throw new Error("Missing required appointment details");
    }

    if (!user && !appointmentData.guest_name) {
      throw new Error("Login required or guest details missing");
    }

    const serialResult = await getNextSerialNumber(
      appointmentData.doctor_id,
      appointmentData.appointment_date
    );

    if (!serialResult.success) throw new Error(serialResult.error);

    const bookingId = generateBookingID();

    const doctorResult = await getDoctorById(appointmentData.doctor_id);
    if (!doctorResult.success) throw new Error(doctorResult.error);

    const estimatedTime = calculateEstimatedTime(
      doctorResult.data.start_time,
      serialResult.serial
    );

    const appointment = {
      booking_id: bookingId,
      doctor_id: appointmentData.doctor_id,
      appointment_date: appointmentData.appointment_date,
      serial_number: serialResult.serial,
      estimated_time: estimatedTime,
      status: APP_CONSTANTS.APPOINTMENT_STATUS.BOOKED,
      patient_notes: appointmentData.notes || null,
      coupon_code: appointmentData.coupon_code || null,
    };

    if (user) {
      appointment.patient_id = user.id;
    } else {
      appointment.guest_name = appointmentData.guest_name;
      appointment.guest_phone = appointmentData.guest_phone;
      appointment.guest_email = appointmentData.guest_email || null;
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: { ...data, doctor: doctorResult.data },
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   GET APPOINTMENT BY BOOKING ID
========================= */
async function getAppointmentByBookingId(bookingId) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `*, doctor:doctors(name, specialization, consultation_fee)`
      )
      .eq("booking_id", bookingId.toUpperCase())
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   CANCEL APPOINTMENT
========================= */
async function cancelAppointment(appointmentId, reason) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: APP_CONSTANTS.APPOINTMENT_STATUS.CANCELLED,
        cancellation_reason: reason,
      })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   GET USER APPOINTMENTS
========================= */
async function getUserAppointments(userId, status = null) {
  try {
    let query = supabase
      .from("appointments")
      .select(
        `*, doctor:doctors(name, specialization, image_url)`
      )
      .eq("patient_id", userId)
      .order("appointment_date", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   EXPORT
========================= */
window.booking = {
  getAvailableDoctors,
  getAvailableTests,
  getDoctorById,
  getNextSerialNumber,
  createAppointment,
  getAppointmentByBookingId,
  cancelAppointment,
  getUserAppointments,
  calculateEstimatedTime,
};
