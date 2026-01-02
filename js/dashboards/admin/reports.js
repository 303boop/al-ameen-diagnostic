(async function () {
  const ok = await auth.requireAuth(['admin']);
  if (!ok) return;

  loadSidebar();
  loadReports();
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
      <a class="sidebar-nav-item active" href="/dashboards/admin/reports.html">
        <i class="fas fa-file-medical"></i> Reports
      </a>
    </nav>
  `;
}

async function loadReports() {
  const container = document.getElementById('reportsTable');
  loader.showSectionLoader(container);

  const { data, error } = await supabaseClient
    .from('reports')
    .select(`
      id,
      file_path,
      report_type,
      created_at,
      appointments (
        booking_id,
        patient_name
      )
    `)
    .order('created_at', { ascending: false });

  loader.hideSectionLoader(container);

  if (error) {
    toast.error('Failed to load reports');
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-muted">No reports uploaded</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Patient</th>
            <th>Type</th>
            <th>Date</th>
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

function renderRow(r) {
  return `
    <tr>
      <td>${r.appointments?.booking_id || '—'}</td>
      <td>${helpers.sanitizeHTML(r.appointments?.patient_name || '—')}</td>
      <td>${r.report_type}</td>
      <td>${helpers.formatDate(r.created_at)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary"
          onclick="downloadReport('${r.file_path}')">
          Download
        </button>
      </td>
    </tr>
  `;
}

async function downloadReport(path) {
  const { data, error } = await supabaseClient
    .storage
    .from('reports')
    .download(path);

  if (error) {
    toast.error('Download failed');
    return;
  }

  const url = URL.createObjectURL(data);
  window.open(url, '_blank');
}
