(async function () {
  const ok = await auth.requireAuth(['lab']);
  if (!ok) return;

  loadSidebar();
  loadStats();
})();

function loadSidebar() {
  document.getElementById('labSidebar').innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-flask"></i> Lab
      </div>
    </div>

    <nav class="sidebar-nav">
      <a class="sidebar-nav-item active" href="/dashboards/lab/index.html">
        <i class="fas fa-home"></i> Dashboard
      </a>
      <a class="sidebar-nav-item" href="/dashboards/lab/search-booking.html">
        <i class="fas fa-search"></i> Search Booking
      </a>
      <a class="sidebar-nav-item" href="/dashboards/lab/appointments.html">
        <i class="fas fa-calendar-day"></i> Appointments
      </a>
    </nav>
  `;
}

async function loadStats() {
  const today = new Date().toISOString().split('T')[0];

  const [{ count: total },
         { count: completed }] = await Promise.all([
    supabaseClient
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', today),

    supabaseClient
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', today)
      .eq('status', 'completed')
  ]);

  document.getElementById('todayCount').textContent = total || 0;
  document.getElementById('completedCount').textContent = completed || 0;
  document.getElementById('pendingCount').textContent =
    (total || 0) - (completed || 0);
}
