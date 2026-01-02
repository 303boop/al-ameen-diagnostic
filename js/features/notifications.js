// In-App Notifications Management

// Get user notifications
async function getUserNotifications(userId, unreadOnly = false) {
  try {
    let query = supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
}

// Get unread count
async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { success: false, count: 0 };
  }
}

// Mark notification as read
async function markAsRead(notificationId) {
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking as read:', error);
    return { success: false, error: error.message };
  }
}

// Mark all as read
async function markAllAsRead(userId) {
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error: error.message };
  }
}

// Delete notification
async function deleteNotification(notificationId) {
  try {
    const { error } = await supabaseClient
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
}

// Initialize notification bell UI
async function initNotificationBell(bellElement, dropdownElement) {
  const user = await getCurrentUser();
  if (!user) return;

  // Load initial count
  await updateNotificationBadge(user.id, bellElement);

  // Load notifications on click
  bellElement.addEventListener('click', async (e) => {
    e.stopPropagation();
    await loadNotificationDropdown(user.id, dropdownElement);
    dropdownElement.classList.toggle('show');
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!bellElement.contains(e.target) && !dropdownElement.contains(e.target)) {
      dropdownElement.classList.remove('show');
    }
  });

  // Poll for new notifications every 30 seconds
  setInterval(() => {
    updateNotificationBadge(user.id, bellElement);
  }, 30000);
}

// Update notification badge
async function updateNotificationBadge(userId, bellElement) {
  const result = await getUnreadCount(userId);
  const badge = bellElement.querySelector('.notification-badge');
  
  if (result.count > 0) {
    if (badge) {
      badge.textContent = result.count > 99 ? '99+' : result.count;
      badge.style.display = 'block';
    }
  } else {
    if (badge) {
      badge.style.display = 'none';
    }
  }
}

// Load notification dropdown
async function loadNotificationDropdown(userId, dropdownElement) {
  const result = await getUserNotifications(userId);

  if (!result.success || result.data.length === 0) {
    dropdownElement.innerHTML = '<div class="notification-empty">No notifications</div>';
    return;
  }

  let html = '<div class="notification-header">';
  html += '<span>Notifications</span>';
  html += '<button class="mark-all-read" onclick="window.notifications.markAllAsRead(\'' + userId + '\')">Mark all read</button>';
  html += '</div>';
  html += '<div class="notification-list">';

  result.data.forEach(notification => {
    const unreadClass = notification.is_read ? '' : 'unread';
    const icon = getNotificationIcon(notification.type);

    html += `
      <div class="notification-item ${unreadClass}" onclick="window.notifications.markAsRead('${notification.id}')">
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
          <p>${notification.message}</p>
          <small>${dateUtils.getRelativeTime(notification.created_at)}</small>
        </div>
        <button class="notification-delete" onclick="event.stopPropagation(); window.notifications.deleteNotification('${notification.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });

  html += '</div>';
  dropdownElement.innerHTML = html;
}

// Get icon for notification type
function getNotificationIcon(type) {
  const icons = {
    booking_confirmed: '<i class="fas fa-check-circle text-success"></i>',
    report_ready: '<i class="fas fa-file-medical text-info"></i>',
    reminder: '<i class="fas fa-bell text-warning"></i>'
  };
  return icons[type] || '<i class="fas fa-info-circle"></i>';
}

// Export
window.notifications = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  initNotificationBell
};