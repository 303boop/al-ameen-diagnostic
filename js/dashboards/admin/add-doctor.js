(async function () {
  const allowed = await auth.requireAuth(['admin']);
  if (!allowed) return;

  loadSidebar();

  document.getElementById('doctorForm')
    .addEventListener('submit', handleSubmit);
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
    </nav>
  `;
}

async function handleSubmit(e) {
  e.preventDefault();

  const payload = {
    name: document.getElementById('name').value.trim(),
    specialization: document.getElementById('specialization').value.trim(),
    consultation_fee: Number(document.getElementById('fee').value),
    bio: document.getElementById('bio').value.trim(),
    is_active: document.getElementById('isActive').value === 'true'
  };

  loader.showPageLoader('Saving doctor...');

  const { error } = await supabaseClient
    .from('doctors')
    .insert(payload);

  loader.hidePageLoader();

  if (error) {
    toast.error('Failed to add doctor');
    return;
  }

  toast.success('Doctor added successfully');
  window.location.href = '/dashboards/admin/doctors.html';
}
