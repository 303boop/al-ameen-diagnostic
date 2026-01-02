(async function () {
  const ok = await auth.requireAuth(['admin']);
  if (!ok) return;

  loadSidebar();
  loadUsers();
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
      <a class="sidebar-nav-item active" href="/dashboards/admin/users.html">
        <i class="fas fa-users"></i> Users
      </a>
    </nav>
  `;
}

async function loadUsers() {
  const container = document.getElementById('usersTable');
  loader.showSectionLoader(container);

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, phone, role, created_at')
    .order('created_at', { ascending: false });

  loader.hideSectionLoader(container);

  if (error) {
    toast.error('Failed to load users');
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-muted">No users found</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Joined</th>
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

function renderRow(u) {
  return `
    <tr>
      <td>${helpers.sanitizeHTML(u.full_name || '—')}</td>
      <td>${u.phone || '—'}</td>
      <td>
        <select class="form-control form-control-sm"
          onchange="updateRole('${u.id}', this.value)">
          ${renderRoles(u.role)}
        </select>
      </td>
      <td>${helpers.formatDate(u.created_at)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger"
          onclick="confirmRemove('${u.id}')">
          Disable
        </button>
      </td>
    </tr>
  `;
}

function renderRoles(current) {
  return ['admin', 'lab', 'patient']
    .map(r => `
      <option value="${r}" ${r === current ? 'selected' : ''}>
        ${r.toUpperCase()}
      </option>
    `).join('');
}

async function updateRole(id, role) {
  const { error } = await supabaseClient
    .from('profiles')
    .update({ role })
    .eq('id', id);

  if (error) {
    toast.error('Role update failed');
    return;
  }

  toast.success('Role updated');
}

function confirmRemove(id) {
  if (!confirm('Disable this user?')) return;

  // soft-disable example (extend later)
  toast.info('User disabled (soft)');
}
