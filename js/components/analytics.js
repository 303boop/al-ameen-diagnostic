// =====================================
// Analytics & Charts (FIXED & HARDENED)
// =====================================

// Guards
const sb = window.supabaseClient;
const du = window.dateUtils;

// --------------------
// Data fetchers
// --------------------
async function getAppointmentStats(startDate, endDate) {
  try {
    if (!sb) throw new Error('Supabase not ready');

    const { data, error } = await sb
      .from('appointments')
      .select('*')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate);

    if (error) throw error;

    const stats = {
      total: data.length,
      booked: data.filter(a => a.status === 'booked').length,
      checked_in: data.filter(a => a.status === 'checked_in').length,
      completed: data.filter(a => a.status === 'completed').length,
      cancelled: data.filter(a => a.status === 'cancelled').length
    };

    return { success: true, stats, data };
  } catch (error) {
    console.error('Stats error:', error);
    return { success: false, error: error.message };
  }
}

async function getTodayAppointments() {
  try {
    if (!sb || !du) throw new Error('Dependencies not ready');

    const today = du.getTodayDate();
    const { data, error } = await sb
      .from('appointments')
      .select('*')
      .eq('appointment_date', today);

    if (error) throw error;
    return { success: true, count: data.length, appointments: data };
  } catch (error) {
    console.error('Today appointments error:', error);
    return { success: false, error: error.message };
  }
}

async function getTotalPatients() {
  try {
    if (!sb) throw new Error('Supabase not ready');

    const { count, error } = await sb
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient');

    if (error) throw error;
    return { success: true, count };
  } catch (error) {
    console.error('Patient count error:', error);
    return { success: false, error: error.message };
  }
}

async function getActiveDoctors() {
  try {
    if (!sb) throw new Error('Supabase not ready');

    const { count, error } = await sb
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) throw error;
    return { success: true, count };
  } catch (error) {
    console.error('Doctor count error:', error);
    return { success: false, error: error.message };
  }
}

async function getRevenueData(startDate, endDate) {
  try {
    if (!sb) throw new Error('Supabase not ready');

    const { data, error } = await sb
      .from('appointments')
      .select(`appointment_date, doctor:doctors(consultation_fee)`)
      .eq('status', 'completed')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate);

    if (error) throw error;

    const revenue = data.reduce(
      (sum, a) => sum + Number(a.doctor?.consultation_fee || 0),
      0
    );

    return { success: true, revenue, appointments: data.length };
  } catch (error) {
    console.error('Revenue error:', error);
    return { success: false, error: error.message };
  }
}

async function getRevenueByDate(startDate, endDate) {
  try {
    if (!sb || !du) throw new Error('Dependencies not ready');

    const { data, error } = await sb
      .from('appointments')
      .select(`appointment_date, doctor:doctors(consultation_fee)`)
      .eq('status', 'completed')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date');

    if (error) throw error;

    const map = {};
    data.forEach(a => {
      map[a.appointment_date] =
        (map[a.appointment_date] || 0) + Number(a.doctor?.consultation_fee || 0);
    });

    return {
      success: true,
      labels: Object.keys(map).map(d => du.formatDisplayDate(d)),
      values: Object.values(map)
    };
  } catch (error) {
    console.error('Revenue-by-date error:', error);
    return { success: false, error: error.message };
  }
}

async function getAppointmentsByDate(startDate, endDate) {
  try {
    if (!sb || !du) throw new Error('Dependencies not ready');

    const { data, error } = await sb
      .from('appointments')
      .select('appointment_date')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date');

    if (error) throw error;

    const map = {};
    data.forEach(a => {
      map[a.appointment_date] = (map[a.appointment_date] || 0) + 1;
    });

    return {
      success: true,
      labels: Object.keys(map).map(d => du.formatDisplayDate(d)),
      values: Object.values(map)
    };
  } catch (error) {
    console.error('Appointments-by-date error:', error);
    return { success: false, error: error.message };
  }
}

async function getPopularDoctors(limit = 5) {
  try {
    if (!sb) throw new Error('Supabase not ready');

    const { data, error } = await sb
      .from('appointments')
      .select(`doctor_id, doctor:doctors(name, specialization, image_url)`)
      .eq('status', 'completed');

    if (error) throw error;

    const map = {};
    data.forEach(a => {
      if (!map[a.doctor_id]) {
        map[a.doctor_id] = { ...a.doctor, count: 0 };
      }
      map[a.doctor_id].count++;
    });

    return {
      success: true,
      doctors: Object.values(map).sort((a, b) => b.count - a.count).slice(0, limit)
    };
  } catch (error) {
    console.error('Popular doctors error:', error);
    return { success: false, error: error.message };
  }
}

async function getPopularTests() {
  return { success: true, tests: [] };
}

// --------------------
// Charts (Chart.js)
// --------------------
function ensureChart(ctx) {
  if (!ctx || !window.Chart) return null;
  return ctx;
}

function createStatusChart(canvasId, stats) {
  const ctx = ensureChart(document.getElementById(canvasId));
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Booked', 'Checked In', 'Completed', 'Cancelled'],
      datasets: [{
        data: [
          stats.booked || 0,
          stats.checked_in || 0,
          stats.completed || 0,
          stats.cancelled || 0
        ],
        backgroundColor: ['#4ECDC4', '#FFB84D', '#44A08D', '#FF6B6B'],
        borderWidth: 0
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function createRevenueChart(canvasId, chartData) {
  const ctx = ensureChart(document.getElementById(canvasId));
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.values,
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78,205,196,.12)',
        tension: 0.4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function createAppointmentsChart(canvasId, chartData) {
  const ctx = ensureChart(document.getElementById(canvasId));
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.values,
        borderColor: '#44A08D',
        backgroundColor: 'rgba(68,160,141,.12)',
        tension: 0.4,
        fill: true
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function createTopDoctorsChart(canvasId, doctors) {
  const ctx = ensureChart(document.getElementById(canvasId));
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: doctors.map(d => d.name),
      datasets: [{
        data: doctors.map(d => d.count),
        backgroundColor: '#4ECDC4',
        borderRadius: 8
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function createHorizontalBarChart(canvasId, data, label) {
  const ctx = ensureChart(document.getElementById(canvasId));
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label,
        data: data.values,
        backgroundColor: '#4ECDC4',
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// --------------------
// Export
// --------------------
window.analytics = {
  getAppointmentStats,
  getTodayAppointments,
  getTotalPatients,
  getActiveDoctors,
  getRevenueData,
  getRevenueByDate,
  getAppointmentsByDate,
  getPopularDoctors,
  getPopularTests,
  createStatusChart,
  createRevenueChart,
  createAppointmentsChart,
  createTopDoctorsChart,
  createHorizontalBarChart
};
