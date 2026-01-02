(async function () {
  const allowed = await auth.requireAuth(['admin']);
  if (!allowed) return;

  loadSidebar();
  loadAppointments();

  document.getElementById('searchInput')
    .addEventListener('input', helpers.debounce(handleSearch, 400));
})();

function loadSidebar() {
  document.getElementById('adminSidebar').innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-hospital"></i> Admin
      </div>
    </div>

    <nav class="sidebar-nav">
      <a class="sidebar-nav-item" href="/dashboards/admin/index.html">
        <i class="fas fa-chart-line"></i> Dashboard
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/doctors.html">
        <i class="fas fa-user-md"></i> Doctors
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/tests.html">
        <i class="fas fa-vials"></i> Tests
      </a>
      <a class="sidebar-nav-item active" href="/dashboards/admin/appointments.html">
        <i class="fas fa-calendar-check"></i> Appointments
      </a>
    </nav>
  `;
}

async function loadAppointments(filter = '') {
  const container = document.getElementById('appointmentsTable');
  loader.showSectionLoader(container);

  let query = supabaseClient
    .from('appointments')
    .select(`
      id,
      booking_id,
      serial_number,
      appointment_date,
      status,
      patient_phone,
      patient_name,
      doctors ( name )
    `)
    .order('appointment_date', { ascending: false })
    .limit(100);

  if (filter) {
    query = query.or(
      `booking_id.ilike.%${filter}%,patient_phone.ilike.%${filter}%`
    );
  }

  const { data, error } = await query;

  loader.hideSectionLoader(container);

  if (error) {
    toast.error('Failed to load appointments');
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-muted">No appointments found</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Serial</th>
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
      <td><strong>${a.booking_id}</strong></td>
      <td>${helpers.sanitizeHTML(a.patient_name || 'Guest')}</td>
      <td>${a.doctors?.name || '-'}</td>
      <td>${helpers.formatDate(a.appointment_date)}</td>
      <td>#${a.serial_number}</td>
      <td>
        <span class="badge ${statusClass(a.status)}">
          ${a.status}
        </span>
      </td>
      <td class="text-end">
        ${statusActions(a)}
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

function statusActions(a) {
  if (a.status === 'completed' || a.status === 'cancelled') return '';

  return `
    <select class="form-control form-control-sm"
      onchange="updateStatus('${a.id}', this.value)">
      <option value="">Change</option>
      <option value="checked_in">Checked In</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  `;
}

async function updateStatus(id, status) {
  if (!status) return;

  const { error } = await supabaseClient
    .from('appointments')
    .update({ status })
    .eq('id', id);

  if (error) {
    toast.error('Status update failed');
    return;
  }

  toast.success('Status updated');
  loadAppointments(document.getElementById('searchInput').value.trim());
}

function handleSearch(e) {
  loadAppointments(e.target.value.trim());
}
