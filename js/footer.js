// Shared Footer Component
// This allows you to update footer in one place

/**
 * Get footer HTML
 * Returns a modern footer with contact information and links
 */
function getFooter() {
    return `
    <!-- Footer -->
    <footer class="footer-modern">
        <div class="container">
            <div class="footer-main">
                <div class="footer-left">
                    <div class="footer-brand-block">
                        <img src="logo.jpeg" alt="MY FLY CLOUDLY TOURS" class="footer-logo-image" style="height: 60px; width: auto;">
                        <h1 class="footer-title">MY FLY CLOUDLY TOURS</h1>
                    </div>
                    <p class="footer-description" data-i18n="footer.description">Experience the sky like never before. Your journey to aviation excellence starts here.</p>
                </div>
                
                <div class="footer-right">
                    <div class="footer-grid">
                        <div class="footer-nav-block">
                            <span class="footer-label" data-i18n="footer.navigate">Navigate</span>
                            <nav class="footer-nav">
                                <a href="index.html" class="footer-nav-link" data-i18n="nav.home">Home</a>
                                <a href="services.html" class="footer-nav-link" data-i18n="nav.services">Services</a>
                                <a href="about.html" class="footer-nav-link" data-i18n="nav.about">About</a>
                                <a href="booking.html" class="footer-nav-link" data-i18n="footer.bookNow">Book Now</a>
                            </nav>
                        </div>
                        
                        <div class="footer-contact-block">
                            <span class="footer-label" data-i18n="footer.getInTouch">Get in Touch</span>
                            <div class="footer-contact-info">
                                <a href="tel:+601160683066" class="footer-contact-link">
                                    <span class="contact-label" data-i18n="footer.phone">Phone</span>
                                    <span class="contact-value" data-i18n="footer.phoneNumber">+60 11-6068 3066</span>
                                </a>
                                <a href="mailto:info@edustep.com.my" class="footer-contact-link">
                                    <span class="contact-label" data-i18n="footer.email">Email</span>
                                    <span class="contact-value">info@edustep.com.my</span>
                                </a>
                                <div class="footer-contact-link">
                                    <span class="contact-label" data-i18n="footer.location">Location</span>
                                    <span class="contact-value" data-i18n="footer.locationAddress">EduStep Global Solutions Ltd. (LL21756)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>`;
}

/**
 * Initialize footer
 * Call this function to replace or insert the footer
 */
function initFooter() {
    // Check if we're in an admin directory
    const isAdminPage = window.location.pathname.includes('/admin/');

    // Find existing footer and replace it
    const existingFooter = document.querySelector('footer.footer, footer.footer-modern');
    if (existingFooter) {
        let footerHTML = getFooter();

        // Adjust links and image paths for admin pages
        if (isAdminPage) {
            footerHTML = footerHTML.replace(/href="([^"]+)"/g, (match, path) => {
                // Skip external links and anchors
                if (path.startsWith('http') || path.startsWith('#')) {
                    return match;
                }
                // Add ../ prefix for relative paths
                if (!path.startsWith('../') && !path.startsWith('/')) {
                    return `href="../${path}"`;
                }
                return match;
            });
            // Update image src paths for admin pages
            footerHTML = footerHTML.replace(/src="logo\.jpeg"/g, 'src="../logo.jpeg"');
        }

        existingFooter.outerHTML = footerHTML;

        // Apply translations after footer is inserted
        if (typeof applyTranslations === 'function') {
            setTimeout(() => applyTranslations(), 100);
        }
    } else {
        // If no footer exists, insert before closing body tag
        let footerHTML = getFooter();

        // Adjust links and image paths for admin pages
        if (isAdminPage) {
            footerHTML = footerHTML.replace(/href="([^"]+)"/g, (match, path) => {
                if (path.startsWith('http') || path.startsWith('#')) {
                    return match;
                }
                if (!path.startsWith('../') && !path.startsWith('/')) {
                    return `href="../${path}"`;
                }
                return match;
            });
            // Update image src paths for admin pages
            footerHTML = footerHTML.replace(/src="logo\.jpeg"/g, 'src="../logo.jpeg"');
        }

        document.body.insertAdjacentHTML('beforeend', footerHTML);

        // Apply translations after footer is inserted
        if (typeof applyTranslations === 'function') {
            setTimeout(() => applyTranslations(), 100);
        }
    }
}

