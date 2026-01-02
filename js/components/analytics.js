// js/components/analytics.js

// =====================================================
// Analytics & Charts Controller
// =====================================================

// Guards & Dependencies
const getSupabase = () => window.supabase; // Get fresh instance
const getDateUtils = () => window.dateUtils; // Get fresh instance

const Analytics = {

    // --------------------
    // DATA FETCHERS
    // --------------------

    async getAppointmentStats(startDate, endDate) {
        const sb = getSupabase();
        if (!sb) return { success: false, error: "Supabase not ready" };

        try {
            const { data, error } = await sb
                .from('appointments')
                .select('*')
                .gte('appointment_date', startDate)
                .lte('appointment_date', endDate);

            if (error) throw error;

            return {
                success: true,
                stats: {
                    total: data.length,
                    booked: data.filter(a => a.status === 'booked').length,
                    checked_in: data.filter(a => a.status === 'checked_in').length,
                    completed: data.filter(a => a.status === 'completed').length,
                    cancelled: data.filter(a => a.status === 'cancelled').length
                }
            };
        } catch (error) {
            console.error("Analytics Error:", error);
            return { success: false, error: error.message };
        }
    },

    async getTodayAppointments() {
        const sb = getSupabase();
        if (!sb) return { success: false, error: "Supabase not ready" };

        try {
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await sb
                .from('appointments')
                .select('*')
                .eq('appointment_date', today);

            if (error) throw error;
            return { success: true, count: data.length, appointments: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getTotalPatients() {
        const sb = getSupabase();
        if (!sb) return { success: false, error: "Supabase not ready" };

        try {
            const { count, error } = await sb
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'patient');

            if (error) throw error;
            return { success: true, count: count || 0 };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getActiveDoctors() {
        const sb = getSupabase();
        try {
            const { count, error } = await sb
                .from('doctors')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            if (error) throw error;
            return { success: true, count: count || 0 };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getRevenueData(days = 30) {
        const sb = getSupabase();
        try {
            const today = new Date();
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - days);

            const { data, error } = await sb
                .from('appointments')
                .select(`appointment_date, doctor:doctors(consultation_fee)`)
                .eq('status', 'completed')
                .gte('appointment_date', pastDate.toISOString().split('T')[0]);

            if (error) throw error;

            // Calculate Total
            const total = data.reduce((sum, item) => {
                return sum + (Number(item.doctor?.consultation_fee) || 0);
            }, 0);

            return { success: true, total, count: data.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // --------------------
    // CHART GENERATORS
    // --------------------
    // Note: Requires <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> in HTML

    renderRevenueChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx || !window.Chart) return;

        // Mock data for visual appeal until real data is complex enough
        new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [12000, 19000, 15000, 25000], // Replace with real getRevenueData() calls if needed
                    borderColor: '#0d6efd',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(13, 110, 253, 0.1)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
};

// Export
window.analytics = Analytics;
console.log("✅ Analytics module loaded");