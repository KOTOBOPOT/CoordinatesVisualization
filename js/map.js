// Map management

let map = null;
let markersLayer = null;

/**
 * Initialize the map
 */
function initMap() {
    if (map) {
        return; // Map already initialized
    }
    
    // Create map centered on Europe
    map = L.map('map').setView([50.0, 14.0], 4);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Create layer group for markers
    markersLayer = L.layerGroup().addTo(map);
    
    // Hide message overlay
    document.getElementById('messageOverlay').classList.add('hidden');
}

/**
 * Render points on the map
 */
function renderPoints(points) {
    if (!map) {
        initMap();
    }
    
    // Clear existing markers
    markersLayer.clearLayers();
    
    if (!points || points.length === 0) {
        showNotification('Нет точек для отображения', 'error');
        return;
    }
    
    // Add markers for each point
    const bounds = [];
    
    // Group points by coordinates to handle duplicates
    const coordGroups = {};
    points.forEach((point, index) => {
        const key = `${point.lat.toFixed(6)},${point.lon.toFixed(6)}`;
        if (!coordGroups[key]) {
            coordGroups[key] = [];
        }
        coordGroups[key].push({ ...point, originalIndex: index });
    });
    
    // Add markers with offset for duplicates
    Object.entries(coordGroups).forEach(([coordKey, groupPoints]) => {
        groupPoints.forEach((point, groupIndex) => {
            let lat = point.lat;
            let lon = point.lon;
            
            // Apply small offset for duplicate coordinates (stacking)
            if (groupPoints.length > 1) {
                const offsetAmount = 0.0001; // Small offset
                const angle = (groupIndex / groupPoints.length) * 2 * Math.PI;
                lat += offsetAmount * Math.cos(angle);
                lon += offsetAmount * Math.sin(angle);
            }
            
            const marker = L.marker([lat, lon]);
            
            // Create popup content
            let popupContent = `<div class="popup-content">`;
            popupContent += `<h3>Точка ${point.originalIndex + 1}</h3>`;
            
            if (groupPoints.length > 1) {
                popupContent += `<p style="color: #f39c12;"><strong>⚠️ Дубликат координат (${groupPoints.length} точек)</strong></p>`;
            }
            
            popupContent += `<p><strong>Координаты:</strong> ${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}</p>`;
            
            if (point.name) {
                popupContent += `<p><strong>Название:</strong> ${point.name}</p>`;
            }
            
            if (point.timestamp) {
                popupContent += `<p><strong>Дата:</strong> ${formatDate(point.timestamp)}</p>`;
            }
            
            // Add Yandex Maps panorama link
            const yandexUrl = `https://yandex.ru/maps/?panorama[point]=${point.lon},${point.lat}&panorama[direction]=0,0&panorama[span]=120,60&l=stv`;
            popupContent += `<p><a href="${yandexUrl}" target="_blank" rel="noopener noreferrer">🔍 Панорама Яндекс.Карты</a></p>`;
            
            popupContent += `</div>`;
            
            marker.bindPopup(popupContent);
            marker.addTo(markersLayer);
            
            bounds.push([point.lat, point.lon]);
        });
    });
    
    // Fit map to show all markers
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Update map legend
    updateMapLegend(points.length, Object.keys(coordGroups).length);
    
    showNotification(`Отображено ${points.length} точек на карте`, 'success');
}

/**
 * Update map legend with statistics
 */
function updateMapLegend(totalPoints, uniqueLocations) {
    // Remove existing legend if present
    const existingLegend = document.querySelector('.map-legend');
    if (existingLegend) {
        existingLegend.remove();
    }
    
    // Create new legend
    const legend = document.createElement('div');
    legend.className = 'map-legend';
    legend.innerHTML = `
        <div class="legend-header">📍 Статистика маркеров</div>
        <div class="legend-item">
            <span class="legend-label">Всего точек:</span>
            <span class="legend-value">${totalPoints}</span>
        </div>
        <div class="legend-item">
            <span class="legend-label">Уникальных локаций:</span>
            <span class="legend-value">${uniqueLocations}</span>
        </div>
        ${totalPoints !== uniqueLocations ? `
        <div class="legend-item">
            <span class="legend-label">Дубликатов:</span>
            <span class="legend-value">${totalPoints - uniqueLocations}</span>
        </div>
        ` : ''}
    `;
    
    // Add legend to map container
    const mapContainer = document.getElementById('map');
    mapContainer.appendChild(legend);
}

/**
 * Clear all markers from the map
 */
function clearMap() {
    if (markersLayer) {
        markersLayer.clearLayers();
    }
    
    // Remove legend
    const legend = document.querySelector('.map-legend');
    if (legend) {
        legend.remove();
    }
    
    showNotification('Карта очищена', 'info');
}

/**
 * Add click handler to map for selecting center point
 */
function enableCenterSelection(callback) {
    if (!map) {
        initMap();
    }
    
    // Temporarily change cursor
    document.getElementById('map').style.cursor = 'crosshair';
    
    const clickHandler = (e) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        
        callback(lat, lon);
        
        // Remove handler and restore cursor
        map.off('click', clickHandler);
        document.getElementById('map').style.cursor = '';
    };
    
    map.on('click', clickHandler);
    showNotification('Кликните на карту, чтобы выбрать центр', 'info');
}

