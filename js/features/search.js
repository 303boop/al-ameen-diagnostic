// Search Functionality (Fixed & Production-Safe)

const BASE_PATH = "/al-ameen-diagnostic";

/* =========================
   LOCAL HELPERS
========================= */

// Simple debounce
function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

/* =========================
   SEARCH CORE
========================= */
async function performSearch(query) {
  if (!query || query.trim().length < 2) {
    return { success: true, data: { doctors: [], tests: [], total: 0 } };
  }

  const searchTerm = query.trim().toLowerCase();

  try {
    // Doctors
    const { data: doctors, error: doctorError } = await supabase
      .from("doctors")
      .select("id, name, specialization, image_url")
      .eq("is_active", true)
      .or(`name.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`)
      .limit(5);

    if (doctorError) throw doctorError;

    // Tests
    const { data: tests, error: testError } = await supabase
      .from("tests")
      .select(
        "id, name, description, original_price, discount_price, is_discount_active"
      )
      .eq("is_active", true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(5);

    if (testError) throw testError;

    return {
      success: true,
      data: {
        doctors: doctors || [],
        tests: tests || [],
        total: (doctors?.length || 0) + (tests?.length || 0),
      },
    };
  } catch (error) {
    console.error("Search error:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   DEBOUNCED SEARCH
========================= */
const debouncedSearch = debounce(performSearch, 300);

/* =========================
   AUTOCOMPLETE INIT
========================= */
function initSearchAutocomplete(inputEl, resultsEl) {
  if (!inputEl || !resultsEl) return;

  inputEl.addEventListener("input", async e => {
    const query = e.target.value;

    if (!query || query.trim().length < 2) {
      resultsEl.innerHTML = "";
      resultsEl.classList.remove("show");
      return;
    }

    resultsEl.innerHTML =
      '<div class="search-loading">Searching…</div>';
    resultsEl.classList.add("show");

    const result = await debouncedSearch(query);

    if (!result?.success) {
      resultsEl.innerHTML =
        '<div class="search-error">Search failed</div>';
      return;
    }

    displaySearchResults(result.data, resultsEl);
  });

  document.addEventListener("click", e => {
    if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
      resultsEl.classList.remove("show");
    }
  });
}

/* =========================
   RENDER RESULTS
========================= */
function displaySearchResults(data, container) {
  if (!data || data.total === 0) {
    container.innerHTML =
      '<div class="search-empty">No results found</div>';
    return;
  }

  let html = "";

  // Doctors
  if (data.doctors.length) {
    html += `
      <div class="search-section">
        <div class="search-section-title">Doctors</div>
    `;

    data.doctors.forEach(d => {
      html += `
        <a href="${BASE_PATH}/doctor-detail.html?id=${d.id}" class="search-result-item">
          <img src="${d.image_url || BASE_PATH + "/assets/images/doctors/placeholder.jpg"}" alt="${d.name}">
          <div>
            <div class="search-result-name">${d.name}</div>
            <div class="search-result-meta">${d.specialization || ""}</div>
          </div>
        </a>
      `;
    });

    html += "</div>";
  }

  // Tests
  if (data.tests.length) {
    html += `
      <div class="search-section">
        <div class="search-section-title">Tests</div>
    `;

    data.tests.forEach(t => {
      const price = t.is_discount_active && t.discount_price
        ? `
          <span class="original-price">${formatCurrency(t.original_price)}</span>
          ${formatCurrency(t.discount_price)}
        `
        : formatCurrency(t.original_price);

      html += `
        <a href="${BASE_PATH}/test-detail.html?id=${t.id}" class="search-result-item">
          <div>
            <div class="search-result-name">${t.name}</div>
            <div class="search-result-meta">${price}</div>
          </div>
        </a>
      `;
    });

    html += "</div>";
  }

  container.innerHTML = html;
}

/* =========================
   EXPORT
========================= */
window.search = {
  performSearch,
  debouncedSearch,
  initSearchAutocomplete,
};
