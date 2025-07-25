# All Fireballs and Meteorites Ever Recorded, Mapped
## and the ISS and Tiangong too.

[Preview](https://xuanx1.github.io/meteoRights/)
![Screenshot 2025-07-24 184919](https://github.com/user-attachments/assets/b420a6d7-b284-4299-9469-cb2db99c724c)


## Data Sources & APIs

### Fireball Data
- **NASA CNEOS Fireball and Bolide Reports**: Center for Near Earth Object Studies (CNEOS) at NASA's Jet Propulsion Laboratory
  - Source: `data/Fireball_And_Bolide_Reports_rows.csv`
  - Contains fireball events with energy measurements, coordinates, velocities, and altitudes

### Meteorite Data  
- **NASA Meteorite Landings Database**: NASA's Open Data Portal
  - Source: `data/Meteorite_Landings.csv`
  - Contains verified meteorite landing locations, masses, classifications, and discovery years

### International Space Station (ISS)
- **ISS Location API**: Real-time ISS position tracking via [Open Notify](http://api.open-notify.org/iss-now.json) (NASA) and [wheretheiss.at](https://api.wheretheiss.at/v1/satellites/25544)
  - API Endpoints: 
    - `https://api.open-notify.org/iss-now.json` (via CORS proxy)
    - `https://api.wheretheiss.at/v1/satellites/25544` (via CORS proxy)
  - Uses multiple CORS proxies for reliability on GitHub Pages
  - Fallback: Simulated ISS position if all APIs fail
  - Altitude: ~408 km above Earth surface

### Tiangong Space Station
- **Tiangong Location API**: Real-time Tiangong position tracking via [wheretheiss.at](https://api.wheretheiss.at/v1/satellites/48274)
  - API Endpoints:
    - `https://api.wheretheiss.at/v1/satellites/48274` (via CORS proxy)
  - Uses multiple CORS proxies for reliability on GitHub Pages
  - Fallback: Simulated Tiangong orbit if all APIs fail
  - NORAD Catalog ID: 48274 (China Space Station)
  - Altitude: ~340 km above Earth surface
  - T-shaped configuration: Tianhe core module + Wentian & Mengtian laboratories

### Astronaut Data
- **Open Notify API**: Real-time astronaut tracking
  - API Endpoint: `http://api.open-notify.org/astros.json` (via CORS proxy)
  - Uses multiple CORS proxies for reliability on GitHub Pages
  - Provides current crew members aboard ISS, Tiangong, and other spacecraft
  - Updated with crew rotations and spacecraft assignments
  - Fallback: Realistic static crew data if all APIs fail
### CORS Proxy Services
- **Why CORS proxies?** Most public APIs block direct browser access from GitHub Pages due to CORS restrictions. This project uses multiple CORS proxy services to fetch live data:
  - [allorigins.win/raw](https://api.allorigins.win/raw)
  - [jsonp.afeld.me](https://jsonp.afeld.me)
  - [cors.sh](https://cors.sh)
  - The app automatically falls back to simulated or static data if all proxies fail.

### Geocoding Services
- **BigDataCloud Reverse Geocoding API**: Location name resolution for coordinates
  - Endpoint: `https://api.bigdatacloud.net/data/reverse-geocode-client`
- **OpenStreetMap Nominatim API**: Backup geocoding service
  - Endpoint: `https://nominatim.openstreetmap.org/reverse`

### Map Data
- **Globe Textures**: 
  - Earth surface: NASA Blue Marble imagery via CDN
  - Earth topology: Bump mapping for surface relief
  - Cloud layer: Real-time cloud texture overlay

### Technical Framework
- **Globe.gl**: Three.js-based 3D globe visualization library
- **Three.js**: WebGL-based 3D graphics rendering
