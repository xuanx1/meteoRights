
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
    // Load Meteorite Landings - use relative path for GitHub Pages
    const meteoriteResp = await fetch('./data/Meteorite_Landings.csv');
    const meteoriteText = await meteoriteResp.text();
    const meteorites = parseCSV(meteoriteText);

    // Load Fireball Reports - use relative path for GitHub Pages
    const fireballResp = await fetch('./data/Fireball_And_Bolide_Reports_rows.csv');
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
            mass: m['mass (g)'] || '',
            year: m.year || '',
            recclass: m.recclass || ''
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
    
    // Load ISS position data
    await loadISSPosition();
    
    // Load Tiangong position data
    await loadTiangongPosition();
    
    // Load astronaut data
    await loadAstronautData();
}

// Function to fetch and update ISS position
async function loadISSPosition() {
    console.log('🛰️ Loading ISS position...');
    
    try {
        // Fetch current ISS position from API
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await response.json();
        
        console.log('ISS API Response:', data);
        
        if (data.latitude && data.longitude) {
            const issData = {
                lat: parseFloat(data.latitude),
                lng: parseFloat(data.longitude),
                altitude: 408, // ISS altitude in km
                timestamp: Date.now() / 1000
            };
            
            console.log('ISS Position from API:', issData);
            
            // Call ISS callback if set
            if (typeof addISSToGlobe === 'function') {
                addISSToGlobe(issData);
            } else {
                console.log('ISS data ready but no callback set:', issData);
            }
            return;
        }
    } catch (error) {
        console.warn('Failed to fetch ISS position from API:', error);
    }
    
    // Fallback: Create a default ISS position for demonstration
    console.log('Using fallback ISS position...');
    const fallbackISS = {
        lat: 25.7617,  // Over Florida
        lng: -80.1918,
        altitude: 408,
        timestamp: Date.now() / 1000
    };
    
    console.log('Fallback ISS Position:', fallbackISS);
    
    if (typeof addISSToGlobe === 'function') {
        addISSToGlobe(fallbackISS);
        console.log('✅ ISS fallback data sent to globe');
    } else {
        console.log('❌ ISS data ready but no callback function set');
    }
}

// Function to fetch and update Tiangong position
async function loadTiangongPosition() {
    console.log('🏗️ Loading Tiangong position...');
    
    try {
        // Try to fetch Tiangong position from satellite tracking API
        // Note: Tiangong (CSS) NORAD ID is 48274
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/48274');
        const data = await response.json();
        
        console.log('Tiangong API Response:', data);
        
        if (data.latitude && data.longitude) {
            const tiangongData = {
                lat: parseFloat(data.latitude),
                lng: parseFloat(data.longitude),
                altitude: 340, // Tiangong altitude in km (lower than ISS)
                timestamp: Date.now() / 1000
            };
            
            console.log('Tiangong Position from API:', tiangongData);
            
            // Call Tiangong callback if set
            if (typeof addTiangongToGlobe === 'function') {
                addTiangongToGlobe(tiangongData);
            } else {
                console.log('Tiangong data ready but no callback set:', tiangongData);
            }
            return;
        }
    } catch (error) {
        console.warn('Failed to fetch Tiangong position from API:', error);
    }
    
    // Fallback: Create a default Tiangong position for demonstration
    console.log('Using fallback Tiangong position...');
    const fallbackTiangong = {
        lat: 35.8617,  // Over China
        lng: 104.1954,
        altitude: 340,
        timestamp: Date.now() / 1000
    };
    
    console.log('Fallback Tiangong Position:', fallbackTiangong);
    
    if (typeof addTiangongToGlobe === 'function') {
        addTiangongToGlobe(fallbackTiangong);
        console.log('✅ Tiangong fallback data sent to globe');
    } else {
        console.log('❌ Tiangong data ready but no callback function set');
    }
}

// Function to fetch astronaut data
async function loadAstronautData() {
    console.log('👨‍🚀 Loading astronaut data...');
    
    try {
        const response = await fetch('https://api.open-notify.org/astros.json');
        const data = await response.json();
        
        console.log('👨‍🚀 Astronaut API Response:', data);
        
        if (data.people && data.number) {
            // Group astronauts by spacecraft
            const craftGroups = {};
            data.people.forEach(person => {
                if (!craftGroups[person.craft]) {
                    craftGroups[person.craft] = [];
                }
                craftGroups[person.craft].push(person);
            });
            
            const astronautData = {
                number: data.number,
                craftGroups: craftGroups
            };
            
            console.log(`👨‍🚀 ${data.number} people currently in space, grouped by craft:`, craftGroups);
            
            // Call astronaut callback if set
            if (typeof addAstronautPanelToPage === 'function') {
                addAstronautPanelToPage(astronautData);
            } else {
                console.log('👨‍🚀 Astronaut data ready but no callback set:', astronautData);
            }
        }
    } catch (error) {
        console.warn('👨‍🚀 Failed to fetch astronaut data from API:', error);
        
        // Fallback data with multiple spacecraft
        const fallbackData = {
            number: 7,
            craftGroups: {
                "ISS": [
                    { name: "Expedition 72 Commander", craft: "ISS" },
                    { name: "Flight Engineer 1", craft: "ISS" },
                    { name: "Flight Engineer 2", craft: "ISS" },
                    { name: "Flight Engineer 3", craft: "ISS" }
                ],
                "Tiangong": [
                    { name: "Taikonaut 1", craft: "Tiangong" },
                    { name: "Taikonaut 2", craft: "Tiangong" },
                    { name: "Taikonaut 3", craft: "Tiangong" }
                ]
            }
        };
        
        console.log('👨‍🚀 Using fallback astronaut data');
        if (typeof addAstronautPanelToPage === 'function') {
            addAstronautPanelToPage(fallbackData);
        }
    }
}


// This function will be set by index.html after world is created
let addFireballMarkersToGlobe = null;
let addMeteoriteMarkersToGlobe = null;
let addISSToGlobe = null;
let addTiangongToGlobe = null;
let addAstronautPanelToPage = null;

function setAddFireballMarkersToGlobe(fn) {
  addFireballMarkersToGlobe = fn;
}
function setAddMeteoriteMarkersToGlobe(fn) {
  addMeteoriteMarkersToGlobe = fn;
}
function setAddISSToGlobe(fn) {
  addISSToGlobe = fn;
}
function setAddTiangongToGlobe(fn) {
  addTiangongToGlobe = fn;
}
function setAddAstronautPanelToPage(fn) {
  addAstronautPanelToPage = fn;
}

export { loadMeteoriteAndFireballData, setAddFireballMarkersToGlobe, setAddMeteoriteMarkersToGlobe, setAddISSToGlobe, setAddTiangongToGlobe, setAddAstronautPanelToPage };
