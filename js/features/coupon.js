// Coupon Management (Fixed & Production-Safe)

/* =========================
   SAFETY CHECKS
========================= */
if (!window.supabase) {
  console.error("❌ Supabase not initialized");
}

/* =========================
   HELPERS (LOCAL)
========================= */
function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

function showToast(type, message) {
  if (window.toast && typeof window.toast[type] === "function") {
    window.toast[type](message);
  } else {
    console.log(`[${type.toUpperCase()}]`, message);
  }
}

/* =========================
   VALIDATE COUPON
========================= */
async function validateCoupon(couponCode) {
  try {
    if (!couponCode || !couponCode.trim()) {
      return { success: false, error: "Please enter a coupon code" };
    }

    const code = couponCode.trim().toUpperCase();
    const today = new Date().toISOString();

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .single();

    if (error || !data) {
      return { success: false, error: "Invalid or expired coupon code" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return { success: false, error: "Failed to validate coupon" };
  }
}

/* =========================
   CALCULATE DISCOUNT
========================= */
function calculateDiscount(originalPrice, coupon) {
  if (!coupon) return 0;

  const price = Number(originalPrice);
  const value = Number(coupon.discount_value);

  if (coupon.discount_type === "percent") {
    return (price * value) / 100;
  }

  if (coupon.discount_type === "flat") {
    return value;
  }

  return 0;
}

/* =========================
   APPLY DISCOUNT
========================= */
function applyDiscount(originalPrice, coupon) {
  const discount = calculateDiscount(originalPrice, coupon);
  const final = Math.max(Number(originalPrice) - discount, 0);

  return {
    original: Number(originalPrice),
    discount,
    final,
    savings: discount,
  };
}

/* =========================
   FORMAT DISPLAY
========================= */
function formatCouponDisplay(coupon) {
  if (!coupon) return "";

  return coupon.discount_type === "percent"
    ? `${coupon.discount_value}% OFF`
    : `${formatCurrency(coupon.discount_value)} OFF`;
}

/* =========================
   INIT COUPON INPUT
========================= */
function initCouponInput(inputEl, buttonEl, priceEl, originalPrice) {
  let appliedCoupon = null;
  let isApplied = false;

  async function applyHandler() {
    const code = inputEl.value.trim();
    if (!code) {
      showToast("error", "Please enter a coupon code");
      return;
    }

    buttonEl.disabled = true;
    buttonEl.textContent = "Applying...";

    const result = await validateCoupon(code);

    if (!result.success) {
      showToast("error", result.error);
      buttonEl.disabled = false;
      buttonEl.textContent = "Apply";
      return;
    }

    appliedCoupon = result.data;
    const pricing = applyDiscount(originalPrice, appliedCoupon);

    priceEl.innerHTML = `
      <span class="original-price">${formatCurrency(pricing.original)}</span>
      <span class="final-price">${formatCurrency(pricing.final)}</span>
      <span class="savings">You save ${formatCurrency(pricing.savings)}</span>
    `;

    showToast("success", `Coupon applied: ${formatCouponDisplay(appliedCoupon)}`);

    inputEl.disabled = true;
    buttonEl.textContent = "Remove";
    buttonEl.classList.add("btn-danger");
    buttonEl.disabled = false;
    isApplied = true;
  }

  function removeHandler() {
    appliedCoupon = null;
    isApplied = false;

    priceEl.textContent = formatCurrency(originalPrice);
    inputEl.value = "";
    inputEl.disabled = false;
    buttonEl.textContent = "Apply";
    buttonEl.classList.remove("btn-danger");

    showToast("info", "Coupon removed");
  }

  buttonEl.addEventListener("click", () => {
    isApplied ? removeHandler() : applyHandler();
  });

  return {
    getAppliedCoupon: () => appliedCoupon,
    reset: () => removeHandler(),
  };
}

/* =========================
   GET ACTIVE COUPONS
========================= */
async function getActiveCoupons() {
  try {
    const today = new Date().toISOString();

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   EXPORT
========================= */
window.coupon = {
  validateCoupon,
  calculateDiscount,
  applyDiscount,
  formatCouponDisplay,
  initCouponInput,
  getActiveCoupons,
};
