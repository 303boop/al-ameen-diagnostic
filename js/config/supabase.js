// =====================================================
// Supabase Configuration (BROWSER + GITHUB PAGES SAFE)
// =====================================================

// ❗ IMPORTANT:
// This file MUST be loaded AFTER the Supabase CDN script:
//
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// =========================
// CONFIG (PUBLIC ONLY)
// =========================
const SUPABASE_URL = "https://hdlwflzgpphkdhhojldt.supabase.co";
const SUPABASE_ANON_KEY = "PASTE_YOUR_PUBLIC_ANON_KEY_HERE";

// =========================
// SAFETY CHECK
// =========================
if (!window.supabase) {
  console.error("❌ Supabase SDK not loaded. Check script order.");
} else {
  // =========================
  // CREATE CLIENT
  // =========================
  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  // Expose globally
  window.supabase = supabaseClient;

  console.log("✅ Supabase client initialized");

  // =========================
  // AUTH HELPERS
  // =========================

  async function getCurrentUser() {
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (err) {
      console.error("getCurrentUser error:", err);
      return null;
    }
  }

  async function getUserRole() {
    const user = await getCurrentUser();
    if (!user) return null;

    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("role, full_name, phone")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("getUserRole error:", err);
      return null;
    }
  }

  async function isAuthenticated() {
    const user = await getCurrentUser();
    return Boolean(user);
  }

  // =========================
  // EXPORT HELPERS
  // =========================
  window.getCurrentUser = getCurrentUser;
  window.getUserRole = getUserRole;
  window.isAuthenticated = isAuthenticated;
}
