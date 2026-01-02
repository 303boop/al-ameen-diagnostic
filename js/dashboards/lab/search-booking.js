(async function () {
  const ok = await auth.requireAuth(['lab']);
  if (!ok) return;

  loadSidebar();

  document.getElementById('searchBtn')
    .addEventListener('click', searchBooking);
})();

function loadSidebar() {
  document.getElementById('labSidebar').innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-flask"></i> Lab
      </div>
    </div>

    <nav class="sidebar-nav">
      <a class="sidebar-nav-item active" href="/dashboards/lab/search-booking.html">
        <i class="fas fa-search"></i> Search Booking
      </a>
      <a class="sidebar-nav-item" href="/dashboards/lab/appointments.html">
        <i class="fas fa-calendar-day"></i> Appointments
      </a>
      <a class="sidebar-nav-item" href="/dashboards/lab/upload-report.html">
        <i class="fas fa-file-upload"></i> Upload Report
      </a>
    </nav>
  `;
}

async function searchBooking() {
  const bookingId = bookingInput.value.trim();
  if (!bookingId) {
    toast.error('Enter booking ID');
    return;
  }

  loader.showPageLoader('Searching...');

  const { data, error } = await supabaseClient
    .from('appointments')
    .select(`
      id,
      booking_id,
      serial_number,
      status,
      appointment_date,
      patient_name,
      doctors ( name )
    `)
    .eq('booking_id', bookingId)
    .single();

  loader.hidePageLoader();

  if (error || !data) {
    toast.error('Booking not found');
    return;
  }

  renderResult(data);
}

function renderResult(a) {
  const card = document.getElementById('resultCard');
  const body = document.getElementById('resultBody');

  card.classList.remove('d-none');

  body.innerHTML = `
    <h3 class="mb-3">Booking Details</h3>

    <p><strong>Booking ID:</strong> ${a.booking_id}</p>
    <p><strong>Patient:</strong> ${helpers.sanitizeHTML(a.patient_name || 'Guest')}</p>
    <p><strong>Doctor:</strong> ${a.doctors?.name || '-'}</p>
    <p><strong>Date:</strong> ${helpers.formatDate(a.appointment_date)}</p>
    <p><strong>Serial:</strong> #${a.serial_number}</p>
    <p><strong>Status:</strong> ${a.status}</p>

    <a class="btn btn-outline-primary mt-3"
      href="/dashboards/lab/upload-report.html?appointment=${a.id}">
      Upload Report
    </a>
  `;
}
