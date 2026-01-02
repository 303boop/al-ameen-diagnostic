(async function () {
  const allowed = await auth.requireAuth(['admin']);
  if (!allowed) return;

  loadSidebar();
  loadTests();
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
      <a class="sidebar-nav-item" href="/dashboards/admin/doctors.html">
        <i class="fas fa-user-md"></i> Doctors
      </a>
      <a class="sidebar-nav-item active" href="/dashboards/admin/tests.html">
        <i class="fas fa-vials"></i> Tests
      </a>
    </nav>
  `;
}

async function loadTests() {
  const container = document.getElementById('testsTable');
  loader.showSectionLoader(container);

  const { data, error } = await supabaseClient
    .from('tests')
    .select('*')
    .order('created_at', { ascending: false });

  loader.hideSectionLoader(container);

  if (error) {
    toast.error('Failed to load tests');
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-muted">No tests available</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${data.map(renderTestRow).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderTestRow(test) {
  const price = test.is_discount_active
    ? `<span class="text-muted"><del>${helpers.formatCurrency(test.original_price)}</del></span>
       <strong>${helpers.formatCurrency(test.discount_price)}</strong>`
    : helpers.formatCurrency(test.original_price);

  return `
    <tr>
      <td>${helpers.sanitizeHTML(test.name)}</td>
      <td>${price}</td>
      <td>${test.is_discount_active ? 'Yes' : 'No'}</td>
      <td>
        <span class="badge ${test.is_active ? 'bg-success' : 'bg-danger'}">
          ${test.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary"
          onclick="toggleTest('${test.id}', ${test.is_active})">
          ${test.is_active ? 'Disable' : 'Enable'}
        </button>
      </td>
    </tr>
  `;
}

async function toggleTest(id, current) {
  if (!confirm(current ? 'Disable this test?' : 'Enable this test?')) return;

  const { error } = await supabaseClient
    .from('tests')
    .update({ is_active: !current })
    .eq('id', id);

  if (error) {
    toast.error('Update failed');
    return;
  }

  toast.success('Test updated');
  loadTests();
}
