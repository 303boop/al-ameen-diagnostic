(async function () {
  const ok = await auth.requireAuth(['admin']);
  if (!ok) return;

  loadSidebar();
  loadStats();
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
      <a class="sidebar-nav-item active" href="/dashboards/admin/analytics.html">
        <i class="fas fa-chart-pie"></i> Analytics
      </a>
    </nav>
  `;
}

async function loadStats() {
  const [{ count: totalAppointments },
         { count: completedAppointments },
         { count: totalPatients },
         { count: totalReports }] = await Promise.all([
    supabaseClient.from('appointments').select('*', { count: 'exact', head: true }),
    supabaseClient.from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed'),
    supabaseClient.from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient'),
    supabaseClient.from('reports')
      .select('*', { count: 'exact', head: true })
  ]);

  totalAppointmentsEl().textContent = totalAppointments || 0;
  completedAppointmentsEl().textContent = completedAppointments || 0;
  totalPatientsEl().textContent = totalPatients || 0;
  totalReportsEl().textContent = totalReports || 0;

  loadStatusChart();
}

function totalAppointmentsEl() { return document.getElementById('totalAppointments'); }
function completedAppointmentsEl() { return document.getElementById('completedAppointments'); }
function totalPatientsEl() { return document.getElementById('totalPatients'); }
function totalReportsEl() { return document.getElementById('totalReports'); }

async function loadStatusChart() {
  const { data } = await supabaseClient
    .from('appointments')
    .select('status');

  const counts = data.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(counts), 1);

  document.getElementById('statusChart').innerHTML =
    Object.entries(counts).map(([status, value]) => `
      <div class="mb-2">
        <small>${status.toUpperCase()}</small>
        <div style="
          background: var(--light-gray);
          border-radius: 6px;
          overflow: hidden;
        ">
          <div style="
            width: ${(value / max) * 100}%;
            background: var(--primary);
            color: #fff;
            padding: 6px;
            font-size: 12px;
          ">
            ${value}
          </div>
        </div>
      </div>
    `).join('');
}
