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
    toast.error('Select a file');
    return;
  }

  loader.showButtonLoader(uploadBtn);

  /* 🔹 Get appointment to fetch patient user_id */
  const { data: appointment } = await supabaseClient
    .from('appointments')
    .select('user_id')
    .eq('id', appointmentId)
    .single();

  if (!appointment) {
    loader.hideButtonLoader(uploadBtn);
    toast.error('Invalid appointment');
    return;
  }

  const safeName = file.name.replace(/\s+/g, '_');
  const filePath = `${appointmentId}/${Date.now()}_${safeName}`;

  /* Upload to private bucket */
  const { error: uploadError } = await supabaseClient
    .storage
    .from(APP_CONSTANTS.STORAGE_BUCKETS.REPORTS)
    .upload(filePath, file);

  if (uploadError) {
    loader.hideButtonLoader(uploadBtn);
    toast.error('Upload failed');
    return;
  }

  /* Save report record */
  const { error: dbError } = await supabaseClient
    .from('reports')
    .insert({
      appointment_id: appointmentId,
      user_id: appointment.user_id,
      file_name: safeName,
      file_path: filePath,
      report_type: reportType.value
    });

  if (dbError) {
    loader.hideButtonLoader(uploadBtn);
    toast.error('Failed to save report');
    return;
  }

  /* Mark appointment completed */
  await supabaseClient
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', appointmentId);

  loader.hideButtonLoader(uploadBtn);

  toast.success('Report uploaded successfully');
  window.location.href = '/dashboards/lab/search-booking.html';
}
