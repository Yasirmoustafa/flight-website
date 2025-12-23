/**
 * Pagination Utility
 * Handles pagination for admin tables and other data displays
 */

/**
 * Create pagination controls HTML
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {string} containerId - ID of the container to attach pagination to
 * @returns {string} HTML string for pagination controls
 */
function createPaginationHTML(currentPage, totalPages, containerId) {
    if (totalPages <= 1) {
        return '';
    }

    const t = typeof window !== 'undefined' && typeof window.t === 'function' ? window.t : (key) => key;
    
    let html = '<div class="pagination-container">';
    html += '<div class="pagination-info">';
    html += `<span>${t('pagination.page')} ${currentPage} ${t('pagination.of')} ${totalPages}</span>`;
    html += '</div>';
    html += '<div class="pagination-controls">';
    
    // Previous button
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage('${containerId}', ${currentPage - 1})" aria-label="${t('pagination.previous')}">`;
    html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    html += '<path d="M15 18l-6-6 6-6"></path>';
    html += '</svg>';
    html += '</button>';
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="goToPage('${containerId}', 1)">1</button>`;
        if (startPage > 2) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage('${containerId}', ${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
        html += `<button class="pagination-btn" onclick="goToPage('${containerId}', ${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage('${containerId}', ${currentPage + 1})" aria-label="${t('pagination.next')}">`;
    html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
    html += '<path d="M9 18l6-6-6-6"></path>';
    html += '</svg>';
    html += '</button>';
    
    html += '</div>';
    html += '</div>';
    
    return html;
}

/**
 * Get paginated data
 * @param {Array} data - Full data array
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Object with paginatedData, totalPages, currentPage
 */
function getPaginatedData(data, currentPage = 1, itemsPerPage = 10) {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
        paginatedData,
        totalPages,
        currentPage: Math.min(currentPage, totalPages || 1),
        totalItems: data.length,
        itemsPerPage
    };
}

/**
 * Initialize pagination for a container
 * @param {string} containerId - ID of the container
 * @param {Array} data - Full data array
 * @param {Function} renderFunction - Function to render the data
 * @param {number} itemsPerPage - Number of items per page (default: 10)
 */
function initPagination(containerId, data, renderFunction, itemsPerPage = 10) {
    if (!window.paginationState) {
        window.paginationState = {};
    }
    
    window.paginationState[containerId] = {
        data: data,
        currentPage: 1,
        itemsPerPage: itemsPerPage,
        renderFunction: renderFunction
    };
    
    // Render first page
    updatePagination(containerId);
}

/**
 * Update pagination display
 * @param {string} containerId - ID of the container
 */
function updatePagination(containerId) {
    const state = window.paginationState?.[containerId];
    if (!state) return;
    
    const { data, currentPage, itemsPerPage, renderFunction } = state;
    const { paginatedData, totalPages } = getPaginatedData(data, currentPage, itemsPerPage);
    
    // Render the data
    if (renderFunction) {
        renderFunction(paginatedData);
    }
    
    // Update pagination controls
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Remove existing pagination
    const existingPagination = container.parentElement.querySelector('.pagination-container');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    // Add new pagination
    const paginationHTML = createPaginationHTML(currentPage, totalPages, containerId);
    if (paginationHTML) {
        container.insertAdjacentHTML('afterend', paginationHTML);
    }
}

/**
 * Go to a specific page
 * @param {string} containerId - ID of the container
 * @param {number} page - Page number to go to
 */
function goToPage(containerId, page) {
    const state = window.paginationState?.[containerId];
    if (!state) return;
    
    const { data, itemsPerPage } = state;
    const { totalPages } = getPaginatedData(data, 1, itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    state.currentPage = page;
    updatePagination(containerId);
    
    // Scroll to top of table
    const container = document.getElementById(containerId);
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Update data for pagination (useful when filtering/searching)
 * @param {string} containerId - ID of the container
 * @param {Array} newData - New data array
 */
function updatePaginationData(containerId, newData) {
    if (!window.paginationState) {
        window.paginationState = {};
    }
    
    const state = window.paginationState[containerId];
    if (state) {
        state.data = newData;
        state.currentPage = 1; // Reset to first page
        updatePagination(containerId);
    } else {
        // Initialize if doesn't exist
        initPagination(containerId, newData, null, 10);
    }
}

