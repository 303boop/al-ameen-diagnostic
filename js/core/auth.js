// =====================================================
// Authentication Module (HARDENED & FIXED)
// =====================================================

const BASE_PATH = "/al-ameen-diagnostic";

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
const authReady = new Promise(resolve => {
  authReadyResolve = resolve;
});

/* =========================
   SIGN UP
========================= */
async function signUp(email, password, fullName, phone) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
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

    // Update profile safely
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq("id", data.user.id);

    if (profileError) {
      console.warn("Profile update failed:", profileError);
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
  ready: authReady,
};

authReadyResolve();
console.log("✅ Auth module ready");
