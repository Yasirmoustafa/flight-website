// Internationalization (i18n) System
// Applies translations to the page dynamically

/**
 * Apply translations to the current page
 */
function applyTranslations() {
    if (typeof t !== 'function' || typeof getCurrentLanguage !== 'function') {
        console.warn('Translation functions not available');
        return;
    }
    
    const lang = getCurrentLanguage();
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        
        const translation = t(key);
        
        // Handle different element types
        if (element.tagName === 'INPUT') {
            if (element.type === 'submit' || element.type === 'button') {
                element.value = translation;
            } else if (element.hasAttribute('placeholder') || element.placeholder !== undefined) {
                // Check if there's a data-i18n-placeholder attribute
                const placeholderKey = element.getAttribute('data-i18n-placeholder');
                if (placeholderKey) {
                    element.placeholder = t(placeholderKey);
                } else {
                    element.placeholder = translation;
                }
            } else {
                element.value = translation;
            }
        } else if (element.tagName === 'TEXTAREA') {
            const placeholderKey = element.getAttribute('data-i18n-placeholder');
            if (placeholderKey) {
                element.placeholder = t(placeholderKey);
            } else {
                element.textContent = translation;
            }
        } else if (element.tagName === 'OPTION') {
            element.textContent = translation;
        } else {
            // For other elements, update text content
            element.textContent = translation;
        }
    });
    
    // Update all elements with data-i18n-html attribute (for HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        if (!key) return;
        const translation = t(key);
        element.innerHTML = translation;
    });
    
    // Update language switcher button text
    const langToggle = document.getElementById('langToggle');
    const langToggleMobile = document.getElementById('langToggleMobile');
    if (langToggle) {
        const langTextSpan = langToggle.querySelector('.lang-text');
        if (langTextSpan) {
            langTextSpan.textContent = lang === 'ar' ? 'EN' : 'AR';
        }
    }
    if (langToggleMobile) {
        const langTextSpan = langToggleMobile.querySelector('.lang-text');
        if (langTextSpan) {
            langTextSpan.textContent = lang === 'ar' ? 'EN' : 'AR';
        }
    }
}

/**
 * Switch language and reload page
 */
function switchLanguage(lang) {
    if (typeof setCurrentLanguage === 'function') {
        setCurrentLanguage(lang);
        window.location.reload();
    }
}

// Initialize translations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for all scripts to load
        setTimeout(() => {
            if (typeof getCurrentLanguage === 'function') {
                const lang = getCurrentLanguage();
                if (typeof setCurrentLanguage === 'function') {
                    setCurrentLanguage(lang);
                }
            }
            applyTranslations();
        }, 100);
    });
} else {
    setTimeout(() => {
        if (typeof getCurrentLanguage === 'function') {
            const lang = getCurrentLanguage();
            if (typeof setCurrentLanguage === 'function') {
                setCurrentLanguage(lang);
            }
        }
        applyTranslations();
    }, 100);
}

