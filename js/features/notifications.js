// js/features/notifications.js

// =====================================================
// Notification System
// =====================================================

// Guards
const getSupabase = () => window.supabase;
const getAuth = () => window.auth;
const getDateUtils = () => window.dateUtils;

const NotificationManager = {
    
    // --- 1. DATA FETCHING ---
    
    async getUserNotifications(userId, unreadOnly = false) {
        const sb = getSupabase();
        try {
            let query = sb
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
            console.error("Fetch Notifications Error:", error);
            return { success: false, error: error.message };
        }
    },

    async getUnreadCount(userId) {
        const sb = getSupabase();
        try {
            const { count, error } = await sb
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("is_read", false);

            if (error) throw error;
            return { success: true, count: count || 0 };
        } catch (error) {
            return { success: false, count: 0 };
        }
    },

    // --- 2. ACTIONS ---

    async markAsRead(notificationId) {
        const sb = getSupabase();
        try {
            const { error } = await sb
                .from("notifications")
                .update({ is_read: true })
                .eq("id", notificationId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async markAllAsRead(userId) {
        const sb = getSupabase();
        try {
            const { error } = await sb
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", userId)
                .eq("is_read", false);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async deleteNotification(notificationId) {
        const sb = getSupabase();
        try {
            const { error } = await sb
                .from("notifications")
                .delete()
                .eq("id", notificationId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --- 3. UI RENDERING ---

    getIcon(type) {
        switch (type) {
            case 'booking_confirmed': return '<i class="fas fa-check-circle text-success"></i>';
            case 'report_ready': return '<i class="fas fa-file-medical text-info"></i>';
            case 'reminder': return '<i class="fas fa-bell text-warning"></i>';
            default: return '<i class="fas fa-info-circle text-secondary"></i>';
        }
    },

    async updateBadge(userId, bellElement) {
        if (!bellElement) return;
        
        const badge = bellElement.querySelector(".notification-badge") || bellElement.querySelector(".badge");
        if (!badge) return;

        const result = await this.getUnreadCount(userId);
        
        if (result.success && result.count > 0) {
            badge.textContent = result.count > 99 ? '99+' : result.count;
            badge.style.display = 'inline-block'; // or block/flex based on css
            badge.classList.remove('d-none');
        } else {
            badge.style.display = 'none';
            badge.classList.add('d-none');
        }
    },

    async renderDropdown(userId, dropdownElement) {
        if (!dropdownElement) return;

        // Show loading state
        dropdownElement.innerHTML = `<div class="p-3 text-center"><div class="spinner-border spinner-border-sm"></div></div>`;

        const result = await this.getUserNotifications(userId);

        if (!result.success || result.data.length === 0) {
            dropdownElement.innerHTML = `<div class="p-3 text-center text-muted small">No notifications</div>`;
            return;
        }

        const dateUtils = getDateUtils();
        
        const listHTML = result.data.map(n => `
            <div class="list-group-item list-group-item-action d-flex align-items-start gap-2 ${n.is_read ? 'bg-light' : 'bg-white border-start border-3 border-primary'}" 
                 onclick="window.notifications.handleItemClick('${n.id}', this)">
                <div class="mt-1">${this.getIcon(n.type)}</div>
                <div class="flex-grow-1">
                    <p class="mb-1 small">${n.message}</p>
                    <small class="text-muted" style="font-size: 0.75rem">
                        ${dateUtils ? dateUtils.getRelativeTime(n.created_at) : n.created_at.split('T')[0]}
                    </small>
                </div>
                <button class="btn btn-link btn-sm text-danger p-0" onclick="window.notifications.handleDelete(event, '${n.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        dropdownElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
                <span class="fw-bold small">Notifications</span>
                <button class="btn btn-link btn-sm p-0 small text-decoration-none" onclick="window.notifications.handleMarkAll('${userId}')">Mark all read</button>
            </div>
            <div class="list-group list-group-flush" style="max-height: 300px; overflow-y: auto;">
                ${listHTML}
            </div>
        `;
    },

    // --- 4. INITIALIZATION ---

    async init(bellId, dropdownId) {
        const bell = document.getElementById(bellId);
        const dropdown = document.getElementById(dropdownId);
        
        const auth = getAuth();
        if (!auth || !bell || !dropdown) return;

        const user = await auth.getCurrentUser();
        if (!user) return;

        // 1. Initial Load
        this.updateBadge(user.id, bell);

        // 2. Click Handler
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            // Toggle visibility (Bootstrap dropdowns usually handle this, but if custom:)
            const isShown = dropdown.classList.contains('show');
            if (!isShown) {
                this.renderDropdown(user.id, dropdown);
            }
        });

        // 3. Polling (Optional - every 60s)
        setInterval(() => this.updateBadge(user.id, bell), 60000);
    },

    // --- 5. EVENT HANDLERS (Global access for onclick) ---
    async handleItemClick(id, el) {
        await this.markAsRead(id);
        el.classList.remove('bg-white', 'border-start', 'border-3', 'border-primary');
        el.classList.add('bg-light');
    },

    async handleDelete(e, id) {
        e.stopPropagation(); // Prevent triggering item click
        if(!confirm("Delete notification?")) return;
        await this.deleteNotification(id);
        // Refresh the dropdown logic here if needed, or just remove element
        e.target.closest('.list-group-item').remove();
    },

    async handleMarkAll(userId) {
        await this.markAllAsRead(userId);
        // Reload list
        const dropdown = document.querySelector('.notification-dropdown'); // Adjust selector as needed
        if(dropdown) this.renderDropdown(userId, dropdown);
    }
};

// Export
window.notifications = NotificationManager;