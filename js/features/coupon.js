// js/features/coupon.js

// =====================================================
// Coupon Logic Controller
// =====================================================

// Guard: Ensure Supabase is loaded
const getSupabase = () => window.supabase;

const CouponManager = {
    
    // --- 1. VALIDATION ---
    async validateCoupon(code) {
        const sb = getSupabase();
        if (!code) return { success: false, error: "Please enter a code." };

        try {
            const today = new Date().toISOString().split('T')[0]; // Fix: YYYY-MM-DD only

            // Check if code exists, is active, and date is valid (or null)
            const { data, error } = await sb
                .from('coupons')
                .select('*')
                .eq('code', code.toUpperCase()) // Force uppercase
                .eq('is_active', true)
                .or(`expires_at.is.null,expires_at.gte.${today}`)
                .single();

            if (error || !data) {
                return { success: false, error: "Invalid or expired coupon." };
            }

            return { success: true, data };

        } catch (error) {
            console.error("Coupon Error:", error);
            return { success: false, error: "Validation failed." };
        }
    },

    // --- 2. CALCULATIONS ---
    calculateDiscount(originalPrice, couponData) {
        if (!couponData) return 0;
        
        let discount = 0;
        const price = Number(originalPrice);
        const val = Number(couponData.discount_value);

        if (couponData.discount_type === 'percent') {
            discount = (price * val) / 100;
        } else {
            // Flat amount
            discount = val;
        }

        // Ensure discount doesn't exceed price
        return Math.min(discount, price);
    },

    getFinalPrice(originalPrice, discountAmount) {
        return Math.max(0, Number(originalPrice) - discountAmount);
    },

    // --- 3. UI HELPER (Attaches to Input + Button) ---
    initCouponInput(inputElement, buttonElement, onApplySuccess) {
        if (!inputElement || !buttonElement) return;

        buttonElement.addEventListener('click', async () => {
            const code = inputElement.value.trim();
            if (!code) return alert("Enter a code");

            const originalText = buttonElement.innerText;
            buttonElement.innerText = "Checking...";
            buttonElement.disabled = true;

            const result = await this.validateCoupon(code);

            buttonElement.innerText = originalText;
            buttonElement.disabled = false;

            if (result.success) {
                // Callback to update the parent UI (e.g., Booking Form)
                if (onApplySuccess) onApplySuccess(result.data);
            } else {
                // Use Toast if available, else Alert
                if (window.toast) window.toast.error(result.error);
                else alert(result.error);
                
                inputElement.value = ''; // Clear invalid code
            }
        });
    }
};

// Export
window.coupon = CouponManager;