// In-App Notifications Management (Fixed & Production-Safe)

/* =========================
   SAFETY CHECK
========================= */
if (!window.supabase) {
  console.error("❌ Supabase not initialized");
}

/* =========================
   UTILS
========================= */
function getRelativeTime(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/* =========================
   DATA FETCHERS
========================= */
async function getUserNotifications(userId, unreadOnly = false) {
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: error.message };
  }
}

async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return { success: false, count: 0 };
  }
}

/* =========================
   MUTATIONS
========================= */
async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking as read:", error);
    return { success: false, error: error.message };
  }
}

async function markAllAsRead(userId) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking all as read:", error);
    return { success: false, error: error.message };
  }
}

async function deleteNotification(notificationId) {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   UI HELPERS
========================= */
function getNotificationIcon(type) {
  const icons = {
    booking_confirmed: '<i class="fas fa-check-circle text-success"></i>',
    report_ready: '<i class="fas fa-file-medical text-info"></i>',
    reminder: '<i class="fas fa-bell text-warning"></i>',
  };
  return icons[type] || '<i class="fas fa-info-circle"></i>';
}

async function updateNotificationBadge(userId, bellEl) {
  if (!bellEl) return;

  const badge = bellEl.querySelector(".notification-badge");
  if (!badge) return;

  const result = await getUnreadCount(userId);
  if (!result.success) return;

  if (result.count > 0) {
    badge.textContent = result.count > 99 ? "99+" : result.count;
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

/* =========================
   DROPDOWN RENDER
========================= */
async function loadNotificationDropdown(userId, dropdownEl) {
  const result = await getUserNotifications(userId);

  if (!result.success || result.data.length === 0) {
    dropdownEl.innerHTML =
      '<div class="notification-empty">No notifications</div>';
    return;
  }

  let html = `
    <div class="notification-header">
      <span>Notifications</span>
      <button class="mark-all-read" id="markAllReadBtn">Mark all read</button>
    </div>
    <div class="notification-list">
  `;

  result.data.forEach(n => {
    html += `
      <div class="notification-item ${n.is_read ? "" : "unread"}" data-id="${n.id}">
        <div class="notification-icon">${getNotificationIcon(n.type)}</div>
        <div class="notification-content">
          <p>${n.message}</p>
          <small>${getRelativeTime(n.created_at)}</small>
        </div>
        <button class="notification-delete" data-delete="${n.id}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });

  html += "</div>";
  dropdownEl.innerHTML = html;

  // Bind events
  dropdownEl.querySelector("#markAllReadBtn")?.addEventListener("click", async () => {
    await markAllAsRead(userId);
    loadNotificationDropdown(userId, dropdownEl);
  });

  dropdownEl.querySelectorAll(".notification-item").forEach(item => {
    item.addEventListener("click", async () => {
      await markAsRead(item.dataset.id);
      item.classList.remove("unread");
    });
  });

  dropdownEl.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      await deleteNotification(btn.dataset.delete);
      loadNotificationDropdown(userId, dropdownEl);
    });
  });
}

/* =========================
   INIT BELL
========================= */
async function initNotificationBell(bellEl, dropdownEl) {
  const user = await getCurrentUser();
  if (!user || !bellEl || !dropdownEl) return;

  let polling;

  await updateNotificationBadge(user.id, bellEl);

  bellEl.addEventListener("click", async e => {
    e.stopPropagation();
    await loadNotificationDropdown(user.id, dropdownEl);
    dropdownEl.classList.toggle("show");
  });

  document.addEventListener("click", e => {
    if (!bellEl.contains(e.target) && !dropdownEl.contains(e.target)) {
      dropdownEl.classList.remove("show");
    }
  });

  polling = setInterval(() => {
    updateNotificationBadge(user.id, bellEl);
  }, 30000);

  // Stop polling if user logs out
  window.addEventListener("beforeunload", () => clearInterval(polling));
}

/* =========================
   EXPORT
========================= */
window.notifications = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  initNotificationBell,
};
