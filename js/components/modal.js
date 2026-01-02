// Modal Component

// Create and show modal
function showModal(options = {}) {
  const {
    title = 'Modal Title',
    content = '',
    size = 'medium', // small, medium, large
    showClose = true,
    buttons = [],
    onClose = null
  } = options;

  // Remove existing modal
  const existingModal = document.getElementById('dynamicModal');
  if (existingModal) existingModal.remove();

  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="dynamicModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-${size}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            ${showClose ? `
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            ` : ''}
          </div>
          <div class="modal-body">
            ${content}
          </div>
          ${buttons.length > 0 ? `
            <div class="modal-footer">
              ${buttons.map(btn => `
                <button 
                  type="button" 
                  class="btn btn-${btn.type || 'secondary'}"
                  id="${btn.id || ''}"
                >
                  ${btn.text}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Add to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Get modal element
  const modalElement = document.getElementById('dynamicModal');
  const modal = new bootstrap.Modal(modalElement);

  // Attach button handlers
  buttons.forEach(btn => {
    if (btn.id && btn.onClick) {
      document.getElementById(btn.id).addEventListener('click', () => {
        btn.onClick();
        if (btn.closeOnClick !== false) {
          modal.hide();
        }
      });
    }
  });

  // Handle close event
  if (onClose) {
    modalElement.addEventListener('hidden.bs.modal', onClose);
  }

  // Remove from DOM after close
  modalElement.addEventListener('hidden.bs.modal', () => {
    modalElement.remove();
  });

  // Show modal
  modal.show();

  return modal;
}

// Confirm dialog
function showConfirm(title, message, onConfirm, onCancel) {
  return showModal({
    title,
    content: `<p>${message}</p>`,
    size: 'small',
    buttons: [
      {
        id: 'cancelBtn',
        text: 'Cancel',
        type: 'secondary',
        onClick: () => {
          if (onCancel) onCancel();
        }
      },
      {
        id: 'confirmBtn',
        text: 'Confirm',
        type: 'primary',
        onClick: () => {
          if (onConfirm) onConfirm();
        }
      }
    ]
  });
}

// Alert dialog
function showAlert(title, message, type = 'info') {
  const icons = {
    success: '<i class="fas fa-check-circle text-success fa-3x mb-3"></i>',
    error: '<i class="fas fa-times-circle text-danger fa-3x mb-3"></i>',
    warning: '<i class="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>',
    info: '<i class="fas fa-info-circle text-info fa-3x mb-3"></i>'
  };

  return showModal({
    title,
    content: `
      <div class="text-center">
        ${icons[type]}
        <p>${message}</p>
      </div>
    `,
    size: 'small',
    buttons: [
      {
        id: 'okBtn',
        text: 'OK',
        type: 'primary',
        onClick: () => {}
      }
    ]
  });
}

// Loading modal
function showLoading(message = 'Loading...') {
  return showModal({
    title: '',
    content: `
      <div class="text-center py-4">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mb-0">${message}</p>
      </div>
    `,
    size: 'small',
    showClose: false,
    buttons: []
  });
}

// Booking confirmation modal
function showBookingConfirmation(bookingData) {
  const content = `
    <div class="booking-confirmation">
      <div class="confirmation-icon">
        <i class="fas fa-check-circle text-success"></i>
      </div>
      <h3>Booking Confirmed!</h3>
      <div class="booking-details">
        <div class="detail-row">
          <span class="detail-label">Booking ID:</span>
          <span class="detail-value booking-id">${bookingData.booking_id}</span>
          <button class="btn-icon" onclick="window.helpers.copyToClipboard('${bookingData.booking_id}')" title="Copy">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div class="detail-row">
          <span class="detail-label">Serial Number:</span>
          <span class="detail-value">${bookingData.serial_number}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${helpers.formatDate(bookingData.appointment_date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estimated Time:</span>
          <span class="detail-value">${helpers.formatTime(bookingData.estimated_time)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Doctor:</span>
          <span class="detail-value">${bookingData.doctor.name}</span>
        </div>
      </div>
      <p class="confirmation-note">
        <i class="fas fa-info-circle"></i>
        Please take a screenshot of this confirmation for your visit.
      </p>
    </div>
  `;

  return showModal({
    title: 'Appointment Confirmation',
    content,
    size: 'medium',
    buttons: [
      {
        id: 'printBtn',
        text: 'Print Receipt',
        type: 'secondary',
        closeOnClick: false,
        onClick: () => window.print()
      },
      {
        id: 'whatsappBtn',
        text: 'Share on WhatsApp',
        type: 'success',
        closeOnClick: false,
        onClick: () => {
          const message = `Booking Confirmed!\nID: ${bookingData.booking_id}\nSerial: ${bookingData.serial_number}\nDate: ${helpers.formatDate(bookingData.appointment_date)}\nTime: ${helpers.formatTime(bookingData.estimated_time)}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        }
      },
      {
        id: 'doneBtn',
        text: 'Done',
        type: 'primary',
        onClick: () => {
          window.location.href = '/index.html';
        }
      }
    ]
  });
}

// Export
window.modal = {
  showModal,
  showConfirm,
  showAlert,
  showLoading,
  showBookingConfirmation
};