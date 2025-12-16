// Bookings API Functions

/**
 * Create new booking
 */
async function createBooking(bookingData) {
    try {
        if (!supabase) {
            throw new Error('Supabase not initialized');
        }

        const user = getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                user_id: user.id,
                service_id: bookingData.serviceId,
                booking_date: bookingData.date,
                booking_time: bookingData.time,
                participants: parseInt(bookingData.participants),
                total_price: parseFloat(bookingData.totalPrice),
                notes: bookingData.notes || null,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Get user's bookings
 */
async function getUserBookings(userId) {
    try {
        if (!supabase) {
            return { data: [], error: null };
        }

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                services (
                    id,
                    name,
                    description,
                    price
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Get booking by ID
 */
async function getBookingById(bookingId) {
    try {
        if (!supabase) {
            return { data: null, error: new Error('Supabase not initialized') };
        }

        // Get booking with service
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select(`
                *,
                services (
                    id,
                    name,
                    description,
                    price
                )
            `)
            .eq('id', bookingId)
            .single();

        if (bookingError) throw bookingError;
        if (!booking) {
            return { data: null, error: new Error('Booking not found') };
        }

        // Get profile separately
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone')
            .eq('id', booking.user_id)
            .single();

        if (profileError) {
            console.warn('Error loading profile:', profileError);
        }

        // Merge profile into booking
        const bookingWithProfile = {
            ...booking,
            profiles: profile || null
        };

        return { data: bookingWithProfile, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Get all bookings (Admin only)
 */
async function getAllBookings() {
    try {
        if (!supabase) {
            return { data: [], error: null };
        }

        // First get all bookings with services
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                *,
                services (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;

        // Then get all profiles for the user_ids
        const userIds = [...new Set((bookings || []).map(b => b.user_id))];

        if (userIds.length === 0) {
            return { data: bookings || [], error: null };
        }

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);

        if (profilesError) {
            console.warn('Error loading profiles:', profilesError);
            // Continue without profiles
        }

        // Merge profiles into bookings
        const profileMap = {};
        (profiles || []).forEach(p => {
            profileMap[p.id] = p;
        });

        const bookingsWithProfiles = (bookings || []).map(booking => ({
            ...booking,
            profiles: profileMap[booking.user_id] || null
        }));

        return { data: bookingsWithProfiles, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Update booking status (Admin only)
 * @param {string} bookingId - The booking ID
 * @param {string} status - The new status ('approved' or 'rejected')
 * @param {string} adminMessage - Optional message from admin
 */
async function updateBookingStatus(bookingId, status, adminMessage = null) {
    try {
        if (!supabase) {
            throw new Error('Supabase not initialized');
        }

        const updateData = {
            status: status,
            updated_at: new Date().toISOString()
        };

        // Add admin message if provided
        if (adminMessage && adminMessage.trim()) {
            updateData.admin_message = adminMessage.trim();
        }

        const { data, error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Get bookings by status
 */
async function getBookingsByStatus(status) {
    try {
        if (!supabase) {
            return { data: [], error: null };
        }

        // Get bookings with services
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                *,
                services (
                    id,
                    name
                )
            `)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;

        // Get profiles for user_ids
        const userIds = [...new Set((bookings || []).map(b => b.user_id))];

        if (userIds.length === 0) {
            return { data: bookings || [], error: null };
        }

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);

        if (profilesError) {
            console.warn('Error loading profiles:', profilesError);
        }

        // Merge profiles into bookings
        const profileMap = {};
        (profiles || []).forEach(p => {
            profileMap[p.id] = p;
        });

        const bookingsWithProfiles = (bookings || []).map(booking => ({
            ...booking,
            profiles: profileMap[booking.user_id] || null
        }));

        return { data: bookingsWithProfiles, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

