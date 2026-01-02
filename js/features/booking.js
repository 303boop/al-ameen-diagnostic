// Booking Management

// Get available doctors
async function getAvailableDoctors() {
  try {
    const { data, error } = await supabaseClient
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return { success: false, error: error.message };
  }
}

// Get available tests
async function getAvailableTests() {
  try {
    const { data, error } = await supabaseClient
      .from('tests')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching tests:', error);
    return { success: false, error: error.message };
  }
}

// Get doctor by ID
async function getDoctorById(doctorId) {
  try {
    const { data, error } = await supabaseClient
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return { success: false, error: error.message };
  }
}

// Get next serial number for doctor on specific date
async function getNextSerialNumber(doctorId, appointmentDate) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select('serial_number')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', appointmentDate)
      .order('serial_number', { ascending: false })
      .limit(1);

    if (error) throw error;

    const nextSerial = data.length > 0 ? data[0].serial_number + 1 : 1;
    return { success: true, serial: nextSerial };
  } catch (error) {
    console.error('Error getting serial:', error);
    return { success: false, error: error.message };
  }
}

// Calculate estimated time
function calculateEstimatedTime(startTime, serialNumber, avgConsultationTime = 15) {
  const [hours, minutes] = startTime.split(':');
  const start = new Date();
  start.setHours(parseInt(hours), parseInt(minutes), 0);
  
  // Add time based on serial number
  const waitTime = (serialNumber - 1) * avgConsultationTime;
  start.setMinutes(start.getMinutes() + waitTime);
  
  return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
}

// Create appointment (logged in user)
async function createAppointment(appointmentData) {
  try {
    const user = await getCurrentUser();
    if (!user && !appointmentData.guest_name) {
      throw new Error('User must be logged in or provide guest details');
    }

    // Get next serial number
    const serialResult = await getNextSerialNumber(
      appointmentData.doctor_id,
      appointmentData.appointment_date
    );

    if (!serialResult.success) throw new Error(serialResult.error);

    // Generate booking ID
    const bookingId = helpers.generateBookingID();

    // Get doctor details for estimated time
    const doctorResult = await getDoctorById(appointmentData.doctor_id);
    if (!doctorResult.success) throw new Error(doctorResult.error);

    const estimatedTime = calculateEstimatedTime(
      doctorResult.data.start_time,
      serialResult.serial
    );

    // Prepare appointment data
    const appointment = {
      booking_id: bookingId,
      doctor_id: appointmentData.doctor_id,
      appointment_date: appointmentData.appointment_date,
      serial_number: serialResult.serial,
      estimated_time: estimatedTime,
      patient_notes: appointmentData.notes || null,
      coupon_code: appointmentData.coupon_code || null,
      status: 'booked'
    };

    // Add user or guest info
    if (user) {
      appointment.patient_id = user.id;
    } else {
      appointment.guest_name = appointmentData.guest_name;
      appointment.guest_phone = appointmentData.guest_phone;
      appointment.guest_email = appointmentData.guest_email || null;
    }

    // Insert appointment
    const { data, error } = await supabaseClient
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;

    // Create notification
    if (user) {
      await supabaseClient
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'booking_confirmed',
          message: `Your appointment is confirmed. Booking ID: ${bookingId}, Serial: ${serialResult.serial}`
        }]);
    }

    return { 
      success: true, 
      data: {
        ...data,
        doctor: doctorResult.data
      }
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error: error.message };
  }
}

// Get appointment by booking ID
async function getAppointmentByBookingId(bookingId) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        doctor:doctors(name, specialization, consultation_fee)
      `)
      .eq('booking_id', bookingId.toUpperCase())
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return { success: false, error: error.message };
  }
}

// Cancel appointment
async function cancelAppointment(appointmentId, reason) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, error: error.message };
  }
}

// Get user appointments
async function getUserAppointments(userId, status = null) {
  try {
    let query = supabaseClient
      .from('appointments')
      .select(`
        *,
        doctor:doctors(name, specialization, image_url)
      `)
      .eq('patient_id', userId)
      .order('appointment_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: error.message };
  }
}

// Export
window.booking = {
  getAvailableDoctors,
  getAvailableTests,
  getDoctorById,
  getNextSerialNumber,
  createAppointment,
  getAppointmentByBookingId,
  cancelAppointment,
  getUserAppointments,
  calculateEstimatedTime
};