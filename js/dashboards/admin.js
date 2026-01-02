// Admin Dashboard Functions

// Initialize admin dashboard
async function initAdminDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  const profile = await getUserRole();
  if (profile.role !== 'admin') {
    window.location.href = '/index.html';
    return;
  }

  // Load dashboard data
  loadAdminStats();
  loadRecentAppointments();
  loadAnalytics();
}

// Load admin statistics
async function loadAdminStats() {
  const statsContainer = document.getElementById('adminStats');
  if (!statsContainer) return;

  loader.showSectionLoader(statsContainer);

  try {
    // Get all stats in parallel
    const [todayResult, patientsResult, doctorsResult, revenueResult] = await Promise.all([
      analytics.getTodayAppointments(),
      analytics.getTotalPatients(),
      analytics.getActiveDoctors(),
      analytics.getRevenueData(dateUtils.getDateAfterDays(-30), dateUtils.getTodayDate())
    ]);

    const stats = {
      today_appointments: todayResult.count || 0,
      total_patients: patientsResult.count || 0,
      active_doctors: doctorsResult.count || 0,
      monthly_revenue: revenueResult.revenue || 0
    };

    displayAdminStats(stats, statsContainer);
  } catch (error) {
    console.error('Error loading stats:', error);
    toast.error('Failed to load statistics');
  } finally {
    loader.hideSectionLoader(statsContainer);
  }
}

// Display admin stats
function displayAdminStats(stats, container) {
  container.innerHTML = `
    <div class="row g-4">
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.today_appointments}</h3>
            <p>Today's Appointments</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-success">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.total_patients}</h3>
            <p>Total Patients</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-info">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.active_doctors}</h3>
            <p>Active Doctors</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-warning">
            <i class="fas fa-rupee-sign"></i>
          </div>
          <div class="stat-content">
            <h3>${helpers.formatCurrency(stats.monthly_revenue)}</h3>
            <p>Monthly Revenue</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Load recent appointments
async function loadRecentAppointments() {
  const container = document.getElementById('recentAppointments');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        doctor:doctors(name),
        patient:profiles(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    displayRecentAppointments(data, container);
  } catch (error) {
    console.error('Error loading appointments:', error);
    container.innerHTML = '<p class="text-danger">Failed to load appointments</p>';
  } finally {
    loader.hideSectionLoader(container);
  }
}

// Display recent appointments
function displayRecentAppointments(appointments, container) {
  if (!appointments || appointments.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No appointments yet</p></div>';
    return;
  }

  let html = '<div class="table-responsive"><table class="table">';
  html += `
    <thead>
      <tr>
        <th>Booking ID</th>
        <th>Patient</th>
        <th>Doctor</th>
        <th>Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  `;

  appointments.forEach(appointment => {
    const patientName = appointment.patient?.full_name || appointment.guest_name || 'N/A';
    const statusClass = {
      'booked': 'warning',
      'checked_in': 'info',
      'completed': 'success',
      'cancelled': 'danger'
    }[appointment.status] || 'secondary';

    html += `
      <tr>
        <td><code>${appointment.booking_id}</code></td>
        <td>${patientName}</td>
        <td>${appointment.doctor?.name}</td>
        <td>${dateUtils.formatDisplayDate(appointment.appointment_date)}</td>
        <td><span class="badge bg-${statusClass}">${appointment.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" 
                  onclick="window.adminDashboard.viewAppointment('${appointment.id}')">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// Load analytics charts
async function loadAnalytics() {
  try {
    const startDate = dateUtils.getDateAfterDays(-30);
    const endDate = dateUtils.getTodayDate();

    // Load appointment stats
    const statsResult = await analytics.getAppointmentStats(startDate, endDate);
    if (statsResult.success && document.getElementById('statusChart')) {
      analytics.createStatusChart('statusChart', statsResult.stats);
    }

    // Load revenue chart
    const revenueResult = await analytics.getRevenueByDate(startDate, endDate);
    if (revenueResult.success && document.getElementById('revenueChart')) {
      analytics.createRevenueChart('revenueChart', revenueResult);
    }

    // Load appointments chart
    const appointmentsResult = await analytics.getAppointmentsByDate(startDate, endDate);
    if (appointmentsResult.success && document.getElementById('appointmentsChart')) {
      analytics.createAppointmentsChart('appointmentsChart', appointmentsResult);
    }

    // Load top doctors
    const doctorsResult = await analytics.getPopularDoctors(5);
    if (doctorsResult.success && document.getElementById('topDoctorsChart')) {
      analytics.createTopDoctorsChart('topDoctorsChart', doctorsResult.doctors);
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

// View appointment details
async function viewAppointment(appointmentId) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        doctor:doctors(name, specialization, consultation_fee),
        patient:profiles(full_name, phone, email)
      `)
      .eq('id', appointmentId)
      .single();

    if (error) throw error;

    const patientName = data.patient?.full_name || data.guest_name || 'N/A';
    const patientPhone = data.patient?.phone || data.guest_phone || 'N/A';
    const patientEmail = data.patient?.email || data.guest_email || 'N/A';

    const content = `
      <div class="appointment-details">
        <div class="row g-3">
          <div class="col-md-6">
            <label>Booking ID:</label>
            <p><strong>${data.booking_id}</strong></p>
          </div>
          <div class="col-md-6">
            <label>Serial Number:</label>
            <p><strong>#${data.serial_number}</strong></p>
          </div>
          <div class="col-md-6">
            <label>Patient Name:</label>
            <p>${patientName}</p>
          </div>
          <div class="col-md-6">
            <label>Phone:</label>
            <p>${patientPhone}</p>
          </div>
          <div class="col-md-6">
            <label>Email:</label>
            <p>${patientEmail}</p>
          </div>
          <div class="col-md-6">
            <label>Doctor:</label>
            <p>${data.doctor?.name} (${data.doctor?.specialization})</p>
          </div>
          <div class="col-md-6">
            <label>Date:</label>
            <p>${dateUtils.formatDisplayDate(data.appointment_date)}</p>
          </div>
          <div class="col-md-6">
            <label>Time:</label>
            <p>${helpers.formatTime(data.estimated_time)}</p>
          </div>
          <div class="col-md-6">
            <label>Status:</label>
            <p><span class="badge bg-primary">${data.status}</span></p>
          </div>
          <div class="col-md-6">
            <label>Consultation Fee:</label>
            <p>${helpers.formatCurrency(data.doctor?.consultation_fee || 0)}</p>
          </div>
          ${data.patient_notes ? `
          <div class="col-12">
            <label>Patient Notes:</label>
            <p>${data.patient_notes}</p>
          </div>
          ` : ''}
          ${data.coupon_code ? `
          <div class="col-md-6">
            <label>Coupon Used:</label>
            <p><code>${data.coupon_code}</code></p>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    modal.showModal({
      title: 'Appointment Details',
      content: content,
      size: 'large',
      buttons: [
        {
          id: 'closeBtn',
          text: 'Close',
          type: 'secondary'
        }
      ]
    });
  } catch (error) {
    console.error('Error loading appointment:', error);
    toast.error('Failed to load appointment details');
  }
}

// Manage doctors
async function loadDoctors() {
  const container = document.getElementById('doctorsTable');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const { data, error } = await supabaseClient
      .from('doctors')
      .select('*')
      .order('name');

    if (error) throw error;

    displayDoctorsTable(data, container);
  } catch (error) {
    console.error('Error loading doctors:', error);
    container.innerHTML = '<p class="text-danger">Failed to load doctors</p>';
  } finally {
    loader.hideSectionLoader(container);
  }
}

// Display doctors table
function displayDoctorsTable(doctors, container) {
  if (!doctors || doctors.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No doctors yet</p></div>';
    return;
  }

  let html = '<div class="table-responsive"><table class="table">';
  html += `
    <thead>
      <tr>
        <th>Name</th>
        <th>Specialization</th>
        <th>Fee</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  `;

  doctors.forEach(doctor => {
    html += `
      <tr>
        <td>${doctor.name}</td>
        <td>${doctor.specialization}</td>
        <td>${helpers.formatCurrency(doctor.consultation_fee)}</td>
        <td>
          <span class="badge bg-${doctor.is_active ? 'success' : 'danger'}">
            ${doctor.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <a href="/dashboards/admin/add-doctor.html?id=${doctor.id}" 
             class="btn btn-sm btn-outline-primary">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-outline-${doctor.is_active ? 'danger' : 'success'}" 
                  onclick="window.adminDashboard.toggleDoctorStatus('${doctor.id}', ${!doctor.is_active})">
            <i class="fas fa-${doctor.is_active ? 'ban' : 'check'}"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// Toggle doctor active status
async function toggleDoctorStatus(doctorId, newStatus) {
  try {
    const { error } = await supabaseClient
      .from('doctors')
      .update({ is_active: newStatus })
      .eq('id', doctorId);

    if (error) throw error;

    toast.success(`Doctor ${newStatus ? 'activated' : 'deactivated'} successfully`);
    loadDoctors();
  } catch (error) {
    console.error('Error updating doctor:', error);
    toast.error('Failed to update doctor status');
  }
}

// Save doctor
async function saveDoctor(doctorData, doctorId = null) {
  const saveBtn = document.getElementById('saveDoctorBtn');
  if (saveBtn) loader.showButtonLoader(saveBtn);

  try {
    if (doctorId) {
      // Update existing
      const { error } = await supabaseClient
        .from('doctors')
        .update(doctorData)
        .eq('id', doctorId);

      if (error) throw error;
      toast.success('Doctor updated successfully');
    } else {
      // Create new
      const { error } = await supabaseClient
        .from('doctors')
        .insert([doctorData]);

      if (error) throw error;
      toast.success('Doctor added successfully');
    }

    setTimeout(() => {
      window.location.href = '/dashboards/admin/doctors.html';
    }, 1500);
  } catch (error) {
    console.error('Error saving doctor:', error);
    toast.error('Failed to save doctor');
  } finally {
    if (saveBtn) loader.hideButtonLoader(saveBtn);
  }
}

// Manage tests
async function loadTests() {
  const container = document.getElementById('testsTable');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const { data, error } = await supabaseClient
      .from('tests')
      .select('*')
      .order('name');

    if (error) throw error;

    displayTestsTable(data, container);
  } catch (error) {
    console.error('Error loading tests:', error);
    container.innerHTML = '<p class="text-danger">Failed to load tests</p>';
  } finally {
    loader.hideSectionLoader(container);
  }
}

// Display tests table
function displayTestsTable(tests, container) {
  if (!tests || tests.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No tests yet</p></div>';
    return;
  }

  let html = '<div class="table-responsive"><table class="table">';
  html += `
    <thead>
      <tr>
        <th>Name</th>
        <th>Original Price</th>
        <th>Discount Price</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  `;

  tests.forEach(test => {
    html += `
      <tr>
        <td>${test.name}</td>
        <td>${helpers.formatCurrency(test.original_price)}</td>
        <td>
          ${test.is_discount_active && test.discount_price 
            ? helpers.formatCurrency(test.discount_price) 
            : '-'}
        </td>
        <td>
          <span class="badge bg-${test.is_active ? 'success' : 'danger'}">
            ${test.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <a href="/dashboards/admin/add-test.html?id=${test.id}" 
             class="btn btn-sm btn-outline-primary">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-sm btn-outline-${test.is_active ? 'danger' : 'success'}" 
                  onclick="window.adminDashboard.toggleTestStatus('${test.id}', ${!test.is_active})">
            <i class="fas fa-${test.is_active ? 'ban' : 'check'}"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// Toggle test status
async function toggleTestStatus(testId, newStatus) {
  try {
    const { error } = await supabaseClient
      .from('tests')
      .update({ is_active: newStatus })
      .eq('id', testId);

    if (error) throw error;

    toast.success(`Test ${newStatus ? 'activated' : 'deactivated'} successfully`);
    loadTests();
  } catch (error) {
    console.error('Error updating test:', error);
    toast.error('Failed to update test status');
  }
}

// Save test
async function saveTest(testData, testId = null) {
  const saveBtn = document.getElementById('saveTestBtn');
  if (saveBtn) loader.showButtonLoader(saveBtn);

  try {
    if (testId) {
      const { error } = await supabaseClient
        .from('tests')
        .update(testData)
        .eq('id', testId);

      if (error) throw error;
      toast.success('Test updated successfully');
    } else {
      const { error } = await supabaseClient
        .from('tests')
        .insert([testData]);

      if (error) throw error;
      toast.success('Test added successfully');
    }

    setTimeout(() => {
      window.location.href = '/dashboards/admin/tests.html';
    }, 1500);
  } catch (error) {
    console.error('Error saving test:', error);
    toast.error('Failed to save test');
  } finally {
    if (saveBtn) loader.hideButtonLoader(saveBtn);
  }
}

// Manage coupons
async function loadCoupons() {
  const container = document.getElementById('couponsTable');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const { data, error } = await supabaseClient
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    displayCouponsTable(data, container);
  } catch (error) {
    console.error('Error loading coupons:', error);
    container.innerHTML = '<p class="text-danger">Failed to load coupons</p>';
  } finally {
    loader.hideSectionLoader(container);
  }
}

// Display coupons table
function displayCouponsTable(coupons, container) {
  if (!coupons || coupons.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No coupons yet</p></div>';
    return;
  }

  let html = '<div class="table-responsive"><table class="table">';
  html += `
    <thead>
      <tr>
        <th>Code</th>
        <th>Discount</th>
        <th>Expires</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  `;

  coupons.forEach(coupon => {
    const discount = coupon.discount_type === 'percent' 
      ? `${coupon.discount_value}%` 
      : helpers.formatCurrency(coupon.discount_value);

    html += `
      <tr>
        <td><code>${coupon.code}</code></td>
        <td>${discount}</td>
        <td>${coupon.expires_at ? dateUtils.formatDisplayDate(coupon.expires_at) : 'No Expiry'}</td>
        <td>
          <span class="badge bg-${coupon.is_active ? 'success' : 'danger'}">
            ${coupon.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-${coupon.is_active ? 'danger' : 'success'}" 
                  onclick="window.adminDashboard.toggleCouponStatus('${coupon.id}', ${!coupon.is_active})">
            <i class="fas fa-${coupon.is_active ? 'ban' : 'check'}"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="window.adminDashboard.deleteCoupon('${coupon.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// Toggle coupon status
async function toggleCouponStatus(couponId, newStatus) {
  try {
    const { error } = await supabaseClient
      .from('coupons')
      .update({ is_active: newStatus })
      .eq('id', couponId);

    if (error) throw error;

    toast.success(`Coupon ${newStatus ? 'activated' : 'deactivated'} successfully`);
    loadCoupons();
  } catch (error) {
    console.error('Error updating coupon:', error);
    toast.error('Failed to update coupon status');
  }
}

// Delete coupon
async function deleteCoupon(couponId) {
  const confirmed = await new Promise((resolve) => {
    modal.showConfirm(
      'Delete Coupon',
      'Are you sure you want to delete this coupon?',
      () => resolve(true),
      () => resolve(false)
    );
  });

  if (!confirmed) return;

  try {
    const { error } = await supabaseClient
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (error) throw error;

    toast.success('Coupon deleted successfully');
    loadCoupons();
  } catch (error) {
    console.error('Error deleting coupon:', error);
    toast.error('Failed to delete coupon');
  }
}

// Save coupon
async function saveCoupon(couponData) {
  const saveBtn = document.getElementById('saveCouponBtn');
  if (saveBtn) loader.showButtonLoader(saveBtn);

  try {
    const { error } = await supabaseClient
      .from('coupons')
      .insert([couponData]);

    if (error) throw error;

    toast.success('Coupon created successfully');
    
    setTimeout(() => {
      window.location.href = '/dashboards/admin/coupons.html';
    }, 1500);
  } catch (error) {
    console.error('Error saving coupon:', error);
    toast.error('Failed to create coupon');
  } finally {
    if (saveBtn) loader.hideButtonLoader(saveBtn);
  }
}

// Export
window.adminDashboard = {
  initAdminDashboard,
  viewAppointment,
  loadDoctors,
  toggleDoctorStatus,
  saveDoctor,
  loadTests,
  toggleTestStatus,
  saveTest,
  loadCoupons,
  toggleCouponStatus,
  deleteCoupon,
  saveCoupon
};