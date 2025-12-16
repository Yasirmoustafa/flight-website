// Utility Functions

/**
 * Show loading state on button
 */
function showButtonLoading(button) {
    if (!button) return; // Safety check
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline';
    button.disabled = true;
}

/**
 * Hide loading state on button
 */
function hideButtonLoading(button) {
    if (!button) return; // Safety check
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
    button.disabled = false;
}

/**
 * Show error message
 */
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.classList.remove('success-message');
    element.classList.add('error-message');
}

/**
 * Show success message
 */
function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.classList.remove('error-message');
    element.classList.add('success-message');
}

/**
 * Hide message
 */
function hideMessage(element) {
    element.style.display = 'none';
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format time to readable string
 */
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format currency (Malaysian Ringgit)
 * Handles large numbers with thousand separators and proper decimal formatting
 * Works with any number size including millions and billions
 * Examples: 
 *   100000 -> "RM 100,000"
 *   1200.5 -> "RM 1,200.50"
 *   1200 -> "RM 1,200"
 *   10000000 -> "RM 10,000,000"
 *   100000000.50 -> "RM 100,000,000.50"
 */
function formatCurrency(amount) {
    const num = parseFloat(amount);
    
    // Handle invalid numbers
    if (isNaN(num) || !isFinite(num)) {
        return 'RM 0';
    }
    
    // Round to 2 decimal places to avoid floating point issues
    const rounded = Math.round(num * 100) / 100;
    
    // Split into integer and decimal parts
    const parts = rounded.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add thousand separators to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Format decimal part (only if it exists and is not zero)
    let formattedDecimal = '';
    if (decimalPart) {
        // Remove trailing zeros
        const trimmedDecimal = decimalPart.replace(/0+$/, '');
        if (trimmedDecimal) {
            // Pad to 2 decimal places if needed
            formattedDecimal = trimmedDecimal.padEnd(2, '0');
            // But if it's exactly 2 zeros, remove it
            if (formattedDecimal === '00') {
                formattedDecimal = '';
            } else {
                formattedDecimal = '.' + formattedDecimal;
            }
        }
    }
    
    return `RM ${formattedInteger}${formattedDecimal}`;
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status) {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'approved';
    if (statusLower === 'rejected') return 'rejected';
    return 'pending';
}

/**
 * Redirect to page
 */
function redirectTo(url) {
    window.location.href = url;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const user = localStorage.getItem('user');
    return user !== null;
}

/**
 * Get current user
 */
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

/**
 * Set current user
 */
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.removeItem('user');
    }
}

/**
 * Check if user is admin
 */
function isAdmin() {
    const user = getCurrentUser();
    if (!user) return false;
    // Check role (case-insensitive)
    const role = (user.role || '').toLowerCase();
    return role === 'admin';
}

/**
 * Get URL parameter
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Malaysian format)
 */
function isValidPhone(phone) {
    const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Safely set innerHTML with sanitization
 */
function safeSetHTML(element, html) {
    if (!element) return;
    // Sanitize the HTML string
    const temp = document.createElement('div');
    temp.textContent = html;
    element.innerHTML = temp.innerHTML;
}

/**
 * Create safe HTML from template (for dynamic content)
 */
function createSafeHTML(template) {
    // This is a basic implementation - for production, consider using DOMPurify
    const div = document.createElement('div');
    div.textContent = template;
    return div.innerHTML;
}

