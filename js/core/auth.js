// =====================================================
// Authentication Module (HARDENED & FIXED)
// =====================================================

/* =========================
   SAFETY CHECK
========================= */
if (!window.supabase) {
  console.error("❌ Supabase client not available");
}

/* =========================
   INTERNAL READY PROMISE
========================= */
let authReadyResolve;
const authReady = new Promise((resolve) => {
  authReadyResolve = resolve;
});

/* =========================
   GET CURRENT USER
========================= */
async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/* =========================
   GET USER ROLE
========================= */
async function getUserRole() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data;
}

/* =========================
   SIGN UP
========================= */
async function signUp({ email, password, full_name, phone }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
      },
    });

    if (error) throw error;

    // Email confirmation ON → user may be null
    if (!data.user) {
      return {
        success: true,
        requiresVerification: true,
        message: "Verification email sent. Please check your inbox.",
      };
    }

    // CREATE PROFILE (ONLY ON FIRST CONFIRMED USER)
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name,
      phone,
      role: "patient",
    });

    if (profileError) {
      console.warn("Profile insert failed:", profileError);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   SIGN IN
========================= */
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   SIGN OUT
========================= */
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    window.location.href = `${BASE_PATH}/index.html`;
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   PASSWORD RESET
========================= */
async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${BASE_PATH}/reset-password.html`,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   UPDATE PASSWORD
========================= */
async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Update password error:", error);
    return { success: false, error: error.message };
  }
}

/* =========================
   AUTH GUARD
========================= */
async function requireAuth(allowedRoles = []) {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = `${BASE_PATH}/login.html`;
    return false;
  }

  if (allowedRoles.length > 0) {
    const profile = await getUserRole();
    if (!profile || !allowedRoles.includes(profile.role)) {
      window.location.href = `${BASE_PATH}/index.html`;
      return false;
    }
  }

  return true;
}

/* =========================
   EXPORT (GUARANTEED)
========================= */
window.auth = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  requireAuth,
  getCurrentUser,
  getUserRole,
  ready: authReady,
};

authReadyResolve();
console.log("✅ Auth module ready");

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) throw error;

// 🔁 REDIRECT ONLY HERE
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", data.user.id)
  .single();

if (profile.role === "admin")
  location.href = "/dashboards/admin/index.html";
else if (profile.role === "lab")
  location.href = "/dashboards/lab/index.html";
else
  location.href = "/dashboards/patient/index.html";

