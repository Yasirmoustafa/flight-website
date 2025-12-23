// Slider Images Management
// Functions to fetch and manage slider images from Supabase

/**
 * Get all active slider images from database
 * @returns {Promise<Array>} Array of slider image objects
 */
async function getSliderImages() {
    try {
        const supabase = typeof window !== 'undefined' ? (window.supabaseClient || window.supabase) : null;
        
        if (!supabase || !supabase.from) {
            console.warn('Supabase not initialized, returning empty array');
            return [];
        }

        const { data, error } = await supabase
            .from('slider_images')
            .select('*')
            .eq('active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching slider images:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getSliderImages:', error);
        return [];
    }
}

/**
 * Load slider images into the homepage hero section
 */
async function loadSliderImagesToHomepage() {
    try {
        const sliderContainer = document.getElementById('heroSlider');
        const dotsContainer = document.getElementById('sliderDots');
        
        if (!sliderContainer) {
            console.warn('Hero slider container not found');
            return;
        }

        // Get slider images from database
        const sliderImages = await getSliderImages();

        // If no images from database, use fallback slides
        if (!sliderImages || sliderImages.length === 0) {
            console.log('No slider images found in database, using default fallback slides');
            
            // Add fallback slides
            const fallbackImages = [
                'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80',
                'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1920&q=80',
                'https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/08/Skydiving-Malaysia-Cover-Photo-840x425.jpg'
            ];
            
            sliderContainer.innerHTML = '';
            fallbackImages.forEach((imageUrl, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = `hero-slide ${index === 0 ? 'active' : ''}`;
                slideDiv.style.backgroundImage = `url('${imageUrl}')`;
                slideDiv.innerHTML = '<div class="hero-overlay"></div>';
                sliderContainer.appendChild(slideDiv);
            });
            
            // Create dots for fallback
            if (dotsContainer) {
                dotsContainer.innerHTML = '';
                fallbackImages.forEach((slide, index) => {
                    const dot = document.createElement('span');
                    dot.className = `dot ${index === 0 ? 'active' : ''}`;
                    dot.setAttribute('data-slide', index);
                    dotsContainer.appendChild(dot);
                });
            }
            
            // Initialize slider with fallback slides
            setTimeout(() => {
                if (typeof window.initHeroSlider === 'function') {
                    window.initHeroSlider();
                } else {
                    initSliderManually();
                }
            }, 100);
            return;
        }

        // Clear existing slides
        sliderContainer.innerHTML = '';

        // Create slides from database
        sliderImages.forEach((slide, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = `hero-slide ${index === 0 ? 'active' : ''}`;
            slideDiv.style.backgroundImage = `url('${slide.image_url}')`;
            slideDiv.innerHTML = '<div class="hero-overlay"></div>';
            sliderContainer.appendChild(slideDiv);
        });

        // Create dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            sliderImages.forEach((slide, index) => {
                const dot = document.createElement('span');
                dot.className = `dot ${index === 0 ? 'active' : ''}`;
                dot.setAttribute('data-slide', index);
                dotsContainer.appendChild(dot);
            });
        }

        // Reinitialize slider with new slides
        // Wait a bit for DOM to update, then call initHeroSlider if it exists
        setTimeout(() => {
            // Check if initHeroSlider is defined (it's defined in index.html)
            if (typeof window.initHeroSlider === 'function') {
                window.initHeroSlider();
            } else {
                // Fallback: manually initialize slider
                initSliderManually();
            }
        }, 100);
    } catch (error) {
        console.error('Error loading slider images to homepage:', error);
        // Fallback: initialize with default slides if error occurs
        initSliderManually();
    }
}

/**
 * Manually initialize slider (fallback function)
 */
function initSliderManually() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        if (slides[index]) slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
        if (slideInterval) clearInterval(slideInterval);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });

    startAutoSlide();
}

