// Filter and Sort Functionality (Fixed & Safe)

/* =========================
   UTILS
========================= */
function toNumber(val) {
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function toBool(val) {
  return val === true || val === "true" || val === "on";
}

/* =========================
   FILTER DOCTORS
========================= */
function filterDoctors(doctors, filters = {}) {
  let filtered = [...doctors];

  const minFee = toNumber(filters.minFee);
  const maxFee = toNumber(filters.maxFee);
  const available = toBool(filters.available);
  const specialization = filters.specialization;

  if (specialization && specialization !== "all") {
    filtered = filtered.filter(d =>
      d.specialization &&
      d.specialization.toLowerCase() === specialization.toLowerCase()
    );
  }

  if (available) {
    filtered = filtered.filter(d => d.is_active === true);
  }

  if (minFee !== null || maxFee !== null) {
    filtered = filtered.filter(d => {
      const fee = Number(d.consultation_fee);
      if (minFee !== null && fee < minFee) return false;
      if (maxFee !== null && fee > maxFee) return false;
      return true;
    });
  }

  return filtered;
}

/* =========================
   SORT DOCTORS
========================= */
function sortDoctors(doctors, sortBy) {
  return [...doctors].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "fee-asc":
        return Number(a.consultation_fee) - Number(b.consultation_fee);
      case "fee-desc":
        return Number(b.consultation_fee) - Number(a.consultation_fee);
      default:
        return 0;
    }
  });
}

/* =========================
   FILTER TESTS
========================= */
function filterTests(tests, filters = {}) {
  let filtered = [...tests];

  const minPrice = toNumber(filters.minPrice);
  const maxPrice = toNumber(filters.maxPrice);
  const discountOnly = toBool(filters.discountOnly);
  const available = toBool(filters.available);

  filtered = filtered.filter(t => {
    const price = t.is_discount_active && t.discount_price
      ? Number(t.discount_price)
      : Number(t.original_price);

    if (minPrice !== null && price < minPrice) return false;
    if (maxPrice !== null && price > maxPrice) return false;
    if (discountOnly && !t.is_discount_active) return false;
    if (available && !t.is_active) return false;

    return true;
  });

  return filtered;
}

/* =========================
   SORT TESTS
========================= */
function sortTests(tests, sortBy) {
  return [...tests].sort((a, b) => {
    const priceA = a.is_discount_active && a.discount_price
      ? Number(a.discount_price)
      : Number(a.original_price);

    const priceB = b.is_discount_active && b.discount_price
      ? Number(b.discount_price)
      : Number(b.original_price);

    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "discount":
        return (b.is_discount_active === true) - (a.is_discount_active === true);
      default:
        return 0;
    }
  });
}

/* =========================
   GET SPECIALIZATIONS
========================= */
function getSpecializations(doctors) {
  return [...new Set(
    doctors
      .map(d => d.specialization)
      .filter(Boolean)
  )].sort();
}

/* =========================
   INIT FILTER UI
========================= */
function initFilterUI(containerElement, onFilterChange) {
  const form = containerElement.querySelector("form");
  if (!form) return;

  form.addEventListener("change", () => {
    const formData = new FormData(form);
    const filters = Object.fromEntries(formData.entries());
    onFilterChange(filters);
  });
}

/* =========================
   EXPORT
========================= */
window.filter = {
  filterDoctors,
  sortDoctors,
  filterTests,
  sortTests,
  getSpecializations,
  initFilterUI,
};
