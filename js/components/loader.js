// Loading Indicators

// Show full page loader
function showPageLoader(message = 'Loading...') {
  // Remove existing loader
  hidePageLoader();

  const loaderHTML = `
    <div class="page-loader" id="pageLoader">
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <p class="loader-message">${message}</p>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', loaderHTML);
  document.body.style.overflow = 'hidden';
}

// Hide full page loader
function hidePageLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.remove();
    document.body.style.overflow = '';
  }
}

// Show section loader
function showSectionLoader(sectionElement, message = 'Loading...') {
  const loaderHTML = `
    <div class="section-loader">
      <div class="loader-spinner"></div>
      <p class="loader-message">${message}</p>
    </div>
  `;

  sectionElement.style.position = 'relative';
  sectionElement.insertAdjacentHTML('beforeend', loaderHTML);
}

// Hide section loader
function hideSectionLoader(sectionElement) {
  const loader = sectionElement.querySelector('.section-loader');
  if (loader) {
    loader.remove();
  }
}

// Create skeleton loader
function createSkeletonLoader(type = 'card', count = 3) {
  let skeletonHTML = '';

  switch (type) {
    case 'card':
      for (let i = 0; i < count; i++) {
        skeletonHTML += `
          <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-line skeleton-title"></div>
              <div class="skeleton-line skeleton-text"></div>
              <div class="skeleton-line skeleton-text short"></div>
            </div>
          </div>
        `;
      }
      break;

    case 'list':
      for (let i = 0; i < count; i++) {
        skeletonHTML += `
          <div class="skeleton-list-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-list-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        `;
      }
      break;

    case 'table':
      skeletonHTML = `
        <div class="skeleton-table">
          ${Array(count).fill('').map(() => `
            <div class="skeleton-table-row">
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
            </div>
          `).join('')}
        </div>
      `;
      break;
  }

  return skeletonHTML;
}

// Show inline loader (for buttons)
function showButtonLoader(buttonElement) {
  buttonElement.disabled = true;
  buttonElement.dataset.originalText = buttonElement.innerHTML;
  buttonElement.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2"></span>
    Loading...
  `;
}

// Hide inline loader
function hideButtonLoader(buttonElement) {
  buttonElement.disabled = false;
  if (buttonElement.dataset.originalText) {
    buttonElement.innerHTML = buttonElement.dataset.originalText;
    delete buttonElement.dataset.originalText;
  }
}

// Progress bar
function showProgressBar(percentage) {
  let progressBar = document.getElementById('globalProgressBar');
  
  if (!progressBar) {
    const progressHTML = `
      <div class="global-progress-bar" id="globalProgressBar">
        <div class="progress-bar-fill" id="progressBarFill"></div>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', progressHTML);
    progressBar = document.getElementById('globalProgressBar');
  }

  const fill = document.getElementById('progressBarFill');
  fill.style.width = `${percentage}%`;

  if (percentage >= 100) {
    setTimeout(() => {
      progressBar.remove();
    }, 500);
  }
}

// Shimmer effect for images
function addImageShimmer(imgElement) {
  imgElement.classList.add('loading');
  
  imgElement.addEventListener('load', () => {
    imgElement.classList.remove('loading');
    imgElement.classList.add('loaded');
  });

  imgElement.addEventListener('error', () => {
    imgElement.classList.remove('loading');
    imgElement.src = '/assets/images/placeholder.jpg';
  });
}

// Export
window.loader = {
  showPageLoader,
  hidePageLoader,
  showSectionLoader,
  hideSectionLoader,
  createSkeletonLoader,
  showButtonLoader,
  hideButtonLoader,
  showProgressBar,
  addImageShimmer
};