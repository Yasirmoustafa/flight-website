// Authentication Functions

/**
 * Sign up new user
 */
async function signUp(email, password, fullName, phone = null, nationality = null) {
    try {
        // Get supabase client from window
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.auth) {
            throw new Error('Supabase not initialized. Please configure your Supabase credentials in js/config.js');
        }

        // Sign up user with metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(), // Normalize email
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone || null,
                    nationality: nationality || null
                }
            }
        });

        if (authError) {
            // Provide more detailed error message
            console.error('Supabase auth error:', authError);
            
            // Handle specific error cases
            let errorMessage = authError.message || 'An error occurred during signup';
            
            // Check if email already exists
            if (authError.message && (
                authError.message.includes('already registered') ||
                authError.message.includes('already exists') ||
                authError.message.includes('User already registered')
            )) {
                errorMessage = 'This email is already registered. Please login instead.';
            }
            // Check if email is invalid (but "ahmed@gmail.com" should be valid, so this might be a different issue)
            else if (authError.message && authError.message.includes('invalid') && authError.message.includes('email')) {
                // This could mean the email already exists or there's a validation issue
                // Try to provide a helpful message
                errorMessage = 'This email address cannot be used. It may already be registered, or there may be a validation issue. Please try a different email or login if you already have an account.';
            }
            // Check for rate limiting or attack protection
            else if (authError.message && (
                authError.message.includes('rate limit') ||
                authError.message.includes('too many') ||
                authError.status === 429
            )) {
                errorMessage = 'Too many signup attempts. Please wait a few minutes and try again.';
            }
            
            // Create a new error with the improved message
            const improvedError = new Error(errorMessage);
            improvedError.originalError = authError;
            throw improvedError;
        }

        // Note: Supabase might not return user immediately if email confirmation is required
        // Check authData.session instead
        if (!authData.user && !authData.session) {
            throw new Error('Failed to create user. Please check your email format and try again.');
        }

        // If we have a session, user is logged in immediately (email confirmation disabled)
        // If we only have user but no session, email confirmation is required
        if (authData.session) {
            // User is logged in - get profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .maybeSingle(); // Use maybeSingle() to handle missing profiles

            // If profile doesn't exist, create it
            if (profileError || !profile) {
                // Try with nationality first
                let profileData = {
                    id: authData.user.id,
                    full_name: fullName,
                    phone: phone || null,
                    email: authData.user.email,
                    role: 'user'
                };

                // Add nationality if provided
                if (nationality) {
                    profileData.nationality = nationality;
                }

                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert(profileData, {
                        onConflict: 'id'
                    });

                // If error is about missing column, try without nationality
                if (upsertError && (upsertError.message.includes('column') && upsertError.message.includes('nationality'))) {
                    console.warn('Nationality column not found, creating profile without nationality. Please run add_nationality_column.sql');
                    // Retry without nationality
                    delete profileData.nationality;
                    const { error: retryError } = await supabase
                        .from('profiles')
                        .upsert(profileData, {
                            onConflict: 'id'
                        });

                    if (retryError) {
                        console.warn('Profile creation failed:', retryError);
                    }
                } else if (upsertError) {
                    console.warn('Profile creation failed:', upsertError);
                }
            } else {
                // Update profile with full_name, phone, nationality, and email if needed
                const needsUpdate = profile.full_name !== fullName ||
                    profile.phone !== phone ||
                    (profile.nationality !== nationality && nationality) ||
                    profile.email !== authData.user.email;

                if (needsUpdate) {
                    const updateData = {
                        full_name: fullName,
                        phone: phone || null,
                        email: authData.user.email
                    };

                    // Only add nationality if it's provided and different
                    if (nationality && profile.nationality !== nationality) {
                        updateData.nationality = nationality;
                    }

                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update(updateData)
                        .eq('id', authData.user.id);

                    // If error is about missing column, retry without nationality
                    if (updateError && (updateError.message.includes('column') && updateError.message.includes('nationality'))) {
                        console.warn('Nationality column not found, updating without nationality. Please run add_nationality_column.sql');
                        delete updateData.nationality;
                        await supabase
                            .from('profiles')
                            .update(updateData)
                            .eq('id', authData.user.id);
                    }
                }
            }

            // Store user data for immediate login
            const userData = {
                id: authData.user.id,
                email: authData.user.email,
                full_name: fullName,
                phone: phone || null,
                nationality: nationality || null,
                role: 'user'
            };

            setCurrentUser(userData);
        } else if (authData.user) {
            // User created but needs email confirmation
            // Try to create/update profile anyway
            let profileData = {
                id: authData.user.id,
                full_name: fullName,
                phone: phone || null,
                role: 'user'
            };

            // Add nationality if provided
            if (nationality) {
                profileData.nationality = nationality;
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(profileData, {
                    onConflict: 'id'
                });

            // If error is about missing column, try without nationality
            if (profileError && (profileError.message.includes('column') && profileError.message.includes('nationality'))) {
                console.warn('Nationality column not found, creating profile without nationality. Please run add_nationality_column.sql');
                delete profileData.nationality;
                await supabase
                    .from('profiles')
                    .upsert(profileData, {
                        onConflict: 'id'
                    });
            } else if (profileError) {
                console.warn('Profile creation failed:', profileError);
            }
        }

        return { data: authData, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Sign in user
 */
async function signIn(email, password) {
    try {
        // Get supabase client from window (handles both library and client)
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.auth) {
            throw new Error('Supabase not initialized. Please configure your Supabase credentials in js/config.js');
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password
        });

        if (authError) {
            // Handle email not confirmed error
            if (authError.message && (
                authError.message.includes('Email not confirmed') ||
                authError.message.includes('email not confirmed') ||
                authError.message.includes('Email not verified')
            )) {
                // Try to resend confirmation email or provide helpful message
                const improvedError = new Error('Your email address has not been confirmed. Please check your email for a confirmation link, or contact support if you need help.');
                improvedError.originalError = authError;
                improvedError.code = 'email_not_confirmed';
                throw improvedError;
            }
            throw authError;
        }
        
        if (!authData.user) throw new Error('Invalid credentials');

        // Get user profile (always fetch fresh from database to get latest role)
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle(); // Use maybeSingle() instead of single() to handle missing profiles

        // If profile doesn't exist, create it
        if (profileError || !profile) {
            console.warn('Profile not found, creating new profile for user:', authData.user.id);
            
            // Create profile with data from auth user
            const newProfile = {
                id: authData.user.id,
                full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
                email: authData.user.email,
                phone: authData.user.user_metadata?.phone || null,
                nationality: authData.user.user_metadata?.nationality || null,
                role: 'user'
            };

            const { data: createdProfile, error: createError } = await supabase
                .from('profiles')
                .insert(newProfile)
                .select()
                .single();

            if (createError) {
                console.error('Error creating profile:', createError);
                // If creation fails, use a default profile object
                profile = {
                    id: authData.user.id,
                    full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
                    email: authData.user.email,
                    phone: null,
                    nationality: null,
                    role: 'user'
                };
            } else {
                profile = createdProfile;
            }
        }

        // Store user data with fresh role from database
        // Normalize role to lowercase for consistency
        const role = (profile.role || 'user').toLowerCase();

        // Update profile email if it's missing or different
        if (!profile.email || profile.email !== authData.user.email) {
            try {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ email: authData.user.email })
                    .eq('id', authData.user.id);

                if (updateError) {
                    console.warn('Failed to update email:', updateError);
                }
            } catch (err) {
                console.warn('Failed to update email:', err);
            }
        }

        const userData = {
            id: authData.user.id,
            email: authData.user.email,
            full_name: profile.full_name,
            phone: profile.phone,
            role: role  // Always get fresh role from database, normalized to lowercase
        };

        // User data stored (debug removed for production)
        setCurrentUser(userData);

        return { data: userData, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Resend email confirmation
 */
async function resendConfirmationEmail(email) {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.auth) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email: email.toLowerCase().trim()
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Sign out user
 */
async function signOut() {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (supabase && supabase.auth) {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        }

        setCurrentUser(null);
        return { error: null };
    } catch (error) {
        return { error };
    }
}

/**
 * Get current authenticated user
 */
async function getCurrentAuthUser() {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.auth) {
            return { data: getCurrentUser(), error: null };
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (!user) {
            setCurrentUser(null);
            return { data: null, error: null };
        }

        // Get profile
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle() to handle missing profiles

        // If profile doesn't exist, create a default one
        if (profileError || !profile) {
            console.warn('Profile not found for user:', user.id);
            // Use default profile data
            profile = {
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email,
                phone: null,
                nationality: null,
                role: 'user'
            };
        }

        const userData = {
            id: user.id,
            email: user.email,
            full_name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            phone: profile.phone || null,
            role: profile.role || 'user'
        };

        setCurrentUser(userData);
        return { data: userData, error: null };
    } catch (error) {
        setCurrentUser(null);
        return { data: null, error };
    }
}

/**
 * Update user profile
 */
async function updateProfile(userId, updates) {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Update stored user data
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            setCurrentUser({ ...currentUser, ...updates });
        }

        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Sign in with Google OAuth
 */
async function signInWithGoogle() {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.auth) {
            throw new Error('Supabase not initialized. Please configure your Supabase credentials in js/config.js');
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth-callback.html`
            }
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return { data: null, error };
    }
}

