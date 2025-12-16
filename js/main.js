// Main App Initialization

// Premium scroll effect for navbar - smooth glassmorphism transition
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const tuxdiNav = document.querySelector('.tuxdi-nav');
    const isMenuOpen = tuxdiNav && tuxdiNav.classList.contains('active');

    if (navbar) {
        const hasHero = document.querySelector('.hero');
        if (hasHero) {
            const scrollY = window.scrollY;
            if (scrollY > 50 && !isMenuOpen) {
                navbar.classList.add('scrolled');
                // Premium glassmorphism when scrolled
                navbar.style.background = 'rgba(255, 255, 255, 0.8)';
                navbar.style.backdropFilter = 'blur(24px) saturate(200%)';
                navbar.style.webkitBackdropFilter = 'blur(24px) saturate(200%)';
                navbar.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
            } else {
                navbar.classList.remove('scrolled');
                // Completely transparent when at top of hero or menu is open
                navbar.style.background = 'rgba(255, 255, 255, 0)';
                navbar.style.backdropFilter = 'blur(0px)';
                navbar.style.webkitBackdropFilter = 'blur(0px)';
                navbar.style.boxShadow = 'none';
                navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0)';
            }
        } else {
            // Pages without hero always have solid navbar (unless menu is open)
            if (!isMenuOpen) {
            navbar.classList.add('scrolled');
            } else {
                navbar.style.backdropFilter = 'blur(0px)';
                navbar.style.webkitBackdropFilter = 'blur(0px)';
            }
        }
    }
}, { passive: true });

// Initialize navbar state on page load
function initNavbarState() {
    const navbar = document.querySelector('.navbar');
    const hasHero = document.querySelector('.hero');

    if (navbar) {
        if (!hasHero) {
            // Pages without hero should have solid navbar immediately
            navbar.classList.add('scrolled');
        } else {
            // Hero pages start transparent
            navbar.classList.remove('scrolled');
            // Force transparent background
            navbar.style.background = 'rgba(255, 255, 255, 0)';
            navbar.style.backdropFilter = 'blur(0px)';
            navbar.style.webkitBackdropFilter = 'blur(0px)';
            navbar.style.boxShadow = 'none';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0)';
        }
    }
}

// Run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initNavbarState();
    // Also run after a short delay to catch dynamically created navbars
    setTimeout(initNavbarState, 100);
});

// GSAP Scroll Animations - Modern, smooth animations for homepage
function initGSAPAnimations() {
    // Only run on homepage (index.html)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== '' && currentPage !== 'index.html') {
        return;
    }

    // Check if GSAP is loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded. Animations disabled.');
        return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Wait for DOM and content to be ready
    const initAnimations = () => {
        // 1) Hero content - drop in from bottom on page load
        const heroContent = document.querySelector('.hero-content');
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');

        if (heroContent) {
            // Set initial state explicitly, then animate
            gsap.set(heroContent, { opacity: 0, y: 80 });

            // Ensure buttons are visible initially
            if (heroButtons.length > 0) {
                gsap.set(heroButtons, { opacity: 0, y: 30 });
            }

            gsap.timeline()
                .to(heroContent, {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power4.out"
                })
                .to(heroButtons, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out"
                }, "-=0.6");
        }

        // 2) Services section title - fade/slide up on scroll
        const servicesHeader = document.querySelector(".services-preview .section-header");
        if (servicesHeader) {
            // Check if already in viewport
            const rect = servicesHeader.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

            gsap.set(servicesHeader, { opacity: 0, y: 40 });

            if (isInViewport) {
                // Already visible - animate immediately
                gsap.to(servicesHeader, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            } else {
                // Animate on scroll
                gsap.to(servicesHeader, {
                    scrollTrigger: {
                        trigger: ".services-preview",
                        start: "top 85%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            }
        }

        // 3) Service cards - strong, staggered motion on scroll
        const serviceCards = document.querySelectorAll(".services-grid .service-card");
        if (serviceCards.length > 0) {
            // Set initial state for all cards
            gsap.set(serviceCards, {
                opacity: 0,
                y: 80,
                scale: 0.95,
                clearProps: "none"
            });

            // Check if cards are already in viewport - animate immediately if so
            const firstCard = serviceCards[0];
            if (firstCard) {
                const rect = firstCard.getBoundingClientRect();
                const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

                if (isInViewport) {
                    // Cards are already visible - animate immediately
                    gsap.to(serviceCards, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: "power3.out",
                        stagger: 0.2
                    });
                } else {
                    // Animate in on scroll
                    gsap.to(serviceCards, {
                        scrollTrigger: {
                            trigger: ".services-grid",
                            start: "top 80%",
                            toggleActions: "play none none none"
                        },
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: "power3.out",
                        stagger: 0.2
                    });
                }
            }
        }

        // 4) About section - header
        const aboutHeader = document.querySelector(".about-header");

        if (aboutHeader) {
            const headerRect = aboutHeader.getBoundingClientRect();
            const headerInViewport = headerRect.top < window.innerHeight && headerRect.bottom > 0;

            gsap.set(aboutHeader, { opacity: 0, y: 40 });

            if (headerInViewport) {
                gsap.to(aboutHeader, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            } else {
                gsap.to(aboutHeader, {
                    scrollTrigger: {
                        trigger: ".about-header",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            }
        }

        // 5) Stacking cards animation - cards stack up on scroll down
        const stackContainer = document.querySelector(".stack-container");
        const stackCards = document.querySelectorAll(".stack-card");

        if (stackContainer && stackCards.length > 0) {
            // Animate each card's content (text and image)
            stackCards.forEach((card, index) => {
                const cardLeft = card.querySelector(".stack-card-left");
                const cardRight = card.querySelector(".stack-card-right");
                const isReverse = card.querySelector(".reverse");

                // Text animation
                if (cardLeft) {
                    const startX = isReverse ? 100 : -100;
                    gsap.set(cardLeft, { opacity: 0, x: startX });

                    gsap.to(cardLeft, {
                        scrollTrigger: {
                            trigger: card,
                            start: "top 80%",
                            toggleActions: "play none none none"
                        },
                        opacity: 1,
                        x: 0,
                        duration: 1,
                        ease: "power3.out"
                    });
                }

                // Image animation
                if (cardRight) {
                    const startX = isReverse ? -100 : 100;
                    gsap.set(cardRight, { opacity: 0, x: startX });

                    gsap.to(cardRight, {
                        scrollTrigger: {
                            trigger: card,
                            start: "top 80%",
                            toggleActions: "play none none none"
                        },
                        opacity: 1,
                        x: 0,
                        duration: 1,
                        ease: "power3.out",
                        delay: 0.2
                    });
                }
            });
        }

        // 6) "View All Services" button - fade in after cards
        const viewAllBtn = document.querySelector(".services-preview .text-center .btn");
        if (viewAllBtn) {
            const btnRect = viewAllBtn.getBoundingClientRect();
            const btnInViewport = btnRect.top < window.innerHeight && btnRect.bottom > 0;

            gsap.set(viewAllBtn, { opacity: 0, y: 30 });

            if (btnInViewport) {
                gsap.to(viewAllBtn, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            } else {
                gsap.to(viewAllBtn, {
                    scrollTrigger: {
                        trigger: viewAllBtn,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            }
        }


        // Fallback: Ensure all animated elements are visible after a delay (in case GSAP fails)
        setTimeout(() => {
            document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right, .service-card').forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                if (parseFloat(computedStyle.opacity) < 0.1) {
                    el.style.opacity = '1';
                    el.style.visibility = 'visible';
                }
            });
        }, 3000);
    };

    // Initialize animations - wait for everything to be ready
    const startAnimations = () => {
        // Wait a bit for any dynamic content to load
        setTimeout(() => {
            try {
                initAnimations();
            } catch (error) {
                console.error('GSAP animation error:', error);
                // Fallback: make all elements visible if GSAP fails
                document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right, .service-card').forEach(el => {
                    el.style.opacity = '1';
                    el.style.visibility = 'visible';
                });
            }
        }, 200);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAnimations);
    } else {
        startAnimations();
    }
}

// Initialize mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    // Initialize GSAP animations (only runs on homepage)
    initGSAPAnimations();
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Check authentication on protected pages
    const protectedPages = ['dashboard.html', 'booking.html', 'admin/index.html', 'admin/bookings.html', 'admin/services.html', 'admin/users.html', 'admin/admins.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage)) {
        // Check if user is logged in
        const user = getCurrentUser();
        if (!user) {
            // Redirect to login
            window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPage);
            return;
        }

        // Check admin access for admin pages
        if (currentPage.startsWith('admin/') && !isAdmin()) {
            alert('Access denied. Admin privileges required.');
            window.location.href = '../index.html';
            return;
        }
    }

    // Update navigation based on auth status
    // Don't update navigation on admin pages - they have their own navigation
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('/admin/') || currentPath.includes('admin/');
    if (!isAdminPage) {
        updateNavigation();
    }
});

/**
 * Update navigation based on authentication status
 */
function updateNavigation() {
    const user = getCurrentUser();
    const navMenu = document.querySelector('.nav-menu');

    if (!navMenu) return;

    // Remove ALL auth-related links more aggressively
    // First, remove by class
    const authLinks = navMenu.querySelectorAll('.auth-link');
    authLinks.forEach(link => {
        const listItem = link.closest('li');
        if (listItem) listItem.remove();
    });

    // Remove by ID
    const navLogout = document.getElementById('navLogout');
    if (navLogout) {
        const listItem = navLogout.closest('li');
        if (listItem) listItem.remove();
    }

    const navLoginLink = document.getElementById('navLoginLink');
    if (navLoginLink) {
        const listItem = navLoginLink.closest('li');
        if (listItem) listItem.remove();
    }

    // Check if we're on an admin page
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('/admin/') || currentPath.includes('admin/');

    // Remove by href pattern (but don't remove hardcoded admin nav links if we're on admin pages)
    const allItems = Array.from(navMenu.querySelectorAll('li'));
    allItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href') || '';
            const text = link.textContent.trim().toLowerCase();

            // Remove if it's an auth-related link (but keep admin nav if on admin pages)
            if (href.includes('dashboard.html') ||
                href.includes('login.html') ||
                text === 'logout' ||
                text === 'login') {
                item.remove();
            }

            // Only remove admin links if they're dynamically added (have auth-link class) and we're on admin pages
            if (href.includes('admin/') && link.classList.contains('auth-link') && isAdminPage) {
                item.remove();
            }
        }
    });

    if (user) {
        // Check user role (case-insensitive)
        const userRole = (user.role || '').toLowerCase();
        const isAdminUser = userRole === 'admin';

        // Only show Dashboard for non-admin users (regular users)
        // Admins should use the Admin dashboard instead
        if (!isAdminUser && !navMenu.querySelector('a[href="dashboard.html"]')) {
            const dashboardLink = document.createElement('li');
            dashboardLink.innerHTML = '<a href="dashboard.html" class="auth-link">Dashboard</a>';
            navMenu.appendChild(dashboardLink);
        }

        // Show admin link if admin, but only if NOT already on an admin page
        // (Admin pages have their own navigation)
        if (isAdminUser && !isAdminPage && !navMenu.querySelector('a[href*="admin/"]')) {
            const adminLink = document.createElement('li');
            adminLink.innerHTML = '<a href="admin/index.html" class="auth-link">Admin</a>';
            navMenu.appendChild(adminLink);
        }

        // Add Logout link
        if (!navMenu.querySelector('#navLogout')) {
            const logoutLink = document.createElement('li');
            logoutLink.innerHTML = '<a href="#" class="auth-link" id="navLogout">Logout</a>';
            navMenu.appendChild(logoutLink);

            // Add logout handler
            const logoutBtn = document.getElementById('navLogout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleLogout();
                });
            }
        }
    } else {
        // User is not logged in - add Login link
        if (!navMenu.querySelector('a[href="login.html"]')) {
            const loginLink = document.createElement('li');
            loginLink.innerHTML = '<a href="login.html" class="auth-link">Login</a>';
            navMenu.appendChild(loginLink);
        }
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        setCurrentUser(null);
        window.location.href = 'index.html';
    }
}

// Make functions available globally
window.handleLogout = handleLogout;

