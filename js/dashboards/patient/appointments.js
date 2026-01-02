(async function () {
  const ok = await auth.requireAuth(['patient']);
  if (!ok) return;

  loadSidebar();
  loadAppointments();
})();

function loadSidebar() {
  document.getElementById('patientSidebar').innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-user"></i> Patient
      </div>
    </div>

    <nav class="sidebar-nav">
      <a class="sidebar-nav-item" href="/dashboards/patient/index.html">
        <i class="fas fa-home"></i> Dashboard
      </a>
      <a class="sidebar-nav-item active" href="/dashboards/patient/appointments.html">
        <i class="fas fa-calendar-check"></i> Appointments
      </a>
      <a class="sidebar-nav-item" href="/dashboards/patient/reports.html">
        <i class="fas fa-file-medical"></i> Reports
      </a>
      <a class="sidebar-nav-item" href="/dashboards/patient/profile.html">
        <i class="fas fa-user-cog"></i> Profile
      </a>
    </nav>
  `;
}

async function loadAppointments() {
  const user = await getCurrentUser();
  if (!user) return;

  const list = document.getElementById('appointmentsList');
  list.innerHTML = loader.createSkeletonLoader('card', 3);

  const { data, error } = await supabaseClient
    .from('appointments')
    .select(`
      id,
      booking_id,
      appointment_date,
      estimated_time,
      status,
      doctors ( name, specialization )
    `)
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: false });

  if (error) {
    toast.error('Failed to load appointments');
    list.innerHTML = '';
    return;
  }

  if (!data || data.length === 0) {
    list.innerHTML = `<p class="text-muted">No appointments found.</p>`;
    return;
  }

  list.innerHTML = data.map(renderAppointment).join('');
}

function renderAppointment(a) {
  const statusClass = `status-${a.status}`;
  return `
    <div class="appointment-card">
      <div class="appointment-header">
        <strong>${a.doctors?.name || 'Doctor'}</strong>
        <span class="status-badge ${statusClass}">
          ${a.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div class="appointment-body">
        <p><i class="fas fa-id-card"></i> ${a.booking_id}</p>
        <p><i class="fas fa-calendar"></i> ${helpers.formatDate(a.appointment_date)}</p>
        <p><i class="fas fa-clock"></i> ${helpers.formatTime(a.estimated_time)}</p>
        <p><i class="fas fa-stethoscope"></i> ${a.doctors?.specialization || ''}</p>
      </div>
    </div>
  `;
}
