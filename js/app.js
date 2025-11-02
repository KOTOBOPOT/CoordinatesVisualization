// Main application logic

// Application state
const state = {
    allPoints: [],
    filteredPoints: [],
    filters: {
        month: null,
        dateFrom: null,
        georadius: {
            lat: null,
            lon: null,
            radius: null
        }
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventHandlers();
    initMap();
});

/**
 * Initialize all event handlers
 */
function initializeEventHandlers() {
    // Text input parsing
    document.getElementById('parseTextBtn').addEventListener('click', handleTextParse);
    
    // File input
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // Paste area
    document.getElementById('parsePasteBtn').addEventListener('click', handlePasteParse);
    
    // Filters
    document.getElementById('monthFilter').addEventListener('change', updateFiltersFromUI);
    document.getElementById('dateFromFilter').addEventListener('change', updateFiltersFromUI);
    document.getElementById('clearMonthBtn').addEventListener('click', () => {
        document.getElementById('monthFilter').value = '';
        updateFiltersFromUI();
    });
    document.getElementById('clearDateBtn').addEventListener('click', () => {
        document.getElementById('dateFromFilter').value = '';
        updateFiltersFromUI();
    });
    
    // Georadius filter
    document.getElementById('applyRadiusBtn').addEventListener('click', handleRadiusApply);
    document.getElementById('clearRadiusBtn').addEventListener('click', handleRadiusClear);
    
    // Filter buttons
    document.getElementById('applyFiltersBtn').addEventListener('click', handleApplyFilters);
    document.getElementById('clearAllFiltersBtn').addEventListener('click', handleClearAllFilters);
    
    // Preview
    document.getElementById('showPreviewBtn').addEventListener('click', showDataPreview);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    
    // Map buttons
    document.getElementById('renderMapBtn').addEventListener('click', handleRenderMap);
    document.getElementById('clearMapBtn').addEventListener('click', clearMap);
    
    // Modal close on background click
    document.getElementById('previewModal').addEventListener('click', (e) => {
        if (e.target.id === 'previewModal') {
            closeModal();
        }
    });
    
    // Enable map click for center selection
    document.getElementById('centerLat').addEventListener('focus', () => {
        enableCenterSelection((lat, lon) => {
            document.getElementById('centerLat').value = lat.toFixed(6);
            document.getElementById('centerLon').value = lon.toFixed(6);
        });
    });
    
    document.getElementById('centerLon').addEventListener('focus', () => {
        enableCenterSelection((lat, lon) => {
            document.getElementById('centerLat').value = lat.toFixed(6);
            document.getElementById('centerLon').value = lon.toFixed(6);
        });
    });
}

/**
 * Handle text input parsing
 */
function handleTextParse() {
    const text = document.getElementById('textInput').value;
    
    try {
        const points = parseTextInput(text);
        loadPoints(points);
        showNotification(`Загружено ${points.length} точек`, 'success');
        document.getElementById('textInput').value = '';
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}

/**
 * Handle file selection
 */
async function handleFileSelect(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    try {
        const points = await parseFile(file);
        loadPoints(points);
        showNotification(`Загружено ${points.length} точек из файла`, 'success');
        e.target.value = ''; // Clear file input
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}

/**
 * Handle paste area parsing
 */
function handlePasteParse() {
    const pasteArea = document.getElementById('pasteArea');
    const text = pasteArea.textContent || pasteArea.innerText;
    
    try {
        const points = parseCSV(text);
        loadPoints(points);
        showNotification(`Загружено ${points.length} точек`, 'success');
        pasteArea.textContent = '';
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}

/**
 * Load points into application state
 */
function loadPoints(points) {
    state.allPoints = points;
    state.filteredPoints = [...points];
    updateStats();
}

/**
 * Update filters from UI inputs
 */
function updateFiltersFromUI() {
    state.filters.month = document.getElementById('monthFilter').value || null;
    state.filters.dateFrom = document.getElementById('dateFromFilter').value || null;
}

/**
 * Handle radius filter apply
 */
function handleRadiusApply() {
    const lat = parseFloat(document.getElementById('centerLat').value);
    const lon = parseFloat(document.getElementById('centerLon').value);
    const radius = parseFloat(document.getElementById('radius').value);
    
    if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
        showNotification('Заполните все поля для фильтра по радиусу', 'error');
        return;
    }
    
    if (!isValidCoordinate(lat, lon)) {
        showNotification('Некорректные координаты центра', 'error');
        return;
    }
    
    if (radius <= 0) {
        showNotification('Радиус должен быть больше 0', 'error');
        return;
    }
    
    state.filters.georadius = { lat, lon, radius };
    showNotification('Фильтр по радиусу установлен', 'success');
}

/**
 * Handle radius filter clear
 */
function handleRadiusClear() {
    document.getElementById('centerLat').value = '';
    document.getElementById('centerLon').value = '';
    document.getElementById('radius').value = '';
    state.filters.georadius = { lat: null, lon: null, radius: null };
    showNotification('Фильтр по радиусу сброшен', 'info');
}

/**
 * Apply all filters
 */
function handleApplyFilters() {
    updateFiltersFromUI();
    state.filteredPoints = applyFilters(state.allPoints, state.filters);
    updateStats();
    showNotification(`Применены фильтры: ${state.filteredPoints.length} точек`, 'success');
}

/**
 * Clear all filters
 */
function handleClearAllFilters() {
    // Clear UI
    document.getElementById('monthFilter').value = '';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('centerLat').value = '';
    document.getElementById('centerLon').value = '';
    document.getElementById('radius').value = '';
    
    // Reset state
    state.filters = {
        month: null,
        dateFrom: null,
        georadius: { lat: null, lon: null, radius: null }
    };
    
    state.filteredPoints = [...state.allPoints];
    updateStats();
    showNotification('Все фильтры сброшены', 'info');
}

/**
 * Update statistics display
 */
function updateStats() {
    document.getElementById('totalPoints').textContent = state.allPoints.length;
    document.getElementById('filteredPoints').textContent = state.filteredPoints.length;
}

/**
 * Show data preview modal
 */
function showDataPreview() {
    const points = state.filteredPoints;
    
    if (points.length === 0) {
        showNotification('Нет данных для предпросмотра', 'error');
        return;
    }
    
    const previewContent = document.getElementById('previewContent');
    
    let html = '<table>';
    html += '<thead><tr>';
    html += '<th>#</th><th>Lat</th><th>Lon</th>';
    
    if (points.some(p => p.timestamp)) {
        html += '<th>Timestamp</th>';
    }
    
    if (points.some(p => p.name)) {
        html += '<th>Name</th>';
    }
    
    html += '</tr></thead><tbody>';
    
    // Show first 100 points
    const displayCount = Math.min(points.length, 100);
    
    for (let i = 0; i < displayCount; i++) {
        const point = points[i];
        html += '<tr>';
        html += `<td>${i + 1}</td>`;
        html += `<td>${point.lat.toFixed(6)}</td>`;
        html += `<td>${point.lon.toFixed(6)}</td>`;
        
        if (points.some(p => p.timestamp)) {
            html += `<td>${point.timestamp ? formatDate(point.timestamp) : '-'}</td>`;
        }
        
        if (points.some(p => p.name)) {
            html += `<td>${point.name || '-'}</td>`;
        }
        
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    
    if (points.length > 100) {
        html += `<p style="margin-top: 1rem; color: #888;">Показано первых 100 из ${points.length} точек</p>`;
    }
    
    previewContent.innerHTML = html;
    document.getElementById('previewModal').classList.remove('hidden');
}

/**
 * Close preview modal
 */
function closeModal() {
    document.getElementById('previewModal').classList.add('hidden');
}

/**
 * Render filtered points on map
 */
function handleRenderMap() {
    if (state.filteredPoints.length === 0) {
        showNotification('Нет точек для отображения. Загрузите данные.', 'error');
        return;
    }
    
    renderPoints(state.filteredPoints);
}

