// Lab Dashboard Functions

// Initialize lab dashboard
async function initLabDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  const profile = await getUserRole();
  if (profile.role !== 'lab') {
    window.location.href = '/index.html';
    return;
  }

  // Load dashboard data
  loadLabStats();
  loadTodayAppointments();
}

// Load lab statistics
async function loadLabStats() {
  const statsContainer = document.getElementById('labStats');
  if (!statsContainer) return;

  loader.showSectionLoader(statsContainer);

  try {
    const today = dateUtils.getTodayDate();
    
    // Today's appointments
    const { data: todayAppointments } = await supabaseClient
      .from('appointments')
      .select('*')
      .eq('appointment_date', today);

    // Pending reports (appointments completed but no report uploaded)
    const { data: completedNoReport } = await supabaseClient
      .from('appointments')
      .select(`
        id,
        reports(id)
      `)
      .eq('status', 'completed')
      .is('reports.id', null);

    const stats = {
      today_total: todayAppointments?.length || 0,
      today_pending: todayAppointments?.filter(a => a.status === 'booked').length || 0,
      today_completed: todayAppointments?.filter(a => a.status === 'completed').length || 0,
      pending_reports: completedNoReport?.length || 0
    };

    displayLabStats(stats, statsContainer);
  } catch (error) {
    console.error('Error loading stats:', error);
    toast.error('Failed to load statistics');
  } finally {
    loader.hideSectionLoader(statsContainer);
  }
}

// Display lab stats
function displayLabStats(stats, container) {
  container.innerHTML = `
    <div class="row g-4">
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <i class="fas fa-calendar-day"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.today_total}</h3>
            <p>Today's Total</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-warning">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.today_pending}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-success">
            <i class="fas fa-check-double"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.today_completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="stat-icon bg-danger">
            <i class="fas fa-file-upload"></i>
          </div>
          <div class="stat-content">
            <h3>${stats.pending_reports}</h3>
            <p>Pending Reports</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Load today's appointments
async function loadTodayAppointments() {
  const container = document.getElementById('todayAppointments');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const today = dateUtils.getTodayDate();
    
    const { data, error } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        doctor:doctors(name, specialization),
        patient:profiles(full_name, phone)
      `)
      .eq('appointment_date', today)
      .order('serial_number');

    if (error) throw error;

    displayTodayAppointments(data, container);
  } catch (error) {
    console.error('Error loading appointments:', error);
    container.innerHTML = '<p class="text-danger">Failed to load appointments</p>';
  } finally {
    loader.hideSectionLoader(container);
  }
}

// Display today's appointments
function displayTodayAppointments(appointments, container) {
  if (!appointments || appointments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-check"></i>
        <p>No appointments for today</p>
      </div>
    `;
    return;
  }

  let html = '<div class="table-responsive"><table class="table">';
  html += `
    <thead>
      <tr>
        <th>Serial</th>
        <th>Booking ID</th>
        <th>Patient</th>
        <th>Doctor</th>
        <th>Time</th>
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
        <td><strong>#${appointment.serial_number}</strong></td>
        <td><code>${appointment.booking_id}</code></td>
        <td>${patientName}</td>
        <td>${appointment.doctor?.name}</td>
        <td>${helpers.formatTime(appointment.estimated_time)}</td>
        <td><span class="badge bg-${statusClass}">${appointment.status}</span></td>
        <td>
          ${appointment.status === 'booked' ? `
            <button class="btn btn-sm btn-success" 
                    onclick="window.labDashboard.updateStatus('${appointment.id}', 'checked_in')">
              Check In
            </button>
          ` : ''}
          ${appointment.status === 'checked_in' ? `
            <button class="btn btn-sm btn-primary" 
                    onclick="window.labDashboard.updateStatus('${appointment.id}', 'completed')">
              Complete
            </button>
          ` : ''}
          ${appointment.status === 'completed' ? `
            <a href="/dashboards/lab/upload-report.html?appointment=${appointment.id}" 
               class="btn btn-sm btn-info">
              Upload Report
            </a>
          ` : ''}
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// Search appointment by booking ID
async function searchByBookingId(bookingId) {
  if (!bookingId || bookingId.trim().length === 0) {
    toast.error('Please enter a booking ID');
    return;
  }

  loader.showPageLoader('Searching...');

  try {
    const result = await booking.getAppointmentByBookingId(bookingId.trim());

    if (!result.success) {
      toast.error('Booking not found');
      return;
    }

    displaySearchResult(result.data);
  } catch (error) {
    console.error('Error searching:', error);
    toast.error('Search failed');
  } finally {
    loader.hidePageLoader();
  }
}

// Display search result
function displaySearchResult(appointment) {
  const resultContainer = document.getElementById('searchResult');
  if (!resultContainer) return;

  const patientName = appointment.patient?.full_name || appointment.guest_name || 'N/A';
  const patientPhone = appointment.patient?.phone || appointment.guest_phone || 'N/A';

  resultContainer.innerHTML = `
    <div class="search-result-card">
      <div class="result-header">
        <h4>Appointment Found</h4>
        <span class="badge bg-${appointment.status === 'booked' ? 'warning' : 'success'}">
          ${appointment.status}
        </span>
      </div>
      <div class="result-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label>Booking ID:</label>
            <p><strong>${appointment.booking_id}</strong></p>
          </div>
          <div class="col-md-6">
            <label>Serial Number:</label>
            <p><strong>#${appointment.serial_number}</strong></p>
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
            <label>Doctor:</label>
            <p>${appointment.doctor?.name}</p>
          </div>
          <div class="col-md-6">
            <label>Date:</label>
            <p>${dateUtils.formatDisplayDate(appointment.appointment_date)}</p>
          </div>
          <div class="col-md-6">
            <label>Estimated Time:</label>
            <p>${helpers.formatTime(appointment.estimated_time)}</p>
          </div>
        </div>
      </div>
      <div class="result-actions">
        ${appointment.status === 'booked' ? `
          <button class="btn btn-success" 
                  onclick="window.labDashboard.updateStatus('${appointment.id}', 'checked_in')">
            Check In
          </button>
        ` : ''}
        ${appointment.status === 'checked_in' ? `
          <button class="btn btn-primary" 
                  onclick="window.labDashboard.updateStatus('${appointment.id}', 'completed')">
            Mark Complete
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// Update appointment status
async function updateStatus(appointmentId, newStatus) {
  loader.showPageLoader('Updating status...');

  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;

    toast.success(`Status updated to ${newStatus}`);
    
    // Reload data
    loadLabStats();
    loadTodayAppointments();
  } catch (error) {
    console.error('Error updating status:', error);
    toast.error('Failed to update status');
  } finally {
    loader.hidePageLoader();
  }
}

// Upload report
async function uploadReport(appointmentId, file, reportType, testId) {
  if (!file) {
    toast.error('Please select a file');
    return;
  }

  const user = await getCurrentUser();
  const uploadBtn = document.getElementById('uploadBtn');
  
  if (uploadBtn) loader.showButtonLoader(uploadBtn);

  try {
    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('reports')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabaseClient
      .storage
      .from('reports')
      .getPublicUrl(fileName);

    // Get appointment details for patient_id
    const { data: appointment } = await supabaseClient
      .from('appointments')
      .select('patient_id')
      .eq('id', appointmentId)
      .single();

    // Create report record
    const { data: reportData, error: reportError } = await supabaseClient
      .from('reports')
      .insert([{
        appointment_id: appointmentId,
        patient_id: appointment?.patient_id,
        file_url: urlData.publicUrl,
        file_type: file.type,
        report_type: reportType,
        test_id: testId || null,
        uploaded_by: user.id
      }])
      .select()
      .single();

    if (reportError) throw reportError;

    toast.success('Report uploaded successfully');
    
    // Redirect back
    setTimeout(() => {
      window.location.href = '/dashboards/lab/index.html';
    }, 1500);

  } catch (error) {
    console.error('Error uploading report:', error);
    toast.error('Failed to upload report');
  } finally {
    if (uploadBtn) loader.hideButtonLoader(uploadBtn);
  }
}

// Export
window.labDashboard = {
  initLabDashboard,
  searchByBookingId,
  updateStatus,
  uploadReport
};