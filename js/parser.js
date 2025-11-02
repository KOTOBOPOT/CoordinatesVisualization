// Data parsing functions

/**
 * Parse text input with multiple coordinate formats
 */
function parseTextInput(text) {
    const points = [];
    
    if (!text || text.trim() === '') {
        throw new Error('Пустой ввод');
    }
    
    // Try to parse as JSON first
    try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData)) {
            // Array of objects
            for (let item of jsonData) {
                if (item.lat !== undefined && item.lon !== undefined) {
                    const lat = parseFloat(item.lat);
                    const lon = parseFloat(item.lon);
                    
                    if (isValidCoordinate(lat, lon)) {
                        points.push({
                            lat: lat,
                            lon: lon,
                            timestamp: item.timestamp || null,
                            name: item.name || null
                        });
                    }
                }
            }
        } else if (jsonData.lat !== undefined && jsonData.lon !== undefined) {
            // Single object
            const lat = parseFloat(jsonData.lat);
            const lon = parseFloat(jsonData.lon);
            
            if (isValidCoordinate(lat, lon)) {
                points.push({
                    lat: lat,
                    lon: lon,
                    timestamp: jsonData.timestamp || null,
                    name: jsonData.name || null
                });
            }
        }
        
        if (points.length > 0) {
            return points;
        }
    } catch (e) {
        // Not JSON, continue with other formats
    }
    
    // Parse as comma/semicolon separated coordinates
    // Format: lat,lon; lat,lon or lat,lon\nlat,lon
    const lines = text.split(/[;\n]/);
    
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        // Try to parse as lat,lon
        const parts = line.split(',').map(p => p.trim());
        
        if (parts.length >= 2) {
            const lat = parseFloat(parts[0]);
            const lon = parseFloat(parts[1]);
            
            if (isValidCoordinate(lat, lon)) {
                const point = {
                    lat: lat,
                    lon: lon,
                    timestamp: null,
                    name: null
                };
                
                // Check for timestamp in third position
                if (parts.length >= 3 && parts[2]) {
                    const timestamp = parseDate(parts[2]);
                    if (timestamp) {
                        point.timestamp = timestamp;
                    }
                }
                
                // Check for name in fourth position
                if (parts.length >= 4 && parts[3]) {
                    point.name = parts[3];
                }
                
                points.push(point);
            }
        }
    }
    
    if (points.length === 0) {
        throw new Error('Не удалось распарсить координаты. Проверьте формат.');
    }
    
    return points;
}

/**
 * Parse CSV data
 */
function parseCSV(csvText) {
    const points = [];
    
    if (!csvText || csvText.trim() === '') {
        throw new Error('Пустой CSV');
    }
    
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
        throw new Error('CSV файл пустой');
    }
    
    // Parse header
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
    
    // Find column indices
    const latIndex = headers.findIndex(h => h === 'lat' || h === 'latitude');
    const lonIndex = headers.findIndex(h => h === 'lon' || h === 'longitude');
    const timestampIndex = headers.findIndex(h => h === 'timestamp' || h === 'date' || h === 'datetime');
    const nameIndex = headers.findIndex(h => h === 'name' || h === 'title' || h === 'label');
    
    if (latIndex === -1 || lonIndex === -1) {
        throw new Error('CSV должен содержать колонки lat и lon');
    }
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        
        const values = parseCSVLine(line);
        
        if (values.length <= Math.max(latIndex, lonIndex)) {
            continue; // Skip incomplete rows
        }
        
        const lat = parseFloat(values[latIndex]);
        const lon = parseFloat(values[lonIndex]);
        
        if (!isValidCoordinate(lat, lon)) {
            console.warn(`Строка ${i + 1}: Некорректные координаты (${lat}, ${lon})`);
            continue;
        }
        
        const point = {
            lat: lat,
            lon: lon,
            timestamp: null,
            name: null
        };
        
        // Parse timestamp if available
        if (timestampIndex !== -1 && values[timestampIndex]) {
            const timestamp = parseDate(values[timestampIndex]);
            if (timestamp) {
                point.timestamp = timestamp;
            }
        }
        
        // Parse name if available
        if (nameIndex !== -1 && values[nameIndex]) {
            point.name = values[nameIndex];
        }
        
        points.push(point);
    }
    
    if (points.length === 0) {
        throw new Error('Не найдено валидных координат в CSV');
    }
    
    return points;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current.trim());
    
    return values;
}

/**
 * Parse file from file input
 */
function parseFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const points = parseCSV(content);
                resolve(points);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Ошибка чтения файла'));
        };
        
        reader.readAsText(file);
    });
}

