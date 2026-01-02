// Search Functionality

// Debounced search
const debouncedSearch = helpers.debounce(performSearch, 300);

// Search across doctors, tests, and departments
async function performSearch(query) {
  if (!query || query.trim().length < 2) {
    return { success: true, data: { doctors: [], tests: [], total: 0 } };
  }

  const searchTerm = query.trim().toLowerCase();

  try {
    // Search doctors
    const { data: doctors, error: doctorError } = await supabaseClient
      .from('doctors')
      .select('id, name, specialization, image_url')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`)
      .limit(5);

    if (doctorError) throw doctorError;

    // Search tests
    const { data: tests, error: testError } = await supabaseClient
      .from('tests')
      .select('id, name, description, original_price, discount_price, is_discount_active')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(5);

    if (testError) throw testError;

    return {
      success: true,
      data: {
        doctors: doctors || [],
        tests: tests || [],
        total: (doctors?.length || 0) + (tests?.length || 0)
      }
    };
  } catch (error) {
    console.error('Search error:', error);
    return { success: false, error: error.message };
  }
}

// Search with autocomplete
function initSearchAutocomplete(inputElement, resultsContainer) {
  inputElement.addEventListener('input', async (e) => {
    const query = e.target.value;

    if (!query || query.trim().length < 2) {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.remove('show');
      return;
    }

    // Show loading
    resultsContainer.innerHTML = '<div class="search-loading">Searching...</div>';
    resultsContainer.classList.add('show');

    // Perform search
    const result = await performSearch(query);

    if (!result.success) {
      resultsContainer.innerHTML = '<div class="search-error">Search failed</div>';
      return;
    }

    // Display results
    displaySearchResults(result.data, resultsContainer);
  });

  // Close results on outside click
  document.addEventListener('click', (e) => {
    if (!inputElement.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.classList.remove('show');
    }
  });
}

// Display search results
function displaySearchResults(data, container) {
  if (data.total === 0) {
    container.innerHTML = '<div class="search-empty">No results found</div>';
    return;
  }

  let html = '';

  // Doctors section
  if (data.doctors.length > 0) {
    html += '<div class="search-section">';
    html += '<div class="search-section-title">Doctors</div>';
    data.doctors.forEach(doctor => {
      html += `
        <a href="/doctor-detail.html?id=${doctor.id}" class="search-result-item">
          <img src="${doctor.image_url || '/assets/images/doctors/placeholder.jpg'}" alt="${doctor.name}">
          <div>
            <div class="search-result-name">${doctor.name}</div>
            <div class="search-result-meta">${doctor.specialization}</div>
          </div>
        </a>
      `;
    });
    html += '</div>';
  }

  // Tests section
  if (data.tests.length > 0) {
    html += '<div class="search-section">';
    html += '<div class="search-section-title">Tests</div>';
    data.tests.forEach(test => {
      const price = test.is_discount_active && test.discount_price
        ? `<span class="original-price">${helpers.formatCurrency(test.original_price)}</span> ${helpers.formatCurrency(test.discount_price)}`
        : helpers.formatCurrency(test.original_price);

      html += `
        <a href="/test-detail.html?id=${test.id}" class="search-result-item">
          <div>
            <div class="search-result-name">${test.name}</div>
            <div class="search-result-meta">${price}</div>
          </div>
        </a>
      `;
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

// Export
window.search = {
  performSearch,
  debouncedSearch,
  initSearchAutocomplete
};