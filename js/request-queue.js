// Request Queue Manager
// Prevents duplicate requests and handles rate limiting

class RequestQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.requestCache = new Map();
        this.cacheTimeout = 5000; // 5 seconds cache
    }

    /**
     * Add request to queue
     */
    async enqueue(requestFn, cacheKey = null) {
        // Check cache first
        if (cacheKey && this.requestCache.has(cacheKey)) {
            const cached = this.requestCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
            this.requestCache.delete(cacheKey);
        }

        return new Promise((resolve, reject) => {
            this.queue.push({
                fn: requestFn,
                resolve,
                reject,
                cacheKey
            });
            this.process();
        });
    }

    /**
     * Process queue
     */
    async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift();
            try {
                const result = await item.fn();
                
                // Cache result if cache key provided
                if (item.cacheKey) {
                    this.requestCache.set(item.cacheKey, {
                        data: result,
                        timestamp: Date.now()
                    });
                }
                
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }
            
            // Small delay between requests to prevent overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.processing = false;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.requestCache.clear();
    }

    /**
     * Clear specific cache entry
     */
    clearCacheEntry(key) {
        this.requestCache.delete(key);
    }
}

// Global request queue instance
window.requestQueue = new RequestQueue();

