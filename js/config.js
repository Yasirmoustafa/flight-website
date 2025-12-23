// Supabase Configuration
// Wrap in IIFE to prevent variable conflicts and multiple loads
(function() {
    'use strict';
    
    // Check if already initialized to prevent multiple loads
    if (typeof window !== 'undefined' && window.SUPABASE_CONFIG_INITIALIZED) {
        return;
    }
    
    const SUPABASE_URL = 'https://gzpdoqikepgtprnvexsx.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cGRvcWlrZXBndHBybnZleHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjE3MTIsImV4cCI6MjA4MTM5NzcxMn0.LNdjeTBEqP_oV-Qtj5coZHMmwBRJoHvHD9N6BhxcHic';

    // Use different variable name to avoid conflict with Supabase library's window.supabase
    let supabaseClientInstance = null;
    let isInitializing = false;

    // Function to initialize Supabase (only once)
    function initializeSupabase() {
        // Prevent multiple initializations
        if (supabaseClientInstance) {
            return supabaseClientInstance;
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
        // Note: window.supabase is the library, not our client
        if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                });
                console.log('✅ Supabase initialized successfully');
                isInitializing = false;
                return supabaseClientInstance;
            } catch (error) {
                console.error('❌ Error creating Supabase client:', error);
                isInitializing = false;
                return null;
            }
        }

        // Fallback: Try dynamic import if script tag didn't work
        if (!supabaseClientInstance) {
            (async function() {
                try {
                    const module = await import('https://unpkg.com/@supabase/supabase-js@2/dist/esm/index.js');
                    if (module && module.createClient && !supabaseClientInstance) {
                        supabaseClientInstance = module.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                            auth: {
                                persistSession: true,
                                autoRefreshToken: true,
                                detectSessionInUrl: true
                            }
                        });
                        console.log('✅ Supabase initialized successfully (via dynamic import)');
                    }
                } catch (error) {
                    console.warn('⚠️ Dynamic import fallback failed, but script tag should work');
                } finally {
                    isInitializing = false;
                }
            })();
        } else {
            isInitializing = false;
        }

        return supabaseClientInstance;
    }

    // Make client available globally
    if (typeof window !== 'undefined') {
        // Store the library reference first (before we overwrite window.supabase)
        const supabaseLibrary = window.supabase;
        
        // Only define properties if they don't already exist
        if (!window.hasOwnProperty('supabaseClient') || window.propertyIsEnumerable('supabaseClient')) {
            try {
                // Expose as window.supabaseClient (our client instance)
                Object.defineProperty(window, 'supabaseClient', {
                    get: function() {
                        if (supabaseClientInstance) {
                            return supabaseClientInstance;
                        }
                        // Try to initialize if not already done
                        const client = initializeSupabase();
                        if (client) {
                            supabaseClientInstance = client;
                        }
                        return client;
                    },
                    configurable: true,
                    enumerable: true
                });
            } catch (e) {
                // Property might already be defined, just assign directly
                if (!window.supabaseClient) {
                    window.supabaseClient = null;
                }
            }
        }
        
        // Only define window.supabase if it's the library (has createClient)
        // Don't redefine if it's already our client or already defined
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            // Check if property descriptor exists and is configurable
            const descriptor = Object.getOwnPropertyDescriptor(window, 'supabase');
            if (!descriptor || descriptor.configurable) {
                try {
                    Object.defineProperty(window, 'supabase', {
                        get: function() {
                            // Return our client instance if available
                            if (supabaseClientInstance) {
                                return supabaseClientInstance;
                            }
                            // Try to initialize
                            const client = initializeSupabase();
                            if (client) {
                                supabaseClientInstance = client;
                                return client;
                            }
                            // Otherwise return the library (for createClient access)
                            return supabaseLibrary;
                        },
                        configurable: true,
                        enumerable: true
                    });
                } catch (e) {
                    // Property might already be defined, that's okay - just use it as is
                    // The getter will still work through window.supabaseClient
                }
            }
        }
        
        // Mark as initialized
        window.SUPABASE_CONFIG_INITIALIZED = true;
    }

    // Initialize once when script loads
    (function init() {
        // Check if Supabase library is already loaded
        if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
            // Initialize immediately
            const client = initializeSupabase();
            if (client) {
                supabaseClientInstance = client;
            }
        } else {
            // Wait for script to load, then initialize once
            const checkInterval = setInterval(function() {
                if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function' && !supabaseClientInstance) {
                    const client = initializeSupabase();
                    if (client) {
                        supabaseClientInstance = client;
                    }
                    clearInterval(checkInterval);
                }
            }, 50);
            
            // Stop checking after 5 seconds
            setTimeout(function() {
                clearInterval(checkInterval);
                if (!supabaseClientInstance && !isInitializing) {
                    const client = initializeSupabase();
                    if (client) {
                        supabaseClientInstance = client;
                    }
                }
            }, 5000);
        }
    })();

    // Export for use in other files (Node.js/CommonJS)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { supabase: supabaseClientInstance, SUPABASE_URL, SUPABASE_ANON_KEY, initializeSupabase };
    }
})();
