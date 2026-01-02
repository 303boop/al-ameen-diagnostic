(async function () {
  const ok = await auth.requireAuth(['lab']);
  if (!ok) return;

  loadSidebar();
  loadTodayAppointments();
})();

function loadSidebar() {
  document.getElementById('labSidebar').innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-flask"></i> Lab
      </div>
    </div>

    <nav class="sidebar-nav">
      <a class="sidebar-nav-item" href="/dashboards/lab/search-booking.html">
        <i class="fas fa-search"></i> Search Booking
      </a>
      <a class="sidebar-nav-item active" href="/dashboards/lab/appointments.html">
        <i class="fas fa-calendar-day"></i> Appointments
      </a>
      <a class="sidebar-nav-item" href="/dashboards/lab/upload-report.html">
        <i class="fas fa-file-upload"></i> Upload Report
      </a>
    </nav>
  `;
}

async function loadTodayAppointments() {
  const container = document.getElementById('appointmentsTable');
  loader.showSectionLoader(container);

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseClient
    .from('appointments')
    .select(`
      id,
      booking_id,
      serial_number,
      patient_name,
      status,
      doctors ( name )
    `)
    .eq('appointment_date', today)
    .order('serial_number');

  loader.hideSectionLoader(container);

  if (error) {
    toast.error('Failed to load appointments');
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-muted">No appointments today</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Booking ID</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${data.map(renderRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderRow(a) {
  return `
    <tr>
      <td>#${a.serial_number}</td>
      <td>${a.booking_id}</td>
      <td>${helpers.sanitizeHTML(a.patient_name || 'Guest')}</td>
      <td>${a.doctors?.name || '-'}</td>
      <td>
        <span class="badge ${statusClass(a.status)}">
          ${a.status}
        </span>
      </td>
      <td class="text-end">
        <a class="btn btn-sm btn-outline-primary"
          href="/dashboards/lab/upload-report.html?appointment=${a.id}">
          Upload
        </a>
      </td>
    </tr>
  `;
}

function statusClass(status) {
  return {
    booked: 'bg-primary',
    checked_in: 'bg-info',
    completed: 'bg-success',
    cancelled: 'bg-danger'
  }[status] || 'bg-secondary';
}
