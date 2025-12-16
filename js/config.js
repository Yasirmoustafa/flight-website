// Supabase Configuration
const SUPABASE_URL = 'https://gzpdoqikepgtprnvexsx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cGRvcWlrZXBndHBybnZleHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjE3MTIsImV4cCI6MjA4MTM5NzcxMn0.LNdjeTBEqP_oV-Qtj5coZHMmwBRJoHvHD9N6BhxcHic';

// Initialize Supabase client (singleton pattern to prevent multiple instances)
let supabase = null;
let isInitializing = false;

// Function to initialize Supabase (only once)
function initializeSupabase() {
    // Prevent multiple initializations
    if (supabase) {
        return supabase;
    }
    
    if (isInitializing) {
        return null;
    }

    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase credentials not configured. Please update js/config.js with your Supabase URL and anon key.');
        return null;
    }

    isInitializing = true;

    // Check if Supabase library is loaded (UMD build exposes it as window.supabase)
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            console.log('✅ Supabase initialized successfully');
            isInitializing = false;
            return supabase;
        } catch (error) {
            console.error('❌ Error creating Supabase client:', error);
            isInitializing = false;
            return null;
        }
    }

    // Fallback: Try dynamic import if script tag didn't work (using working CDN)
    if (!supabase) {
        (async function() {
            try {
                // Try unpkg CDN as fallback
                const module = await import('https://unpkg.com/@supabase/supabase-js@2/dist/esm/index.js');
                if (module && module.createClient && !supabase) {
                    supabase = module.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                        auth: {
                            persistSession: true,
                            autoRefreshToken: true,
                            detectSessionInUrl: true
                        }
                    });
                    console.log('✅ Supabase initialized successfully (via dynamic import)');
                }
            } catch (error) {
                // Silently fail - script tag should have worked
                console.warn('⚠️ Dynamic import fallback failed, but script tag should work');
            } finally {
                isInitializing = false;
            }
        })();
    } else {
        isInitializing = false;
    }

    return supabase;
}

// Initialize once when script loads
(function init() {
    // Check if Supabase library is already loaded
    if (typeof window !== 'undefined' && window.supabase) {
        initializeSupabase();
    } else {
        // Wait for script to load, then initialize once
        const checkInterval = setInterval(function() {
            if (typeof window !== 'undefined' && window.supabase && !supabase) {
                initializeSupabase();
                clearInterval(checkInterval);
            }
        }, 50);
        
        // Stop checking after 5 seconds
        setTimeout(function() {
            clearInterval(checkInterval);
            if (!supabase && !isInitializing) {
                initializeSupabase();
            }
        }, 5000);
    }
})();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY, initializeSupabase };
}

