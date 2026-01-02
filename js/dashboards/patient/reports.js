(async function () {
  const ok = await auth.requireAuth(['patient']);
  if (!ok) return;

  loadSidebar();
  loadReports();
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
      <a class="sidebar-nav-item" href="/dashboards/patient/appointments.html">
        <i class="fas fa-calendar-check"></i> Appointments
      </a>
      <a class="sidebar-nav-item active" href="/dashboards/patient/reports.html">
        <i class="fas fa-file-medical"></i> Reports
      </a>
      <a class="sidebar-nav-item" href="/dashboards/patient/profile.html">
        <i class="fas fa-user-cog"></i> Profile
      </a>
    </nav>
  `;
}

async function loadReports() {
  const user = await getCurrentUser();
  if (!user) return;

  const container = document.getElementById('reportsList');
  container.innerHTML = loader.createSkeletonLoader('card', 3);

  const { data, error } = await supabaseClient
    .from('reports')
    .select(`
      id,
      file_name,
      file_path,
      report_type,
      created_at,
      appointments ( booking_id )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    toast.error('Failed to load reports');
    container.innerHTML = '';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="text-muted">No reports available yet.</p>`;
    return;
  }

  container.innerHTML = data.map(renderReport).join('');
}

function renderReport(r) {
  return `
    <div class="dashboard-card report-card">
      <div class="dashboard-card-body">

        <div class="report-header">
          <strong>${r.file_name}</strong>
          <span class="badge badge-info">${r.report_type.replace('_', ' ')}</span>
        </div>

        <div class="report-meta">
          <p><i class="fas fa-id-card"></i> ${r.appointments?.booking_id || ''}</p>
          <p><i class="fas fa-calendar"></i> ${helpers.formatDate(r.created_at)}</p>
        </div>

        <div class="report-actions">
          <button class="btn btn-outline-primary btn-sm"
            onclick="downloadReport('${r.file_path}', '${r.file_name}')">
            <i class="fas fa-download"></i> Download
          </button>
        </div>

      </div>
    </div>
  `;
}

async function downloadReport(path, filename) {
  try {
    const { data, error } = await supabaseClient
      .storage
      .from(APP_CONSTANTS.STORAGE_BUCKETS.REPORTS)
      .download(path);

    if (error) throw error;

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    toast.error('Download failed');
  }
}
