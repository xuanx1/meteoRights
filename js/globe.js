
// Utility function to parse CSV text into an array of objects
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, i) => {
            obj[header.trim()] = values[i] ? values[i].trim() : '';
        });
        return obj;
    });
}

// Load and process meteorite and fireball data
async function loadMeteoriteAndFireballData() {
    // Load Meteorite Landings
    const meteoriteResp = await fetch('../data/Meteorite_Landings.csv');
    const meteoriteText = await meteoriteResp.text();
    const meteorites = parseCSV(meteoriteText);

    // Load Fireball Reports
    const fireballResp = await fetch('../data/Fireball_And_Bolide_Reports_rows.csv');
    const fireballText = await fireballResp.text();
    const fireballs = parseCSV(fireballText);

    // Debug: Log first 3 parsed meteorite and fireball objects
    console.log('First 3 parsed meteorites:', meteorites.slice(0, 3));
    console.log('First 3 parsed fireballs:', fireballs.slice(0, 3));

    // Prepare markers for visualization
    const meteoriteMarkers = meteorites
        .filter(m => m.reclat && m.reclong)
        .map(m => ({
            type: 'meteorite',
            lat: parseFloat(m.reclat),
            lng: parseFloat(m.reclong),
            name: m.name || '',
            mass: m.mass || '',
            year: m.year || ''
        }));

    // Helper to parse coordinates with E/W/N/S and handle undefined/null
    function parseCoord(coord) {
        if (typeof coord !== 'string' || !coord.trim()) return null;
        
        // Clean and normalize the coordinate string
        coord = coord.trim().toUpperCase();
        console.log('Parsing coordinate:', coord);
        
        // Extract all digits, decimal points, and minus signs
        let numericMatch = coord.match(/^([0-9.-]+)/);
        if (!numericMatch) return null;
        
        let value = parseFloat(numericMatch[1]);
        if (isNaN(value)) return null;
        
        console.log('Extracted numeric value:', value);
        
        // Check for direction indicators anywhere in the string
        let hasNorth = coord.includes('N');
        let hasSouth = coord.includes('S');
        let hasEast = coord.includes('E');
        let hasWest = coord.includes('W');
        
        console.log('Direction indicators:', { hasNorth, hasSouth, hasEast, hasWest });
        
        // Apply direction-based sign conversion
        if (hasSouth || hasWest) {
            value = -Math.abs(value); // Force negative for South/West
            console.log('Applied South/West conversion (negative):', value);
        } else if (hasNorth || hasEast) {
            value = Math.abs(value); // Force positive for North/East
            console.log('Applied North/East conversion (positive):', value);
        }
        
        console.log('Final parsed coordinate:', value);
        return value;
    }

    function getField(obj, name) {
        // Try exact, lower, and trimmed
        return obj[name] || obj[name.toLowerCase()] || obj[name.trim()] || obj[name.toLowerCase().trim()];
    }

    if (fireballs.length > 0) {
        console.log('First fireball keys:', Object.keys(fireballs[0]));
        
        // Test coordinate parsing with known values
        console.log('=== COORDINATE PARSING TESTS ===');
        console.log('Testing "22.0S":', parseCoord('22.0S'), '(should be -22)');
        console.log('Testing "29.2E":', parseCoord('29.2E'), '(should be +29.2)');
        console.log('Testing "44.2S":', parseCoord('44.2S'), '(should be -44.2)');
        console.log('Testing "176.2W":', parseCoord('176.2W'), '(should be -176.2)');
        console.log('Testing "33.5N":', parseCoord('33.5N'), '(should be +33.5)');
        console.log('Testing "144.9E":', parseCoord('144.9E'), '(should be +144.9)');
        console.log('=== END COORDINATE TESTS ===');
    }
    const fireballMarkers = fireballs
        .filter(f => getField(f, 'Latitude (Deg)') && getField(f, 'Longitude (Deg)'))
        .map(f => {
            let rawLat = getField(f, 'Latitude (Deg)');
            let rawLng = getField(f, 'Longitude (Deg)');
            let lat = parseCoord(rawLat);
            let lng = parseCoord(rawLng);
            
            // Debug coordinate conversion for first few entries
            if (fireballs.indexOf(f) < 3) {
                console.log(`Coordinate conversion debug:
                  Raw lat: "${rawLat}" -> Parsed: ${lat}
                  Raw lng: "${rawLng}" -> Parsed: ${lng}`);
            }
            
            // Clamp latitude to [-90, 90] range only
            lat = Math.max(-90, Math.min(90, lat));
            // Keep longitude in [-180, 180] range
            lng = Math.max(-180, Math.min(180, lng));
            
            // Try multiple field name variations for altitude
            let altitude = getField(f, 'Altitude (km)') || 
                          getField(f, 'Altitude') || 
                          getField(f, 'altitude (km)') || 
                          getField(f, 'altitude') || '0';
            
            return {
                type: 'fireball',
                lat,
                lng,
                altitude: altitude, // Include altitude data
                energy: getField(f, 'Total Radiated Energy (J)') || '',
                date: getField(f, 'Date/Time - Peak Brightness (UT)') || 
                      getField(f, 'Peak Brightness Date/Time (UT)') || '',
                velocity: getField(f, 'Velocity (km/s)') || '',
                // Store raw fireball data for hover
                rawData: f
            };
        });
    console.log('fireballMarkers:', fireballMarkers);
    console.log('fireballMarkers count:', fireballMarkers.length);
    if (fireballMarkers.length > 0) {
        console.log('First fireball marker:', fireballMarkers[0]);
        console.log('Sample coordinates:', fireballMarkers.slice(0, 5).map(f => ({ lat: f.lat, lng: f.lng, altitude: f.altitude })));
        console.log('Altitude values:', fireballMarkers.slice(0, 10).map(f => f.altitude));
        console.log('Parsed altitude numbers:', fireballMarkers.slice(0, 10).map(f => parseFloat(f.altitude) || 0));
    }

    // Call separate callbacks if set
    if (typeof addFireballMarkersToGlobe === 'function') {
        addFireballMarkersToGlobe(fireballMarkers);
    } else {
        console.log('Fireball markers ready:', fireballMarkers);
    }
    if (typeof addMeteoriteMarkersToGlobe === 'function') {
        addMeteoriteMarkersToGlobe(meteoriteMarkers);
    } else {
        console.log('Meteorite markers ready:', meteoriteMarkers);
    }
}


// This function will be set by index.html after world is created
let addFireballMarkersToGlobe = null;
let addMeteoriteMarkersToGlobe = null;
function setAddFireballMarkersToGlobe(fn) {
  addFireballMarkersToGlobe = fn;
}
function setAddMeteoriteMarkersToGlobe(fn) {
  addMeteoriteMarkersToGlobe = fn;
}
export { loadMeteoriteAndFireballData, setAddFireballMarkersToGlobe, setAddMeteoriteMarkersToGlobe };
