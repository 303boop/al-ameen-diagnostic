// js/components/analytics.js

// =====================================================
// Analytics & Charts Controller
// =====================================================

const Analytics = {

    // --------------------
    // DATA FETCHERS
    // --------------------

    // Helper: Get Local ISO Date (YYYY-MM-DD) to fix Timezone issues
    getLocalToday() {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - (offset * 60 * 1000));
        return local.toISOString().split('T')[0];
    },

    async getAppointmentStats(startDate, endDate) {
        const sb = window.supabase;
        if (!sb) return { success: false, error: "Supabase not ready" };

        try {
            const { data, error } = await sb
                .from('appointments')
                .select('status')
                .gte('appointment_date', startDate)
                .lte('appointment_date', endDate);

            if (error) throw error;

            // Aggregate Locally to save DB calls
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
        const sb = window.supabase;
        if (!sb) return { success: false };

        try {
            const today = this.getLocalToday(); // FIX: Use Local Time
            
            const { data, error } = await sb
                .from('appointments')
                .select(`
                    *,
                    doctor:doctors(name),
                    test:tests(name)
                `)
                .eq('appointment_date', today)
                .order('estimated_time', { ascending: true });

            if (error) throw error;
            return { success: true, count: data.length, appointments: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getTotalPatients() {
        const sb = window.supabase;
        if (!sb) return { success: false };

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
        const sb = window.supabase;
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

    async getRevenueData(days = 7) {
        const sb = window.supabase;
        try {
            const today = new Date();
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - days);

            // Fetch completed appointments with prices
            // Note: We fetch doctor fee OR test price
            const { data, error } = await sb
                .from('appointments')
                .select(`
                    appointment_date,
                    doctor:doctors(consultation_fee),
                    test:tests(original_price, discount_price, is_discount_active)
                `)
                .eq('status', 'completed')
                .gte('appointment_date', pastDate.toISOString().split('T')[0]);

            if (error) throw error;

            // Calculate Total & Prepare Chart Data
            let totalRevenue = 0;
            const dailyMap = {};

            data.forEach(item => {
                let fee = 0;
                
                // Logic: If Doctor, use fee. If Test, use price (check discount).
                if (item.doctor) {
                    fee = Number(item.doctor.consultation_fee) || 0;
                } else if (item.test) {
                    fee = item.test.is_discount_active 
                        ? (Number(item.test.discount_price) || 0) 
                        : (Number(item.test.original_price) || 0);
                }

                totalRevenue += fee;

                // Group by Date for Chart
                const date = item.appointment_date;
                dailyMap[date] = (dailyMap[date] || 0) + fee;
            });

            return { 
                success: true, 
                total: totalRevenue, 
                chartData: dailyMap 
            };

        } catch (error) {
            console.error("Revenue Error:", error);
            return { success: false, error: error.message };
        }
    },

    // --------------------
    // CHART GENERATORS
    // --------------------

    renderRevenueChart(canvasId, dailyMap) {
        const ctx = document.getElementById(canvasId);
        if (!ctx || !window.Chart) return;

        // Sort dates
        const sortedDates = Object.keys(dailyMap).sort();
        const dataPoints = sortedDates.map(date => dailyMap[date]);
        
        // Format dates for labels (e.g., "Jan 01")
        const labels = sortedDates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        // Destroy old chart instance if exists to prevent overlapping
        const existingChart = Chart.getChart(canvasId);
        if (existingChart) existingChart.destroy();

        new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: dataPoints,
                    borderColor: '#4ECDC4', // Your primary teal color
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    borderWidth: 2,
                    tension: 0.4, // Smooth curves
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4ECDC4',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return ' ₹ ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [2, 4], color: '#e0e0e0' },
                        ticks: { callback: (value) => '₹' + value }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
};

// Global Export
window.analytics = Analytics;