(async function () {
  const ok = await auth.requireAuth(['patient']);
  if (!ok) return;

  loadSidebar();
  loadStats();
})();

function loadSidebar() {
  document.getElementById('patientSidebar').innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-user"></i> Patient
      </div>
    </div>

    <nav class="sidebar-nav">
      <a class="sidebar-nav-item active" href="/dashboards/patient/index.html">
        <i class="fas fa-home"></i> Dashboard
      </a>
      <a class="sidebar-nav-item" href="/dashboards/patient/appointments.html">
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

async function loadStats() {
  const user = await getCurrentUser();
  if (!user) return;

  const [{ count: total },
         { count: completed },
         { count: reports }] = await Promise.all([
    supabaseClient
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),

    supabaseClient
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed'),

    supabaseClient
      .from('reports')
      .select('*', { count: 'exact', head: true })
  ]);

  document.getElementById('totalAppointments').textContent = total || 0;
  document.getElementById('completedAppointments').textContent = completed || 0;
  document.getElementById('totalReports').textContent = reports || 0;
}
