# All Fireballs and Meteorites Ever Recorded, Mapped
## and the ISS and Tiangong too.

[Preview](https://xuanx1.github.io/meteoRights/)
![Screenshot 2025-07-24 175018](https://github.com/user-attachments/assets/3d3d9654-6acb-473d-a6e9-65df5664233c)

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
- **ISS Location API**: Real-time ISS position tracking via wheretheiss.at
  - API Endpoint: `https://api.wheretheiss.at/v1/satellites/25544`
  - Orbital mechanics simulation with ~93-minute orbital period
  - Altitude: ~408 km above Earth surface

### Tiangong Space Station
- **Tiangong Location API**: Real-time Tiangong position tracking via wheretheiss.at
  - API Endpoint: `https://api.wheretheiss.at/v1/satellites/48274`
  - NORAD Catalog ID: 48274 (China Space Station)
  - Orbital mechanics simulation with ~90-minute orbital period
  - Altitude: ~340 km above Earth surface
  - T-shaped configuration: Tianhe core module + Wentian & Mengtian laboratories

### Astronaut Data
- **Open Notify API**: Real-time astronaut tracking
  - API Endpoint: `http://api.open-notify.org/astros.json`
  - Provides current crew members aboard ISS, Tiangong, and other spacecraft
  - Updated with crew rotations and spacecraft assignments

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
