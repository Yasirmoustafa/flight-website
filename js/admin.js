// Admin Functions

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
            return {
                totalBookings: 0,
                pendingBookings: 0,
                approvedBookings: 0,
                totalRevenue: 0
            };
        }

        // Get total bookings (optimized - only count, no data)
        const { count: totalBookings, error: totalError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true });
        
        if (totalError) throw totalError;
        
        // Get pending bookings (optimized)
        const { count: pendingBookings, error: pendingError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        
        if (pendingError) throw pendingError;
        
        // Get approved bookings (optimized)
        const { count: approvedBookings, error: approvedError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');
        
        if (approvedError) throw approvedError;
        
        // Get total revenue (only fetch total_price column, not all data)
        const { data: approvedBookingsData, error: revenueError } = await supabase
            .from('bookings')
            .select('total_price')
            .eq('status', 'approved');
        
        if (revenueError) throw revenueError;
        
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
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
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

