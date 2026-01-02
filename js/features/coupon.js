// Coupon Management

// Validate and apply coupon
async function validateCoupon(couponCode) {
  try {
    if (!couponCode || couponCode.trim().length === 0) {
      return { success: false, error: 'Please enter a coupon code' };
    }

    const code = couponCode.trim().toUpperCase();

    // Fetch coupon from database
    const { data, error } = await supabaseClient
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid coupon code' };
    }

    // Check expiry
    if (data.expires_at) {
      const expiryDate = new Date(data.expires_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        return { success: false, error: 'Coupon has expired' };
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('Coupon validation error:', error);
    return { success: false, error: 'Failed to validate coupon' };
  }
}

// Calculate discount
function calculateDiscount(originalPrice, coupon) {
  if (!coupon) return 0;

  if (coupon.discount_type === 'percent') {
    return (parseFloat(originalPrice) * parseFloat(coupon.discount_value)) / 100;
  } else if (coupon.discount_type === 'flat') {
    return parseFloat(coupon.discount_value);
  }

  return 0;
}

// Apply coupon to price
function applyDiscount(originalPrice, coupon) {
  const discount = calculateDiscount(originalPrice, coupon);
  const finalPrice = parseFloat(originalPrice) - discount;
  
  return {
    original: parseFloat(originalPrice),
    discount: discount,
    final: finalPrice > 0 ? finalPrice : 0,
    savings: discount
  };
}

// Format coupon for display
function formatCouponDisplay(coupon) {
  if (!coupon) return '';

  if (coupon.discount_type === 'percent') {
    return `${coupon.discount_value}% OFF`;
  } else {
    return `${helpers.formatCurrency(coupon.discount_value)} OFF`;
  }
}

// Initialize coupon input
function initCouponInput(inputElement, applyButton, priceElement, originalPrice) {
  let appliedCoupon = null;

  applyButton.addEventListener('click', async () => {
    const code = inputElement.value.trim();

    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    // Show loading
    applyButton.disabled = true;
    applyButton.textContent = 'Applying...';

    // Validate coupon
    const result = await validateCoupon(code);

    if (!result.success) {
      toast.error(result.error);
      applyButton.disabled = false;
      applyButton.textContent = 'Apply';
      return;
    }

    // Apply coupon
    appliedCoupon = result.data;
    const pricing = applyDiscount(originalPrice, appliedCoupon);

    // Update UI
    priceElement.innerHTML = `
      <span class="original-price">${helpers.formatCurrency(pricing.original)}</span>
      <span class="final-price">${helpers.formatCurrency(pricing.final)}</span>
      <span class="savings">You save ${helpers.formatCurrency(pricing.savings)}!</span>
    `;

    toast.success(`Coupon applied: ${formatCouponDisplay(appliedCoupon)}`);

    // Change button to "Remove"
    applyButton.textContent = 'Remove';
    applyButton.classList.add('btn-danger');
    inputElement.disabled = true;

    // Handle remove
    applyButton.onclick = () => {
      appliedCoupon = null;
      priceElement.innerHTML = helpers.formatCurrency(originalPrice);
      inputElement.value = '';
      inputElement.disabled = false;
      applyButton.textContent = 'Apply';
      applyButton.classList.remove('btn-danger');
      toast.info('Coupon removed');
    };
  });

  return {
    getAppliedCoupon: () => appliedCoupon,
    reset: () => {
      appliedCoupon = null;
      inputElement.value = '';
      inputElement.disabled = false;
      applyButton.textContent = 'Apply';
      applyButton.classList.remove('btn-danger');
      applyButton.disabled = false;
    }
  };
}

// Get active coupons (for display)
async function getActiveCoupons() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseClient
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return { success: false, error: error.message };
  }
}

// Export
window.coupon = {
  validateCoupon,
  calculateDiscount,
  applyDiscount,
  formatCouponDisplay,
  initCouponInput,
  getActiveCoupons
};