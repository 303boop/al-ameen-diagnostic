/* =========================================
   DYNAMIC MODAL COMPONENT (Bootstrap 5)
   ========================================= */

const Modal = {
    
    // Core function to create and show any modal
    show({ title = '', body = '', footer = '', size = 'md', staticBackdrop = false }) {
        // 1. cleanup old modal if exists
        const existingModal = document.getElementById('dynamicModal');
        if (existingModal) existingModal.remove();

        // 2. Template
        const modalHtml = `
            <div class="modal fade" id="dynamicModal" tabindex="-1" aria-hidden="true" ${staticBackdrop ? 'data-bs-backdrop="static"' : ''}>
                <div class="modal-dialog modal-dialog-centered modal-${size}">
                    <div class="modal-content border-0 shadow-lg">
                        ${title ? `
                        <div class="modal-header border-bottom-0">
                            <h5 class="modal-title fw-bold">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        ` : ''}
                        
                        <div class="modal-body p-4">
                            ${body}
                        </div>

                        ${footer ? `
                        <div class="modal-footer border-top-0 bg-light">
                            ${footer}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // 3. Inject to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 4. Initialize Bootstrap Modal
        const modalElement = document.getElementById('dynamicModal');
        const bsModal = new bootstrap.Modal(modalElement);

        // 5. Show
        bsModal.show();

        // 6. Cleanup on close
        modalElement.addEventListener('hidden.bs.modal', () => {
            bsModal.dispose(); // Destroy instance
            modalElement.remove(); // Remove from DOM
        });

        return {
            element: modalElement,
            instance: bsModal,
            hide: () => bsModal.hide()
        };
    },

    // --- SHORTCUTS ---

    // Simple Alert
    alert(message, title = 'Alert') {
        return this.show({
            title,
            body: `<p class="mb-0 text-secondary">${message}</p>`,
            footer: `<button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">OK</button>`,
            size: 'sm'
        });
    },

    // Confirmation Dialog (Returns Promise)
    confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = this.show({
                title,
                body: `<p class="mb-0 text-secondary">${message}</p>`,
                footer: `
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger px-4" id="confirmBtn">Confirm</button>
                `,
                size: 'sm',
                staticBackdrop: true
            });

            // Handle Confirm Click
            const confirmBtn = modal.element.querySelector('#confirmBtn');
            confirmBtn.addEventListener('click', () => {
                resolve(true);
                modal.instance.hide();
            });

            // Handle Cancel/Close (Resolve false)
            modal.element.addEventListener('hidden.bs.modal', () => {
                resolve(false);
            }, { once: true });
        });
    },

    // Success Message
    success(message) {
        this.show({
            body: `
                <div class="text-center py-3">
                    <div class="mb-3 text-success">
                        <i class="fas fa-check-circle fa-4x"></i>
                    </div>
                    <h4 class="fw-bold">Success!</h4>
                    <p class="text-muted">${message}</p>
                    <button type="button" class="btn btn-success px-5 mt-3" data-bs-dismiss="modal">Great</button>
                </div>
            `,
            size: 'sm'
        });
    },

    // Error Message
    error(message) {
        this.show({
            body: `
                <div class="text-center py-3">
                    <div class="mb-3 text-danger">
                        <i class="fas fa-times-circle fa-4x"></i>
                    </div>
                    <h4 class="fw-bold">Error</h4>
                    <p class="text-muted">${message}</p>
                    <button type="button" class="btn btn-danger px-5 mt-3" data-bs-dismiss="modal">Close</button>
                </div>
            `,
            size: 'sm'
        });
    }
};

// Global Export
window.Modal = Modal;