// Services API Functions

/**
 * Get all active services
 */
async function getAllServices() {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
            // Return placeholder data if Supabase not configured
            const placeholderServices = [
                {
                    id: '1',
                    name: 'Two Days Pilot',
                    description: 'Experience flying an airplane in a real aircraft',
                    price: 500,
                    duration: '2 hours',
                    image_url: null,
                    active: true
                },
                {
                    id: '2',
                    name: 'Flight Simulator',
                    description: 'Learn to fly in our state-of-the-art flight simulator',
                    price: 300,
                    duration: '1.5 hours',
                    image_url: null,
                    active: true
                },
                {
                    id: '3',
                    name: 'Skydive Malaysia',
                    description: 'Fulfill your bucket list with an amazing skydiving experience',
                    price: 800,
                    duration: 'Half day',
                    image_url: null,
                    active: true
                }
            ];
            return { data: placeholderServices, error: null };
        }

        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Get featured services (for homepage)
 */
async function getFeaturedServices(limit = 3) {
    try {
        // TODO: Implement with Supabase
        // const { data, error } = await supabase
        //     .from('services')
        //     .select('*')
        //     .eq('active', true)
        //     .order('created_at', { ascending: false })
        //     .limit(limit);
        
        // if (error) throw error;
        // return { data, error: null };
        
        const { data: allServices } = await getAllServices();
        return { data: allServices?.slice(0, limit) || [], error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Get service by ID
 */
async function getServiceById(serviceId) {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
            return { data: null, error: new Error('Supabase not initialized') };
        }

        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .single();
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Create new service (Admin only)
 */
async function createService(serviceData) {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await supabase
            .from('services')
            .insert({
                name: serviceData.name,
                description: serviceData.description,
                price: parseFloat(serviceData.price),
                duration: serviceData.duration,
                image_url: serviceData.image_url || null,
                active: serviceData.active !== false
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
 * Update service (Admin only)
 */
async function updateService(serviceId, updates) {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
            throw new Error('Supabase not initialized');
        }

        const updateData = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        if (updateData.price) {
            updateData.price = parseFloat(updateData.price);
        }

        const { data, error } = await supabase
            .from('services')
            .update(updateData)
            .eq('id', serviceId)
            .select()
            .single();
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Delete service (Admin only)
 */
async function deleteService(serviceId) {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
            throw new Error('Supabase not initialized');
        }

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId);
        
        if (error) throw error;
        return { data: { success: true }, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Toggle service active status (Admin only)
 */
async function toggleServiceStatus(serviceId, active) {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await supabase
            .from('services')
            .update({ 
                active: active,
                updated_at: new Date().toISOString()
            })
            .eq('id', serviceId)
            .select()
            .single();
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

