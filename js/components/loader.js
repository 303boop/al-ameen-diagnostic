/* =========================================
   LOADER & SKELETON UTILITIES
   ========================================= */

const Loader = {
    
    // -------------------------------------
    // 1. FULL PAGE LOADER
    // -------------------------------------
    showPageLoader(message = 'Loading...') {
        this.hidePageLoader(); // Prevent duplicates

        const loaderHTML = `
            <div class="page-loader" id="globalPageLoader">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
                    <p class="mt-3 text-muted fw-bold">${message}</p>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', loaderHTML);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    },

    hidePageLoader() {
        const loader = document.getElementById('globalPageLoader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
                document.body.style.overflow = '';
            }, 300); // Wait for fade out
        }
    },

    // -------------------------------------
    // 2. SECTION LOADER (Overlay)
    // -------------------------------------
    showSectionLoader(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Ensure parent is relative
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }

        const loaderHTML = `
            <div class="section-loader" id="loader-${elementId}">
                <div class="spinner-border text-primary" role="status"></div>
            </div>
        `;
        
        // Add styling dynamically if not in CSS
        const style = document.createElement('style');
        style.innerHTML = `
            .section-loader {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255,255,255,0.8); z-index: 10;
                display: flex; align-items: center; justify-content: center;
                border-radius: inherit;
            }
        `;
        document.head.appendChild(style);

        element.insertAdjacentHTML('beforeend', loaderHTML);
    },

    hideSectionLoader(elementId) {
        const loader = document.getElementById(`loader-${elementId}`);
        if (loader) loader.remove();
    },

    // -------------------------------------
    // 3. BUTTON STATE
    // -------------------------------------
    showButtonLoader(btnElement) {
        if (!btnElement) return;

        // Save original content width to prevent layout jump
        const width = btnElement.offsetWidth;
        btnElement.style.minWidth = `${width}px`;
        
        btnElement.dataset.originalContent = btnElement.innerHTML;
        btnElement.disabled = true;
        btnElement.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading...
        `;
    },

    hideButtonLoader(btnElement) {
        if (!btnElement) return;

        btnElement.disabled = false;
        if (btnElement.dataset.originalContent) {
            btnElement.innerHTML = btnElement.dataset.originalContent;
            delete btnElement.dataset.originalContent;
        }
        btnElement.style.minWidth = ''; // Reset width
    },

    // -------------------------------------
    // 4. SKELETON GENERATOR
    // -------------------------------------
    createSkeleton(type = 'card', count = 1) {
        let html = '';

        const cardSkeleton = `
            <div class="col">
                <div class="card border-0 shadow-sm" aria-hidden="true">
                    <div class="skeleton-loading" style="height: 180px; width: 100%;"></div>
                    <div class="card-body">
                        <div class="skeleton-loading mb-2" style="height: 20px; width: 80%;"></div>
                        <div class="skeleton-loading" style="height: 15px; width: 60%;"></div>
                    </div>
                </div>
            </div>
        `;

        const listSkeleton = `
            <div class="d-flex align-items-center mb-3">
                <div class="skeleton-loading rounded-circle me-3" style="width: 50px; height: 50px;"></div>
                <div class="flex-grow-1">
                    <div class="skeleton-loading mb-2" style="height: 15px; width: 40%;"></div>
                    <div class="skeleton-loading" style="height: 10px; width: 30%;"></div>
                </div>
            </div>
        `;

        for (let i = 0; i < count; i++) {
            if (type === 'card') html += cardSkeleton;
            else if (type === 'list') html += listSkeleton;
        }

        return html;
    }
};

// Global Export
window.loader = Loader;