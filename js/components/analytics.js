// Analytics & Charts (for Admin Dashboard)

// Get appointment statistics
async function getAppointmentStats(startDate, endDate) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select('*')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate);

    if (error) throw error;

    const stats = {
      total: data.length,
      booked: data.filter(a => a.status === 'booked').length,
      completed: data.filter(a => a.status === 'completed').length,
      cancelled: data.filter(a => a.status === 'cancelled').length,
      checked_in: data.filter(a => a.status === 'checked_in').length
    };

    return { success: true, stats, data };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error: error.message };
  }
}

// Get today's appointments count
async function getTodayAppointments() {
  try {
    const today = dateUtils.getTodayDate();
    
    const { data, error } = await supabaseClient
      .from('appointments')
      .select('*')
      .eq('appointment_date', today);

    if (error) throw error;

    return { success: true, count: data.length, appointments: data };
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    return { success: false, error: error.message };
  }
}

// Get total patients count
async function getTotalPatients() {
  try {
    const { count, error } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient');

    if (error) throw error;

    return { success: true, count };
  } catch (error) {
    console.error('Error fetching patient count:', error);
    return { success: false, error: error.message };
  }
}

// Get active doctors count
async function getActiveDoctors() {
  try {
    const { count, error } = await supabaseClient
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) throw error;

    return { success: true, count };
  } catch (error) {
    console.error('Error fetching doctors count:', error);
    return { success: false, error: error.message };
  }
}

// Get revenue data (based on doctor fees)
async function getRevenueData(startDate, endDate) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        doctor:doctors(consultation_fee)
      `)
      .eq('status', 'completed')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate);

    if (error) throw error;

    const totalRevenue = data.reduce((sum, appointment) => {
      return sum + parseFloat(appointment.doctor?.consultation_fee || 0);
    }, 0);

    return { success: true, revenue: totalRevenue, appointments: data.length };
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return { success: false, error: error.message };
  }
}

// Get revenue by date (for chart)
async function getRevenueByDate(startDate, endDate) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select(`
        appointment_date,
        doctor:doctors(consultation_fee)
      `)
      .eq('status', 'completed')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date');

    if (error) throw error;

    // Group by date
    const revenueByDate = {};
    data.forEach(appointment => {
      const date = appointment.appointment_date;
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += parseFloat(appointment.doctor?.consultation_fee || 0);
    });

    // Convert to arrays for chart
    const labels = Object.keys(revenueByDate).map(date => 
      dateUtils.formatDisplayDate(date)
    );
    const values = Object.values(revenueByDate);

    return { success: true, labels, values };
  } catch (error) {
    console.error('Error fetching revenue by date:', error);
    return { success: false, error: error.message };
  }
}

// Get appointments by date (for chart)
async function getAppointmentsByDate(startDate, endDate) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select('appointment_date')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date');

    if (error) throw error;

    // Count by date
    const countByDate = {};
    data.forEach(appointment => {
      const date = appointment.appointment_date;
      countByDate[date] = (countByDate[date] || 0) + 1;
    });

    const labels = Object.keys(countByDate).map(date => 
      dateUtils.formatDisplayDate(date)
    );
    const values = Object.values(countByDate);

    return { success: true, labels, values };
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    return { success: false, error: error.message };
  }
}

// Get popular doctors
async function getPopularDoctors(limit = 5) {
  try {
    const { data, error } = await supabaseClient
      .from('appointments')
      .select(`
        doctor_id,
        doctor:doctors(name, specialization, image_url)
      `)
      .eq('status', 'completed');

    if (error) throw error;

    // Count appointments per doctor
    const doctorCounts = {};
    data.forEach(appointment => {
      const doctorId = appointment.doctor_id;
      if (!doctorCounts[doctorId]) {
        doctorCounts[doctorId] = {
          ...appointment.doctor,
          count: 0
        };
      }
      doctorCounts[doctorId].count++;
    });

    // Convert to array and sort
    const popular = Object.values(doctorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { success: true, doctors: popular };
  } catch (error) {
    console.error('Error fetching popular doctors:', error);
    return { success: false, error: error.message };
  }
}

// Get popular tests (placeholder - would need test bookings)
async function getPopularTests(limit = 5) {
  try {
    // For future implementation when test bookings are tracked
    return { success: true, tests: [] };
  } catch (error) {
    console.error('Error fetching popular tests:', error);
    return { success: false, error: error.message };
  }
}

// Create appointment status pie/doughnut chart
function createStatusChart(canvasId, stats) {
  const ctx = document.getElementById(canvasId);
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
        backgroundColor: [
          '#4ECDC4',
          '#FFB84D',
          '#44A08D',
          '#FF6B6B'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Create revenue trend line chart
function createRevenueChart(canvasId, chartData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Revenue',
        data: chartData.values,
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return '₹' + context.parsed.y.toLocaleString('en-IN');
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString('en-IN');
            }
          }
        }
      }
    }
  });
}

// Create appointments trend line chart
function createAppointmentsChart(canvasId, chartData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Appointments',
        data: chartData.values,
        borderColor: '#44A08D',
        backgroundColor: 'rgba(68, 160, 141, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Create bar chart for top doctors
function createTopDoctorsChart(canvasId, doctors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: doctors.map(d => d.name),
      datasets: [{
        label: 'Completed Appointments',
        data: doctors.map(d => d.count),
        backgroundColor: '#4ECDC4',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Create horizontal bar chart
function createHorizontalBarChart(canvasId, data, label) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: label,
        data: data.values,
        backgroundColor: '#4ECDC4',
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
}

// Export
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