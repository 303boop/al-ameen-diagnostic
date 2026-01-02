(async function () {
  const ok = await auth.requireAuth(['patient']);
  if (!ok) return;

  loadSidebar();
  loadNotifications();
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
      <a class="sidebar-nav-item active" href="/dashboards/patient/notifications.html">
        <i class="fas fa-bell"></i> Notifications
      </a>
      <a class="sidebar-nav-item" href="/dashboards/patient/profile.html">
        <i class="fas fa-user-cog"></i> Profile
      </a>
    </nav>
  `;
}

async function loadNotifications() {
  const user = await getCurrentUser();
  if (!user) return;

  const container = document.getElementById('notificationList');
  container.innerHTML = loader.createSkeletonLoader('list', 4);

  const { data, error } = await supabaseClient
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    toast.error('Failed to load notifications');
    container.innerHTML = '';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <p>No notifications yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(renderNotification).join('');
  markAllRead(user.id);
}

function renderNotification(n) {
  return `
    <div class="dashboard-card notification-card ${n.is_read ? '' : 'unread'}">
      <div class="dashboard-card-body">
        <div class="notification-title">${n.title}</div>
        <div class="notification-message">${n.message}</div>
        <div class="notification-time">
          ${dateUtils.getRelativeTime(n.created_at)}
        </div>
      </div>
    </div>
  `;
}

async function markAllRead(userId) {
  await supabaseClient
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
}
