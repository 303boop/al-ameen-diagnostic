// Authentication Module

// Sign up with email
async function signUp(email, password, fullName, phone) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) throw error;

    // Update profile with full name and phone
    if (data.user) {
      await supabaseClient
        .from('profiles')
        .update({ 
          full_name: fullName,
          phone: phone 
        })
        .eq('id', data.user.id);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in with email
async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    
    window.location.href = '/index.html';
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Reset password
async function resetPassword(email) {
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message };
  }
}

// Update password
async function updatePassword(newPassword) {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: error.message };
  }
}

// Check authentication and redirect
async function requireAuth(allowedRoles = []) {
  const user = await getCurrentUser();
  
  if (!user) {
    window.location.href = '/login.html';
    return false;
  }

  if (allowedRoles.length > 0) {
    const profile = await getUserRole();
    
    if (!profile || !allowedRoles.includes(profile.role)) {
      window.location.href = '/index.html';
      return false;
    }
  }

  return true;
}

// Export
window.auth = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  requireAuth
};