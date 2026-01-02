// Filter and Sort Functionality

// Filter doctors
function filterDoctors(doctors, filters) {
  let filtered = [...doctors];

  // Filter by specialization
  if (filters.specialization && filters.specialization !== 'all') {
    filtered = filtered.filter(d => 
      d.specialization.toLowerCase() === filters.specialization.toLowerCase()
    );
  }

  // Filter by availability
  if (filters.available) {
    filtered = filtered.filter(d => d.is_active);
  }

  // Filter by fee range
  if (filters.minFee || filters.maxFee) {
    filtered = filtered.filter(d => {
      const fee = parseFloat(d.consultation_fee);
      if (filters.minFee && fee < filters.minFee) return false;
      if (filters.maxFee && fee > filters.maxFee) return false;
      return true;
    });
  }

  return filtered;
}

// Sort doctors
function sortDoctors(doctors, sortBy) {
  const sorted = [...doctors];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'fee-asc':
      return sorted.sort((a, b) => 
        parseFloat(a.consultation_fee) - parseFloat(b.consultation_fee)
      );
    case 'fee-desc':
      return sorted.sort((a, b) => 
        parseFloat(b.consultation_fee) - parseFloat(a.consultation_fee)
      );
    default:
      return sorted;
  }
}

// Filter tests
function filterTests(tests, filters) {
  let filtered = [...tests];

  // Filter by price range
  if (filters.minPrice || filters.maxPrice) {
    filtered = filtered.filter(t => {
      const price = t.is_discount_active && t.discount_price
        ? parseFloat(t.discount_price)
        : parseFloat(t.original_price);
      
      if (filters.minPrice && price < filters.minPrice) return false;
      if (filters.maxPrice && price > filters.maxPrice) return false;
      return true;
    });
  }

  // Filter by discount
  if (filters.discountOnly) {
    filtered = filtered.filter(t => t.is_discount_active);
  }

  // Filter by availability
  if (filters.available) {
    filtered = filtered.filter(t => t.is_active);
  }

  return filtered;
}

// Sort tests
function sortTests(tests, sortBy) {
  const sorted = [...tests];

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = a.is_discount_active && a.discount_price
          ? parseFloat(a.discount_price)
          : parseFloat(a.original_price);
        const priceB = b.is_discount_active && b.discount_price
          ? parseFloat(b.discount_price)
          : parseFloat(b.original_price);
        return priceA - priceB;
      });
    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = a.is_discount_active && a.discount_price
          ? parseFloat(a.discount_price)
          : parseFloat(a.original_price);
        const priceB = b.is_discount_active && b.discount_price
          ? parseFloat(b.discount_price)
          : parseFloat(b.original_price);
        return priceB - priceA;
      });
    case 'discount':
      return sorted.sort((a, b) => {
        if (a.is_discount_active && !b.is_discount_active) return -1;
        if (!a.is_discount_active && b.is_discount_active) return 1;
        return 0;
      });
    default:
      return sorted;
  }
}

// Get unique specializations from doctors
function getSpecializations(doctors) {
  const specializations = [...new Set(doctors.map(d => d.specialization))];
  return specializations.sort();
}

// Initialize filter UI
function initFilterUI(containerElement, onFilterChange) {
  const filterForm = containerElement.querySelector('form');
  
  if (filterForm) {
    filterForm.addEventListener('change', () => {
      const formData = new FormData(filterForm);
      const filters = Object.fromEntries(formData);
      onFilterChange(filters);
    });
  }
}

// Export
window.filter = {
  filterDoctors,
  sortDoctors,
  filterTests,
  sortTests,
  getSpecializations,
  initFilterUI
};