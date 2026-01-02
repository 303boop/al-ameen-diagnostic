// =====================================================
// Authentication Module (FINAL FIXED)
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

    // email verification ON
    if (!data.user) {
      return {
        success: true,
        requiresVerification: true,
        message: "Verification email sent",
      };
    }

    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name,
      phone,
      role: "patient",
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/* =========================
   SIGN IN  (✅ REDIRECT HERE)
========================= */
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile.role === "admin")
      location.href = "`${BASE_PATH}/dashboards/admin/index.html`";
    else if (profile.role === "lab")
      location.href = "`${BASE_PATH}/dashboards/lab/index.html`";
    else
      location.href = "`${BASE_PATH}/dashboards/patient/index.html`";

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/* =========================
   SIGN OUT
========================= */
async function signOut() {
  await supabase.auth.signOut();
  location.href = `${BASE_PATH}/index.html`;
}

/* =========================
   PASSWORD RESET
========================= */
async function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/reset-password.html`,
  });
}

/* =========================
   UPDATE PASSWORD
========================= */
async function updatePassword(newPassword) {
  return supabase.auth.updateUser({ password: newPassword });
}

/* =========================
   AUTH GUARD (NO REDIRECT LOOPS)
========================= */
async function requireAuth(allowedRoles = []) {
  const user = await getCurrentUser();
  if (!user) {
    location.href = `${BASE_PATH}/login.html`;
    return false;
  }

  if (allowedRoles.length) {
    const profile = await getUserRole();
    if (!profile || !allowedRoles.includes(profile.role)) {
      location.href = `${BASE_PATH}/index.html`;
      return false;
    }
  }

  return true;
}

/* =========================
   EXPORT
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
