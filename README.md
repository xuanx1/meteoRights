# All Fireballs and Meteorites Ever Recorded, Mapped
## and the ISS too.

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
- **ISS Location API**: Real-time ISS position tracking
  - Orbital mechanics simulation with ~93-minute orbital period
  - Altitude: ~408 km above Earth surface

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
