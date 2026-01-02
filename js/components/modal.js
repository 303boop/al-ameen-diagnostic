// ===============================
// Modal Component (FIXED & SAFE)
// ===============================

// Create and show modal
function showModal(options = {}) {
  const {
    title = '',
    content = '',
    size = 'md', // sm | md | lg
    showClose = true,
    buttons = [],
    onClose = null
  } = options;

  // Remove existing modal
  document.getElementById('dynamicModal')?.remove();

  const modalHTML = `
    <div class="modal fade" id="dynamicModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-${size}">
        <div class="modal-content">
          ${title || showClose ? `
            <div class="modal-header">
              ${title ? `<h5 class="modal-title">${title}</h5>` : ''}
              ${showClose ? `<button type="button" class="btn-close" data-bs-dismiss="modal"></button>` : ''}
            </div>
          ` : ''}
          <div class="modal-body">
            ${content}
          </div>
          ${buttons.length ? `
            <div class="modal-footer">
              ${buttons.map(btn => `
                <button
                  type="button"
                  class="btn btn-${btn.type || 'secondary'}"
                  id="${btn.id}"
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

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modalEl = document.getElementById('dynamicModal');
  const modal = new bootstrap.Modal(modalEl, { backdrop: 'static' });

  // Button handlers
  buttons.forEach(btn => {
    if (!btn.id) return;
    const el = document.getElementById(btn.id);
    if (!el) return;

    el.addEventListener('click', () => {
      btn.onClick?.();
      if (btn.closeOnClick !== false) modal.hide();
    });
  });

  if (onClose) {
    modalEl.addEventListener('hidden.bs.modal', onClose, { once: true });
  }

  modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove(), { once: true });

  modal.show();
  return modal;
}

// Confirm dialog
function showConfirm(title, message, onConfirm, onCancel) {
  return showModal({
    title,
    content: `<p class="mb-0">${message}</p>`,
    size: 'sm',
    buttons: [
      {
        id: 'confirmCancel',
        text: 'Cancel',
        type: 'secondary',
        onClick: onCancel
      },
      {
        id: 'confirmOk',
        text: 'Confirm',
        type: 'primary',
        onClick: onConfirm
      }
    ]
  });
}

// Alert dialog
function showAlert(title, message, type = 'info') {
  const icons = {
    success: 'fa-check-circle text-success',
    error: 'fa-times-circle text-danger',
    warning: 'fa-exclamation-triangle text-warning',
    info: 'fa-info-circle text-info'
  };

  return showModal({
    title,
    content: `
      <div class="text-center">
        <i class="fas ${icons[type]} fa-3x mb-3"></i>
        <p class="mb-0">${message}</p>
      </div>
    `,
    size: 'sm',
    buttons: [
      {
        id: 'alertOk',
        text: 'OK',
        type: 'primary'
      }
    ]
  });
}

// Loading modal
function showLoading(message = 'Loading...') {
  return showModal({
    content: `
      <div class="text-center py-4">
        <div class="spinner-border text-primary mb-3"></div>
        <p class="mb-0">${message}</p>
      </div>
    `,
    size: 'sm',
    showClose: false,
    buttons: []
  });
}

// Booking confirmation modal
function showBookingConfirmation(data) {
  if (!data) return;

  const content = `
    <div class="booking-confirmation text-center">
      <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
      <h4 class="mb-3">Booking Confirmed</h4>

      <div class="booking-details text-start">
        <div class="detail-row"><strong>ID:</strong> ${data.booking_id}</div>
        <div class="detail-row"><strong>Serial:</strong> ${data.serial_number}</div>
        <div class="detail-row"><strong>Date:</strong> ${helpers?.formatDate?.(data.appointment_date) || '-'}</div>
        <div class="detail-row"><strong>Time:</strong> ${helpers?.formatTime?.(data.estimated_time) || '-'}</div>
        <div class="detail-row"><strong>Doctor:</strong> ${data.doctor?.name || '-'}</div>
      </div>

      <p class="mt-3 text-muted">
        Please keep a screenshot of this confirmation.
      </p>
    </div>
  `;

  return showModal({
    title: 'Appointment Confirmation',
    content,
    size: 'md',
    buttons: [
      {
        id: 'printReceipt',
        text: 'Print',
        type: 'secondary',
        closeOnClick: false,
        onClick: () => window.print()
      },
      {
        id: 'doneBooking',
        text: 'Done',
        type: 'primary',
        onClick: () => {
          window.location.href = './index.html';
        }
      }
    ]
  });
}

// Global export
window.modal = {
  showModal,
  showConfirm,
  showAlert,
  showLoading,
  showBookingConfirmation
};
