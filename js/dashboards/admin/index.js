// =============================
// Admin Dashboard JS
// =============================
(async function () {
  const allowed = await auth.requireAuth(['admin']);
  if (!allowed) return;

  renderSidebar();
  loadStats();
  loadRecentAppointments();

  document.getElementById('refreshStats')?.addEventListener('click', loadStats);
})();

// -----------------------------
// Sidebar
// -----------------------------
function renderSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  if (!sidebar) return;

  const currentPage = location.pathname.split('/').pop();

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo"><i class="fas fa-hospital"></i> Admin</div>
    </div>
    <nav class="sidebar-nav">
      <a class="sidebar-nav-item ${currentPage==='index.html'?'active':''}" href="index.html"><i class="fas fa-chart-line"></i> Dashboard</a>
      <a class="sidebar-nav-item" href="doctors.html"><i class="fas fa-user-md"></i> Doctors</a>
      <a class="sidebar-nav-item" href="tests.html"><i class="fas fa-vials"></i> Tests</a>
      <a class="sidebar-nav-item" href="appointments.html"><i class="fas fa-calendar-check"></i> Appointments</a>
      <a class="sidebar-nav-item" href="reports.html"><i class="fas fa-file-medical"></i> Reports</a>
      <a class="sidebar-nav-item" href="coupons.html"><i class="fas fa-ticket"></i> Coupons</a>
      <a class="sidebar-nav-item" href="users.html"><i class="fas fa-users"></i> Users</a>
      <a class="sidebar-nav-item" href="audit-logs.html"><i class="fas fa-shield-alt"></i> Audit Logs</a>
      <a class="sidebar-nav-item" href="settings.html"><i class="fas fa-cog"></i> Settings</a>
      <a class="sidebar-nav-item" href="analytics.html"><i class="fas fa-chart-pie"></i> Analytics</a>
    </nav>
  `;
}

// -----------------------------
// Load Stats
// -----------------------------
async function loadStats() {
  const container = document.getElementById('statsGrid');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const appointments = await supabaseClient.from('appointments').select('id',{count:'exact',head:true});
    const patients = await supabaseClient.from('profiles').select('id',{count:'exact',head:true}).eq('role','patient');
    const doctors = await supabaseClient.from('doctors').select('id',{count:'exact',head:true}).eq('is_active',true);
    const revenueData = await supabaseClient.from('appointments').select('doctor:doctors(consultation_fee)').eq('status','completed');
    const revenue = revenueData.data?.reduce((sum,a)=>sum+(Number(a.doctor?.consultation_fee)||0),0)||0;

    container.innerHTML = `
      <div class="col-md-3">
        <div class="stat-card"><div class="stat-icon bg-primary"><i class="fas fa-calendar"></i></div>
          <div class="stat-content"><h3>${appointments.count||0}</h3><p>Total Appointments</p></div></div></div>
      <div class="col-md-3">
        <div class="stat-card"><div class="stat-icon bg-success"><i class="fas fa-user"></i></div>
          <div class="stat-content"><h3>${patients.count||0}</h3><p>Total Patients</p></div></div></div>
      <div class="col-md-3">
        <div class="stat-card"><div class="stat-icon bg-warning"><i class="fas fa-user-md"></i></div>
          <div class="stat-content"><h3>${doctors.count||0}</h3><p>Active Doctors</p></div></div></div>
      <div class="col-md-3">
        <div class="stat-card"><div class="stat-icon bg-info"><i class="fas fa-dollar-sign"></i></div>
          <div class="stat-content"><h3>$${revenue}</h3><p>Total Revenue</p></div></div></div>
    `;
  } catch(err) {
    toast.error('Failed to load stats');
  }

  loader.hideSectionLoader(container);
}

// -----------------------------
// Recent Appointments
// -----------------------------
async function loadRecentAppointments() {
  const container = document.getElementById('recentAppointments');
  if (!container) return;

  loader.showSectionLoader(container);

  try {
    const { data, error } = await supabaseClient.from('appointments')
      .select('booking_id, appointment_date, status, profiles(full_name)')
      .order('created_at',{ascending:false})
      .limit(5);

    if(error) throw error;

    if(!data.length) {
      container.innerHTML = `<p class="text-muted">No recent appointments</p>`;
      return;
    }

    container.innerHTML = data.map(a=>`
      <div class="appointment-card">
        <strong>${a.booking_id}</strong>
        <span>${helpers.formatDate(a.appointment_date)}</span>
        <span class="badge bg-primary">${a.status}</span>
      </div>
    `).join('');
  } catch(err) {
    toast.error('Failed to load appointments');
  }

  loader.hideSectionLoader(container);
}
