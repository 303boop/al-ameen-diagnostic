// Patient Dashboard Functions

// Initialize patient dashboard
async function initPatientDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  const profile = await getUserRole();
  if (profile.role !== 'patient') {
    window.location.href = '/index.html';
    return;
  }

  // Load dashboard data
  loadDashboardStats(user.id);
  loadUpcomingAppointments(user.id);
  loadRecentReports(user.id);
}

// Load dashboard statistics
async function loadDashboardStats(userId) {
  const statsContainer = document.getElementById('patientStats');
  if (!statsContainer) return;

  loader.showSectionLoader(statsContainer);

  try {
    // Get all appointments
    const { data: appointments } = await supabaseClient
      .from('appointments')
      .select('*')
      .eq('patient_id', userId);

    // Get reports count
    const { count: reportsCount } = await supabaseClient
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', userId);

    const stats = {
      total_appointments: appointments?.length || 0,
      upcoming: appointments?.filter(a => 
        new Date(a.appointment_date) >= new Date() && a.status === 'booked'
      ).length || 0,
      completed: appointments?.filter(a => a.status === 'completed').length || 0,
      reports: reportsCount || 0
    };

    displayPatientStats(stats, statsContainer);
  } catch (error) {
    console.error('Error loading stats:', error);
    toast.error('Failed to load statistics');
  } finally {
    loader.hideSectionLoader(statsContainer);
  }
}

// Display patient stats
function displayPatientStats(stats, container) {
  container.innerHTML = `
    <div class="row g-4">
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.total_appointments}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-warning">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.upcoming}</h3>
            <p>Upcoming</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-info">
            <i class="fas fa-file-medical"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.reports}</h3>
            <p>Reports</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Load upcoming appointments
async function loadUpcomingAppointments(userId) {
  const container = document.getElementById('upcomingAppointments');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const today = dateUtils.getTodayDate();
    
    const { data, error } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        doctor:doctors(name, specialization, image_url)
      `)
      .eq('patient_id', userId)
      .gte('appointment_date', today)
      .eq('status', 'booked')
      .order('appointment_date')
      .limit(5);

    if (error) throw error;

    displayUpcomingAppointments(data, container);
  } catch (error) {
    console.error('Error loading appointments:', error);
    container.innerHTML = '<p class="text-danger">Failed to load appointments</p>';
  } finally {
    loader.hideSectionLoader(container);
  }
}

// Display upcoming appointments
function displayUpcomingAppointments(appointments, container) {
  if (!appointments || appointments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <p>No upcoming appointments</p>
        <a href="/booking.html" class="btn btn-primary">Book Appointment</a>
      </div>
    `;
    return;
  }

  let html = '<div class="appointments-list">';
  
  appointments.forEach(appointment => {
    html += `
      <div class="appointment-card">
        <div class="appointment-doctor">
          <img src="${appointment.doctor.image_url || '/assets/images/doctors/placeholder.jpg'}" 
               alt="${appointment.doctor.name}">
          <div>
            <h4>${appointment.doctor.name}</h4>
            <p>${appointment.doctor.specialization}</p>
          </div>
        </div>
        <div class="appointment-details">
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>${dateUtils.formatDisplayDate(appointment.appointment_date)}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>${helpers.formatTime(appointment.estimated_time)}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-hashtag"></i>
            <span>Serial: ${appointment.serial_number}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-id-card"></i>
            <span>${appointment.booking_id}</span>
          </div>
        </div>
        <div class="appointment-actions">
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="window.patientDashboard.cancelAppointment('${appointment.id}')">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Load recent reports
async function loadRecentReports(userId) {
  const container = document.getElementById('recentReports');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const { data, error } = await supabaseClient
      .from('reports')
      .select(`
        *,
        appointment:appointments(booking_id),
        test:tests(name)
      `)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    displayRecentReports(data, container);
  } catch (error) {
    console.error('Error loading reports:', error);
    container.innerHTML = '<p class="text-danger">Failed to load reports</p>';
  } finally {
    loader.hideSectionLoader(container);
  }
}

// Display recent reports
function displayRecentReports(reports, container) {
  if (!reports || reports.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-file-medical-alt"></i>
        <p>No reports available</p>
      </div>
    `;
    return;
  }

  let html = '<div class="reports-list">';
  
  reports.forEach(report => {
    html += `
      <div class="report-card">
        <div class="report-icon">
          <i class="fas fa-file-pdf"></i>
        </div>
        <div class="report-info">
          <h4>${report.test?.name || 'Medical Report'}</h4>
          <p>Booking ID: ${report.appointment?.booking_id || 'N/A'}</p>
          <small>${dateUtils.getRelativeTime(report.created_at)}</small>
        </div>
        <div class="report-actions">
          <a href="${report.file_url}" 
             target="_blank" 
             class="btn btn-sm btn-primary">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
  const confirmed = await new Promise((resolve) => {
    modal.showConfirm(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      () => resolve(true),
      () => resolve(false)
    );
  });

  if (!confirmed) return;

  loader.showPageLoader('Cancelling appointment...');

  try {
    const result = await booking.cancelAppointment(appointmentId, 'Cancelled by patient');
    
    if (result.success) {
      toast.success('Appointment cancelled successfully');
      // Reload appointments
      const user = await getCurrentUser();
      loadUpcomingAppointments(user.id);
      loadDashboardStats(user.id);
    } else {
      toast.error(result.error || 'Failed to cancel appointment');
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    toast.error('Failed to cancel appointment');
  } finally {
    loader.hidePageLoader();
  }
}

// Export
window.patientDashboard = {
  initPatientDashboard,
  cancelAppointment
};