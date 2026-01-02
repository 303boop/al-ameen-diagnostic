// Image Gallery & Carousel

// Initialize Swiper carousel
function initCarousel(containerElement, options = {}) {
  const defaultOptions = {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 3,
      },
      1024: {
        slidesPerView: 4,
      },
    }
  };

  return new Swiper(containerElement, { ...defaultOptions, ...options });
}

// Initialize lightbox
function initLightbox() {
  const lightbox = GLightbox({
    touchNavigation: true,
    loop: true,
    autoplayVideos: true
  });
  return lightbox;
}

// Load images from storage bucket
async function loadImagesFromBucket(bucketName, folder = '') {
  try {
    const { data, error } = await supabaseClient
      .storage
      .from(bucketName)
      .list(folder);

    if (error) throw error;

    const images = data
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
      .map(file => {
        const { data: urlData } = supabaseClient
          .storage
          .from(bucketName)
          .getPublicUrl(`${folder}${file.name}`);
        
        return {
          name: file.name,
          url: urlData.publicUrl
        };
      });

    return { success: true, images };
  } catch (error) {
    console.error('Error loading images:', error);
    return { success: false, error: error.message };
  }
}

// Create image gallery HTML
function createGalleryHTML(images, lightboxClass = 'glightbox') {
  let html = '';
  
  images.forEach((image, index) => {
    html += `
      <div class="gallery-item">
        <a href="${image.url}" class="${lightboxClass}" data-gallery="gallery">
          <img src="${image.url}" alt="Gallery image ${index + 1}" loading="lazy">
          <div class="gallery-overlay">
            <i class="fas fa-search-plus"></i>
          </div>
        </a>
      </div>
    `;
  });

  return html;
}

// Create carousel HTML for product images (tests/doctors)
function createProductCarousel(images) {
  if (!images || images.length === 0) {
    return '<div class="no-images">No images available</div>';
  }

  let html = '<div class="swiper product-carousel">';
  html += '<div class="swiper-wrapper">';
  
  images.forEach((image, index) => {
    const imageUrl = typeof image === 'string' ? image : image.url;
    html += `
      <div class="swiper-slide">
        <img src="${imageUrl}" alt="Product image ${index + 1}" loading="lazy">
      </div>
    `;
  });
  
  html += '</div>';
  
  // Only add navigation if more than 1 image
  if (images.length > 1) {
    html += '<div class="swiper-pagination"></div>';
    html += '<div class="swiper-button-prev"></div>';
    html += '<div class="swiper-button-next"></div>';
  }
  
  html += '</div>';
  
  return html;
}

// Create doctor/test card carousel
function createItemCarousel(items, type = 'doctor') {
  if (!items || items.length === 0) {
    return '<div class="empty-carousel">No items available</div>';
  }

  let html = '<div class="swiper item-carousel">';
  html += '<div class="swiper-wrapper">';
  
  items.forEach(item => {
    if (type === 'doctor') {
      html += createDoctorSlide(item);
    } else if (type === 'test') {
      html += createTestSlide(item);
    }
  });
  
  html += '</div>';
  html += '<div class="swiper-pagination"></div>';
  html += '<div class="swiper-button-prev"></div>';
  html += '<div class="swiper-button-next"></div>';
  html += '</div>';
  
  return html;
}

// Create doctor slide HTML
function createDoctorSlide(doctor) {
  return `
    <div class="swiper-slide">
      <div class="doctor-card">
        <div class="doctor-image">
          <img src="${doctor.image_url || '/assets/images/doctors/placeholder.jpg'}" alt="${doctor.name}">
        </div>
        <div class="doctor-info">
          <h3>${doctor.name}</h3>
          <p class="specialization">${doctor.specialization}</p>
          <p class="fee">${helpers.formatCurrency(doctor.consultation_fee)}</p>
          <a href="/doctor-detail.html?id=${doctor.id}" class="btn btn-primary btn-sm">
            View Profile
          </a>
        </div>
      </div>
    </div>
  `;
}

// Create test slide HTML
function createTestSlide(test) {
  const price = test.is_discount_active && test.discount_price
    ? `<span class="original-price">${helpers.formatCurrency(test.original_price)}</span>
       <span class="discount-price">${helpers.formatCurrency(test.discount_price)}</span>`
    : `<span class="price">${helpers.formatCurrency(test.original_price)}</span>`;

  return `
    <div class="swiper-slide">
      <div class="test-card">
        <div class="test-image">
          <img src="${test.image_url || '/assets/images/tests/placeholder.jpg'}" alt="${test.name}">
          ${test.is_discount_active ? '<span class="discount-badge">Discount</span>' : ''}
        </div>
        <div class="test-info">
          <h3>${test.name}</h3>
          <div class="test-price">${price}</div>
          <a href="/test-detail.html?id=${test.id}" class="btn btn-primary btn-sm">
            View Details
          </a>
        </div>
      </div>
    </div>
  `;
}

// Lazy load images on scroll
function initLazyLoad() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Load background image
          if (img.dataset.bgSrc) {
            img.style.backgroundImage = `url(${img.dataset.bgSrc})`;
            img.removeAttribute('data-bg-src');
          }
          
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src], [data-bg-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Create thumbnail gallery with preview
function createThumbnailGallery(images, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !images || images.length === 0) return;

  let html = '<div class="thumbnail-gallery">';
  
  // Main preview image
  html += `
    <div class="main-preview">
      <img id="mainPreviewImage" src="${images[0]}" alt="Preview">
    </div>
  `;
  
  // Thumbnails
  html += '<div class="thumbnails">';
  images.forEach((image, index) => {
    const activeClass = index === 0 ? 'active' : '';
    html += `
      <div class="thumbnail ${activeClass}" onclick="window.gallery.changeThumbnail('${image}', this)">
        <img src="${image}" alt="Thumbnail ${index + 1}">
      </div>
    `;
  });
  html += '</div>';
  
  html += '</div>';
  
  container.innerHTML = html;
}

// Change thumbnail preview
function changeThumbnail(imageUrl, thumbnailElement) {
  const mainImage = document.getElementById('mainPreviewImage');
  if (mainImage) {
    mainImage.src = imageUrl;
  }
  
  // Update active thumbnail
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.classList.remove('active');
  });
  thumbnailElement.classList.add('active');
}

// Initialize before/after slider
function initBeforeAfterSlider(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const slider = container.querySelector('.before-after-slider');
  const beforeImage = container.querySelector('.before-image');
  const handle = container.querySelector('.slider-handle');

  let isDown = false;

  const move = (e) => {
    if (!isDown) return;
    
    const rect = container.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const percent = (x / rect.width) * 100;
    
    if (percent >= 0 && percent <= 100) {
      beforeImage.style.width = percent + '%';
      handle.style.left = percent + '%';
    }
  };

  handle.addEventListener('mousedown', () => isDown = true);
  handle.addEventListener('touchstart', () => isDown = true);
  
  document.addEventListener('mouseup', () => isDown = false);
  document.addEventListener('touchend', () => isDown = false);
  
  document.addEventListener('mousemove', move);
  document.addEventListener('touchmove', move);
}

// Export
window.gallery = {
  initCarousel,
  initLightbox,
  loadImagesFromBucket,
  createGalleryHTML,
  createProductCarousel,
  createItemCarousel,
  createDoctorSlide,
  createTestSlide,
  initLazyLoad,
  createThumbnailGallery,
  changeThumbnail,
  initBeforeAfterSlider
};