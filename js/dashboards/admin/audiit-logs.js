(async function () {
  const ok = await auth.requireAuth(['admin']);
  if (!ok) return;

  loadSidebar();
  loadLogs();
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
      <a class="sidebar-nav-item active" href="/dashboards/admin/audit-logs.html">
        <i class="fas fa-shield-alt"></i> Audit Logs
      </a>
    </nav>
  `;
}

async function loadLogs() {
  const container = document.getElementById('auditTable');
  loader.showSectionLoader(container);

  const { data, error } = await supabaseClient
    .from('audit_logs')
    .select(`
      id,
      action,
      entity,
      created_at,
      profiles ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  loader.hideSectionLoader(container);

  if (error) {
    toast.error('Failed to load audit logs');
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-muted">No logs found</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(renderRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderRow(l) {
  return `
    <tr>
      <td>${helpers.sanitizeHTML(l.profiles?.full_name || 'System')}</td>
      <td>${l.action}</td>
      <td>${l.entity}</td>
      <td>${helpers.formatDate(l.created_at)} ${helpers.formatTime(l.created_at.split('T')[1])}</td>
    </tr>
  `;
}
