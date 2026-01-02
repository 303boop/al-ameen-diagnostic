(async function () {
  const ok = await auth.requireAuth(['admin']);
  if (!ok) return;

  loadSidebar();
  loadSettings();

  document.getElementById('settingsForm')
    .addEventListener('submit', saveSettings);
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
      <a class="sidebar-nav-item active" href="/dashboards/admin/settings.html">
        <i class="fas fa-cog"></i> Settings
      </a>
    </nav>
  `;
}

async function loadSettings() {
  const { data } = await supabaseClient
    .from('settings')
    .select('*')
    .single();

  if (!data) return;

  clinicName.value = data.clinic_name || '';
  clinicPhone.value = data.phone || '';
  clinicEmail.value = data.email || '';
  maxAppointments.value = data.max_daily_appointments || '';
  bookingPrefix.value = data.booking_prefix || '';
}

async function saveSettings(e) {
  e.preventDefault();

  loader.showPageLoader('Saving settings...');

  const payload = {
    clinic_name: clinicName.value.trim(),
    phone: clinicPhone.value.trim(),
    email: clinicEmail.value.trim(),
    max_daily_appointments: Number(maxAppointments.value) || null,
    booking_prefix: bookingPrefix.value.trim()
  };

  const { error } = await supabaseClient
    .from('settings')
    .upsert(payload);

  loader.hidePageLoader();

  if (error) {
    toast.error('Failed to save settings');
    return;
  }

  toast.success('Settings updated');
}
