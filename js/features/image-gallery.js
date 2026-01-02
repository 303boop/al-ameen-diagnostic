// Image Gallery & Carousel (Fixed & Production-Safe)

const BASE_PATH = "/al-ameen-diagnostic";

/* =========================
   SAFETY HELPERS
========================= */
function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

/* =========================
   INIT SWIPER
========================= */
function initCarousel(containerElement, options = {}) {
  if (typeof Swiper === "undefined") {
    console.warn("Swiper not loaded");
    return null;
  }

  const defaultOptions = {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    },
  };

  return new Swiper(containerElement, { ...defaultOptions, ...options });
}

/* =========================
   INIT LIGHTBOX
========================= */
function initLightbox() {
  if (typeof GLightbox === "undefined") {
    console.warn("GLightbox not loaded");
    return null;
  }

  return GLightbox({
    touchNavigation: true,
    loop: true,
    autoplayVideos: true,
  });
}

/* =========================
   LOAD IMAGES FROM BUCKET
========================= */
async function loadImagesFromBucket(bucketName, folder = "") {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder);

    if (error) throw error;

    const images = data
      .filter(
        file =>
          file.name &&
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
      )
      .map(file => {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`${folder}${file.name}`);

        return {
          name: file.name,
          url: urlData.publicUrl,
        };
      });

    return { success: true, images };
  } catch (error) {
    console.error("Error loading images:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   GALLERY HTML
========================= */
function createGalleryHTML(images, lightboxClass = "glightbox") {
  return images
    .map(
      (image, index) => `
    <div class="gallery-item">
      <a href="${image.url}" class="${lightboxClass}" data-gallery="gallery">
        <img src="${image.url}" alt="Gallery image ${index + 1}" loading="lazy">
        <div class="gallery-overlay">
          <i class="fas fa-search-plus"></i>
        </div>
      </a>
    </div>
  `
    )
    .join("");
}

/* =========================
   PRODUCT CAROUSEL
========================= */
function createProductCarousel(images = []) {
  if (!images.length) {
    return `<div class="no-images">No images available</div>`;
  }

  let html = `<div class="swiper product-carousel"><div class="swiper-wrapper">`;

  images.forEach((image, index) => {
    const imageUrl = typeof image === "string" ? image : image.url;
    html += `
      <div class="swiper-slide">
        <img src="${imageUrl}" alt="Product image ${index + 1}" loading="lazy">
      </div>
    `;
  });

  html += `</div>`;

  if (images.length > 1) {
    html += `
      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    `;
  }

  html += `</div>`;
  return html;
}

/* =========================
   ITEM CAROUSEL
========================= */
function createItemCarousel(items = [], type = "doctor") {
  if (!items.length) {
    return `<div class="empty-carousel">No items available</div>`;
  }

  let html = `<div class="swiper item-carousel"><div class="swiper-wrapper">`;

  items.forEach(item => {
    html += type === "doctor"
      ? createDoctorSlide(item)
      : createTestSlide(item);
  });

  html += `
      </div>
      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  `;

  return html;
}

/* =========================
   DOCTOR SLIDE
========================= */
function createDoctorSlide(doctor) {
  return `
    <div class="swiper-slide">
      <div class="doctor-card">
        <div class="doctor-image">
          <img src="${doctor.image_url || BASE_PATH + "/assets/images/doctors/placeholder.jpg"}" alt="${doctor.name}">
        </div>
        <div class="doctor-info">
          <h3>${doctor.name}</h3>
          <p class="specialization">${doctor.specialization || ""}</p>
          <p class="fee">${formatCurrency(doctor.consultation_fee)}</p>
          <a href="${BASE_PATH}/doctor-detail.html?id=${doctor.id}" class="btn btn-primary btn-sm">
            View Profile
          </a>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   TEST SLIDE
========================= */
function createTestSlide(test) {
  const priceHTML = test.is_discount_active && test.discount_price
    ? `
      <span class="original-price">${formatCurrency(test.original_price)}</span>
      <span class="discount-price">${formatCurrency(test.discount_price)}</span>
    `
    : `<span class="price">${formatCurrency(test.original_price)}</span>`;

  return `
    <div class="swiper-slide">
      <div class="test-card">
        <div class="test-image">
          <img src="${test.image_url || BASE_PATH + "/assets/images/tests/placeholder.jpg"}" alt="${test.name}">
          ${test.is_discount_active ? '<span class="discount-badge">Discount</span>' : ''}
        </div>
        <div class="test-info">
          <h3>${test.name}</h3>
          <div class="test-price">${priceHTML}</div>
          <a href="${BASE_PATH}/test-detail.html?id=${test.id}" class="btn btn-primary btn-sm">
            View Details
          </a>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   LAZY LOAD
========================= */
function initLazyLoad() {
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: "50px" }
  );

  document
    .querySelectorAll("img[data-src]")
    .forEach(img => observer.observe(img));
}

/* =========================
   THUMBNAIL GALLERY
========================= */
function createThumbnailGallery(images, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !images.length) return;

  container.innerHTML = `
    <div class="thumbnail-gallery">
      <div class="main-preview">
        <img id="mainPreviewImage" src="${images[0]}" alt="Preview">
      </div>
      <div class="thumbnails">
        ${images
          .map(
            (img, i) => `
          <div class="thumbnail ${i === 0 ? "active" : ""}"
               onclick="gallery.changeThumbnail('${img}', this)">
            <img src="${img}" alt="Thumbnail ${i + 1}">
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

/* =========================
   CHANGE THUMBNAIL
========================= */
function changeThumbnail(imageUrl, el) {
  const main = document.getElementById("mainPreviewImage");
  if (main) main.src = imageUrl;

  document.querySelectorAll(".thumbnail").forEach(t =>
    t.classList.remove("active")
  );
  el.classList.add("active");
}

/* =========================
   BEFORE / AFTER SLIDER
========================= */
function initBeforeAfterSlider(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const beforeImage = container.querySelector(".before-image");
  const handle = container.querySelector(".slider-handle");

  let active = false;

  const move = e => {
    if (!active) return;
    const rect = container.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pct = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    beforeImage.style.width = pct + "%";
    handle.style.left = pct + "%";
  };

  handle.addEventListener("mousedown", () => (active = true));
  handle.addEventListener("touchstart", () => (active = true));
  document.addEventListener("mouseup", () => (active = false));
  document.addEventListener("touchend", () => (active = false));
  document.addEventListener("mousemove", move);
  document.addEventListener("touchmove", move);
}

/* =========================
   EXPORT
========================= */
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
  initBeforeAfterSlider,
};
