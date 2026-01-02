(async function () {
  // Auth guard
  const allowed = await auth.requireAuth(['admin']);
  if (!allowed) return;

  loadSidebar();
  loadStats();
  loadRecentAppointments();

  document.getElementById('refreshStats')
    .addEventListener('click', loadStats);
})();

function loadSidebar() {
  document.getElementById('adminSidebar').innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-hospital"></i> Admin
      </div>
    </div>
    <nav class="sidebar-nav">
      <a class="sidebar-nav-item active" href="/dashboards/admin/index.html">
        <i class="fas fa-chart-line"></i> Dashboard
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/doctors.html">
        <i class="fas fa-user-md"></i> Doctors
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/tests.html">
        <i class="fas fa-vials"></i> Tests
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/appointments.html">
        <i class="fas fa-calendar-check"></i> Appointments
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/reports.html">
        <i class="fas fa-file-medical"></i> Reports
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/coupons.html">
        <i class="fas fa-ticket"></i> Coupons
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/users.html">
        <i class="fas fa-users"></i> Users
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/audit-logs.html">
        <i class="fas fa-shield-alt"></i> Audit Logs
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/settings.html">
        <i class="fas fa-cog"></i> Settings
      </a>
    </nav>
  `;
}

async function loadStats() {
  loader.showSectionLoader(document.getElementById('statsGrid'));

  const { data, error } = await supabaseClient
    .from('appointments')
    .select('id', { count: 'exact', head: true });

  loader.hideSectionLoader(document.getElementById('statsGrid'));

  if (error) {
    toast.error('Failed to load stats');
    return;
  }

  document.getElementById('statsGrid').innerHTML = `
    <div class="col-md-3">
      <div class="stat-card">
        <div class="stat-icon bg-primary">
          <i class="fas fa-calendar"></i>
        </div>
        <div class="stat-content">
          <h3>${data?.length ?? 0}</h3>
          <p>Total Appointments</p>
        </div>
      </div>
    </div>
  `;
}

async function loadRecentAppointments() {
  loader.showSectionLoader(document.getElementById('recentAppointments'));

  const { data, error } = await supabaseClient
    .from('appointments')
    .select(`
      booking_id,
      appointment_date,
      status,
      profiles(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  loader.hideSectionLoader(document.getElementById('recentAppointments'));

  if (error) {
    toast.error('Failed to load appointments');
    return;
  }

  if (!data.length) {
    document.getElementById('recentAppointments').innerHTML =
      `<p class="text-muted">No recent appointments</p>`;
    return;
  }

  document.getElementById('recentAppointments').innerHTML = data.map(a => `
    <div class="appointment-card">
      <strong>${a.booking_id}</strong>
      <span>${helpers.formatDate(a.appointment_date)}</span>
      <span class="badge bg-primary">${a.status}</span>
    </div>
  `).join('');
}
