// Data filtering functions

/**
 * Filter points by month (YYYY-MM)
 */
function filterByMonth(points, monthString) {
    if (!monthString) {
        return points;
    }
    
    const [year, month] = monthString.split('-').map(Number);
    
    return points.filter(point => {
        if (!point.timestamp) return false;
        
        const date = new Date(point.timestamp);
        return date.getFullYear() === year && date.getMonth() === month - 1;
    });
}

/**
 * Filter points starting from a specific date
 */
function filterByDateFrom(points, dateString) {
    if (!dateString) {
        return points;
    }
    
    const filterDate = new Date(dateString);
    filterDate.setHours(0, 0, 0, 0);
    
    return points.filter(point => {
        if (!point.timestamp) return false;
        
        const pointDate = new Date(point.timestamp);
        pointDate.setHours(0, 0, 0, 0);
        
        return pointDate >= filterDate;
    });
}

/**
 * Filter points by georadius
 */
function filterByGeoradius(points, centerLat, centerLon, radiusKm) {
    if (centerLat === null || centerLon === null || radiusKm === null) {
        return points;
    }
    
    return points.filter(point => {
        const distance = calculateDistance(centerLat, centerLon, point.lat, point.lon);
        return distance <= radiusKm;
    });
}

/**
 * Apply all active filters to points
 */
function applyFilters(points, filters) {
    let filtered = [...points];
    
    // Apply month filter
    if (filters.month) {
        filtered = filterByMonth(filtered, filters.month);
    }
    
    // Apply date from filter
    if (filters.dateFrom) {
        filtered = filterByDateFrom(filtered, filters.dateFrom);
    }
    
    // Apply georadius filter
    if (filters.georadius && 
        filters.georadius.lat !== null && 
        filters.georadius.lon !== null && 
        filters.georadius.radius !== null) {
        filtered = filterByGeoradius(
            filtered,
            filters.georadius.lat,
            filters.georadius.lon,
            filters.georadius.radius
        );
    }
    
    return filtered;
}

