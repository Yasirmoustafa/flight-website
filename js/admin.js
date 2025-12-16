// Admin Functions

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
    try {
        if (!supabase) {
            return {
                totalBookings: 0,
                pendingBookings: 0,
                approvedBookings: 0,
                totalRevenue: 0
            };
        }

        // Get total bookings
        const { count: totalBookings } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true });
        
        // Get pending bookings
        const { count: pendingBookings } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        
        // Get approved bookings
        const { count: approvedBookings } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');
        
        // Get total revenue (sum of approved bookings)
        const { data: approvedBookingsData } = await supabase
            .from('bookings')
            .select('total_price')
            .eq('status', 'approved');
        
        const totalRevenue = approvedBookingsData?.reduce((sum, booking) => sum + parseFloat(booking.total_price || 0), 0) || 0;
        
        return {
            totalBookings: totalBookings || 0,
            pendingBookings: pendingBookings || 0,
            approvedBookings: approvedBookings || 0,
            totalRevenue: totalRevenue
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return {
            totalBookings: 0,
            pendingBookings: 0,
            approvedBookings: 0,
            totalRevenue: 0
        };
    }
}

/**
 * Get recent bookings
 */
async function getRecentBookings(limit = 10) {
    try {
        if (!supabase) {
            return { data: [], error: null };
        }

        // First get bookings with services
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                *,
                services (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (bookingsError) throw bookingsError;
        
        // Then get profiles for the user_ids
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

/**
 * Approve booking
 */
async function approveBooking(bookingId) {
    return await updateBookingStatus(bookingId, 'approved');
}

/**
 * Reject booking
 */
async function rejectBooking(bookingId) {
    return await updateBookingStatus(bookingId, 'rejected');
}

