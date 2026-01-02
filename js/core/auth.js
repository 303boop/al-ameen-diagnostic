// =====================================================
// Authentication Module
// =====================================================

// Ensure Supabase is ready
if (!window.supabase) console.error("❌ Supabase client not found in auth.js");

const Auth = {
    // --- HELPERS ---
    
    async getCurrentUser() {
        const { data: { user } } = await window.supabase.auth.getUser();
        return user;
    },

    async getUserRole() {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await window.supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Error fetching role:", error);
            return null;
        }
        return data;
    },

    // --- ACTIONS ---

    async signUp({ email, password, full_name, phone }) {
        try {
            // 1. Create Auth User
            const { data, error } = await window.supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name, phone } } // Meta data for Supabase Auth
            });

            if (error) throw error;

            // 2. Create Profile Entry (Required for Role handling)
            if (data.user) {
                const { error: profileError } = await window.supabase.from("profiles").insert({
                    id: data.user.id,
                    full_name,
                    phone,
                    role: "patient" // Default role
                });
                if (profileError) throw profileError;
            }

            return { success: true, message: "Account created! Please log in." };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async signIn(email, password) {
        try {
            // 1. Log in
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // 2. Get Role and Redirect
            const profile = await this.getUserRole();
            
            if (!profile) throw new Error("Profile not found");

            this.redirectUser(profile.role);
            return { success: true };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async signOut() {
        await window.supabase.auth.signOut();
        window.location.href = `${window.BASE_PATH}/login.html`;
    },

    // --- ROUTING ---

    redirectUser(role) {
        let path = '/index.html'; // Default

        if (role === 'admin') path = '/dashboards/admin/index.html';
        else if (role === 'lab') path = '/dashboards/lab/index.html';
        else if (role === 'patient') path = '/dashboards/patient/index.html';

        // Use the global BASE_PATH we set in supabase.js
        window.location.href = `${window.BASE_PATH}${path}`;
    },

    async requireAuth(allowedRoles = []) {
        const user = await this.getCurrentUser();
        
        // 1. Not logged in -> Go to Login
        if (!user) {
            window.location.href = `${window.BASE_PATH}/login.html`;
            return false;
        }

        // 2. Check Role Permissions
        if (allowedRoles.length > 0) {
            const profile = await this.getUserRole();
            if (!profile || !allowedRoles.includes(profile.role)) {
                // Logged in but wrong role -> Go Home
                window.location.href = `${window.BASE_PATH}/index.html`;
                return false;
            }
        }
        return true;
    }
};

// Expose to window
window.auth = Auth;
console.log("✅ Auth module ready");