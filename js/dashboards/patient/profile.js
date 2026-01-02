(async function () {
  const ok = await auth.requireAuth(['patient']);
  if (!ok) return;

  loadSidebar();
  loadProfile();
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
      <a class="sidebar-nav-item" href="/dashboards/patient/reports.html">
        <i class="fas fa-file-medical"></i> Reports
      </a>
      <a class="sidebar-nav-item active" href="/dashboards/patient/profile.html">
        <i class="fas fa-user-cog"></i> Profile
      </a>
    </nav>
  `;
}

async function loadProfile() {
  const profile = await getUserRole();
  if (!profile) return;

  document.getElementById('fullName').value = profile.full_name || '';
  document.getElementById('phone').value = profile.phone || '';
}

/* Update profile */
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = fullName.value.trim();
  const phone = phone.value.trim();

  if (!validator.validatePhone(phone)) {
    toast.error('Invalid phone number');
    return;
  }

  loader.showPageLoader('Updating profile...');

  const user = await getCurrentUser();

  const { error } = await supabaseClient
    .from('profiles')
    .update({ full_name: name, phone })
    .eq('id', user.id);

  loader.hidePageLoader();

  if (error) {
    toast.error('Update failed');
    return;
  }

  toast.success('Profile updated');
});

/* Update password */
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const pwd = newPassword.value;

  if (!validator.validatePassword(pwd)) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  loader.showPageLoader('Updating password...');
  const result = await auth.updatePassword(pwd);
  loader.hidePageLoader();

  if (result.success) {
    toast.success('Password updated');
    newPassword.value = '';
  } else {
    toast.error(result.error);
  }
});

