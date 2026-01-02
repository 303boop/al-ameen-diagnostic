// Supabase Configuration
const SUPABASE_URL = "https://hdlwflzgpphkdhhojldt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbHdmbHpncHBoa2RoaG9qbGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0Njc0ODAsImV4cCI6MjA1MTA0MzQ4MH0.sb_publishable_v9un03jyjabk-HSWoyvZWQ_LD1g9E_B";

// 🚨 SAFETY CHECK (THIS WAS MISSING)
if (!window.supabase) {
  console.error("❌ Supabase SDK not loaded. Check script order.");
} else {
  // Initialize Supabase client
  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  // Make global (IMPORTANT)
  window.supabase = supabase;

  /* =========================
     AUTH HELPERS
  ========================== */

  async function getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error:", error);
      return null;
    }
    return user;
  }

  async function getUserRole() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name, phone")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching role:", error);
      return null;
    }

    return data;
  }

  async function isAuthenticated() {
    const user = await getCurrentUser();
    return Boolean(user);
  }

  // Export helpers globally
  window.getCurrentUser = getCurrentUser;
  window.getUserRole = getUserRole;
  window.isAuthenticated = isAuthenticated;

  console.log("✅ Supabase initialized correctly");
}
