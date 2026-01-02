(async function () {
  const ok = await auth.requireAuth(['lab']);
  if (!ok) return;

  loadSidebar();

  const params = new URLSearchParams(window.location.search);
  window.appointmentId = params.get('appointment');

  if (!appointmentId) {
    toast.error('Missing appointment reference');
    return;
  }

  document
    .getElementById('reportForm')
    .addEventListener('submit', uploadReport);
})();

function loadSidebar() {
  document.getElementById('labSidebar').innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <i class="fas fa-flask"></i> Lab
      </div>
    </div>

    <nav class="sidebar-nav">
      <a class="sidebar-nav-item" href="/dashboards/lab/search-booking.html">
        <i class="fas fa-search"></i> Search Booking
      </a>
      <a class="sidebar-nav-item active" href="#">
        <i class="fas fa-file-upload"></i> Upload Report
      </a>
    </nav>
  `;
}

async function uploadReport(e) {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    toast.error('Please select a file');
    return;
  }

  loader.showButtonLoader(uploadBtn);

  /* 🔹 Fetch appointment to get patient_id */
  const { data: appointment, error: apptError } = await supabaseClient
    .from('appointments')
    .select('patient_id')
    .eq('id', appointmentId)
    .single();

  if (apptError || !appointment) {
    loader.hideButtonLoader(uploadBtn);
    toast.error('Invalid appointment');
    return;
  }

  const safeName = file.name.replace(/\s+/g, '_');
  const filePath = `${appointmentId}/${Date.now()}_${safeName}`;

  /* 🔹 Upload to PRIVATE reports bucket */
  const { error: uploadError } = await supabaseClient
    .storage
    .from(APP_CONSTANTS.STORAGE_BUCKETS.REPORTS)
    .upload(filePath, file);

  if (uploadError) {
    loader.hideButtonLoader(uploadBtn);
    toast.error('File upload failed');
    return;
  }

  const currentUser = await getCurrentUser();

  /* 🔹 Insert report record (MATCHES YOUR DB SCHEMA) */
  const { error: dbError } = await supabaseClient
    .from('reports')
    .insert({
      appointment_id: appointmentId,
      patient_id: appointment.patient_id,
      file_url: filePath,
      file_type: file.type,
      uploaded_by: currentUser.id,
      report_type: reportType.value
    });

  if (dbError) {
    loader.hideButtonLoader(uploadBtn);
    toast.error('Failed to save report');
    return;
  }

  /* 🔹 Mark appointment completed */
  await supabaseClient
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', appointmentId);

  loader.hideButtonLoader(uploadBtn);
  toast.success('Report uploaded successfully');

  window.location.href = '/dashboards/lab/search-booking.html';
}
