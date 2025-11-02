// Utility functions

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

/**
 * Validate latitude value
 */
function isValidLat(lat) {
    const num = parseFloat(lat);
    return !isNaN(num) && num >= -90 && num <= 90;
}

/**
 * Validate longitude value
 */
function isValidLon(lon) {
    const num = parseFloat(lon);
    return !isNaN(num) && num >= -180 && num <= 180;
}

/**
 * Validate coordinate pair
 */
function isValidCoordinate(lat, lon) {
    return isValidLat(lat) && isValidLon(lon);
}

/**
 * Parse date string in various formats
 */
function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Try ISO format first
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date;
    }
    
    // Try other common formats
    const formats = [
        /^(\d{4})-(\d{2})-(\d{2})$/,  // YYYY-MM-DD
        /^(\d{2})\/(\d{2})\/(\d{4})$/,  // DD/MM/YYYY
        /^(\d{4})\/(\d{2})\/(\d{2})$/   // YYYY/MM/DD
    ];
    
    for (let format of formats) {
        const match = dateStr.match(format);
        if (match) {
            date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
    
    return null;
}

/**
 * Format date for display
 */
function formatDate(date) {
    if (!date) return '';
    if (typeof date === 'string') {
        date = new Date(date);
    }
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function toRad(degrees) {
    return degrees * Math.PI / 180;
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

