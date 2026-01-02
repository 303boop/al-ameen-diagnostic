(async function () {
  const ok = await auth.requireAuth(['admin']);
  if (!ok) return;

  loadSidebar();
  loadCoupons();
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
      <a class="sidebar-nav-item active" href="/dashboards/admin/coupons.html">
        <i class="fas fa-ticket-alt"></i> Coupons
      </a>
    </nav>
  `;
}

async function loadCoupons() {
  const container = document.getElementById('couponTable');
  loader.showSectionLoader(container);

  const { data, error } = await supabaseClient
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  loader.hideSectionLoader(container);

  if (error) {
    toast.error('Failed to load coupons');
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-muted">No coupons created</p>`;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Expiry</th>
            <th>Status</th>
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

function renderRow(c) {
  return `
    <tr>
      <td><strong>${c.code}</strong></td>
      <td>
        ${c.discount_type === 'percent'
          ? `${c.discount_value}%`
          : helpers.formatCurrency(c.discount_value)}
      </td>
      <td>${c.expires_at ? helpers.formatDate(c.expires_at) : '—'}</td>
      <td>
        <span class="badge ${c.is_active ? 'bg-success' : 'bg-secondary'}">
          ${c.is_active ? 'Active' : 'Disabled'}
        </span>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary"
          onclick="toggleCoupon('${c.id}', ${!c.is_active})">
          ${c.is_active ? 'Disable' : 'Enable'}
        </button>
      </td>
    </tr>
  `;
}

async function toggleCoupon(id, state) {
  const { error } = await supabaseClient
    .from('coupons')
    .update({ is_active: state })
    .eq('id', id);

  if (error) {
    toast.error('Update failed');
    return;
  }

  toast.success('Coupon updated');
  loadCoupons();
}
