(async function () {
  const allowed = await auth.requireAuth(['admin']);
  if (!allowed) return;

  loadSidebar();
  loadDoctors();
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
      <a class="sidebar-nav-item active" href="/dashboards/admin/doctors.html">
        <i class="fas fa-user-md"></i> Doctors
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/tests.html">
        <i class="fas fa-vials"></i> Tests
      </a>
      <a class="sidebar-nav-item" href="/dashboards/admin/appointments.html">
        <i class="fas fa-calendar-check"></i> Appointments
      </a>
    </nav>
  `;
}

async function loadDoctors() {
  const container = document.getElementById('doctorsTable');
  loader.showSectionLoader(container);

  const { data, error } = await supabaseClient
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: false });

  loader.hideSectionLoader(container);

  if (error) {
    toast.error('Failed to load doctors');
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-muted">No doctors found</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Fee</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${data.map(renderDoctorRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderDoctorRow(doctor) {
  return `
    <tr>
      <td>${helpers.sanitizeHTML(doctor.name)}</td>
      <td>${doctor.specialization}</td>
      <td>${helpers.formatCurrency(doctor.consultation_fee)}</td>
      <td>
        <span class="badge ${doctor.is_active ? 'bg-success' : 'bg-danger'}">
          ${doctor.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary"
          onclick="toggleDoctor('${doctor.id}', ${doctor.is_active})">
          ${doctor.is_active ? 'Disable' : 'Enable'}
        </button>
      </td>
    </tr>
  `;
}

async function toggleDoctor(id, currentState) {
  const confirm = window.confirm(
    currentState ? 'Disable this doctor?' : 'Enable this doctor?'
  );
  if (!confirm) return;

  const { error } = await supabaseClient
    .from('doctors')
    .update({ is_active: !currentState })
    .eq('id', id);

  if (error) {
    toast.error('Action failed');
    return;
  }

  toast.success('Doctor updated');
  loadDoctors();
}
