// js/config/supabase.js

// =====================================================
// Supabase Configuration
// =====================================================

// 1. DYNAMIC BASE PATH (Critical for GitHub Pages)
// If we are on localhost, path is "". If on GitHub, it's "/al-ameen-diagnostics"
const HOSTNAME = window.location.hostname;
// ⚠️ CHANGE '/al-ameen-diagnostics' to your exact repo name if different
const BASE_PATH = (HOSTNAME === '127.0.0.1' || HOSTNAME === 'localhost') 
    ? '' 
    : '/al-ameen-diagnostics'; 

// Expose globally
window.BASE_PATH = BASE_PATH;

// 2. CREDENTIALS
const SUPABASE_URL = "https://hdlwflzgpphkdhhojldt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_v9un03jyjabk-HSWoyvZWQ_LD1g9E_B";

// 3. INITIALIZATION
if (!window.supabase) {
    console.error("❌ Supabase SDK not loaded. Check script tags.");
} else {
    // Create Client
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Attach to Window
    window.supabase = supabaseClient;
    
    console.log("✅ Supabase client initialized");
}