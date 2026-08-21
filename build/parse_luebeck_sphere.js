const fs = require('fs');
const path = require('path');

function parseOsmXmlToSphere() {
  const osmPath = 'c:\\DeepakJadhav\\Personal\\Tools\\luebeck.osm';
  const outputPath = 'c:\\DeepakJadhav\\Personal\\FarFromHome\\src\\data\\luebeckSphereMap.js';

  console.log('Reading OSM XML file from:', osmPath);
  const content = fs.readFileSync(osmPath, 'utf-8');

  // Regex extract nodes
  console.log('Parsing nodes...');
  const nodes = new Map(); // id -> {lat, lon}
  const nodeRegex = /<node id="(\d+)"[^>]*lat="([\d\.-]+)"[^>]*lon="([\d\.-]+)"/g;
  let match;
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;

  while ((match = nodeRegex.exec(content)) !== null) {
    const id = match[1];
    const lat = parseFloat(match[2]);
    const lon = parseFloat(match[3]);
    nodes.set(id, { lat, lon });

    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }

  const centerLat = 53.8665; // Lübeck center
  const centerLon = 10.6870;

  // Radius of planet sphere
  const PLANET_RADIUS = 20.0;
  
  // Map the bounds to span across the globe surface
  const LAT_SPAN = (maxLat - minLat) || 0.03;
  const LON_SPAN = (maxLon - minLon) || 0.04;

  function latLonToSphere(lat, lon, altitude = 0) {
    // Proportional mapping spanning across the globe (theta [-PI, +PI], phi [-PI/2, +PI/2])
    const normY = ((lat - centerLat) / (LAT_SPAN * 0.5)) * (Math.PI * 0.46);
    const normX = ((lon - centerLon) / (LON_SPAN * 0.5)) * (Math.PI * 0.75);

    const r = PLANET_RADIUS + altitude;
    
    // Smooth spherical transformation covering the visible sphere
    const x = r * Math.sin(normX) * Math.cos(normY);
    const y = r * Math.sin(normY);
    const z = r * Math.cos(normX) * Math.cos(normY);

    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      z: Number(z.toFixed(3))
    };
  }

  // Parse ways (highways and buildings)
  console.log('Parsing ways...');
  const waysRegex = /<way id="(\d+)"[\s\S]*?<\/way>/g;
  const roads = [];
  const buildings = [];
  const rivers = [];

  let wayCount = 0;
  while ((match = waysRegex.exec(content)) !== null) {
    wayCount++;
    const wayXml = match[0];
    const wayId = match[1];

    // Extract node references
    const ndRegex = /<nd ref="(\d+)"\/>/g;
    let ndMatch;
    const nds = [];
    while ((ndMatch = ndRegex.exec(wayXml)) !== null) {
      const node = nodes.get(ndMatch[1]);
      if (node) {
        nds.push(node);
      }
    }

    if (nds.length < 2) continue;

    // Check tags
    const isHighway = wayXml.includes('k="highway"');
    const isBuilding = wayXml.includes('k="building"');
    const isWaterway = wayXml.includes('k="waterway"') || wayXml.includes('v="river"') || wayXml.includes('v="water"');
    const nameMatch = wayXml.match(/k="name" v="([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : '';

    if (isHighway) {
      const roadPoints = nds.map(pt => latLonToSphere(pt.lat, pt.lon, 0.05));
      roads.push({
        id: wayId,
        name: name,
        points: roadPoints
      });
    } else if (isBuilding && buildings.length < 850) {
      // Calculate building centroid
      let avgLat = 0, avgLon = 0;
      nds.forEach(pt => { avgLat += pt.lat; avgLon += pt.lon; });
      avgLat /= nds.length;
      avgLon /= nds.length;

      const spherePos = latLonToSphere(avgLat, avgLon, 0.0);
      const height = 0.55 + (parseInt(wayId) % 5) * 0.16; // clean low-poly height
      const size = 0.45 + (parseInt(wayId) % 3) * 0.12;   // uniform footprint size

      buildings.push({
        id: wayId,
        name: name,
        pos: spherePos,
        h: Number(height.toFixed(2)),
        s: Number(size.toFixed(2)),
        color: (parseInt(wayId) % 3 === 0) ? '#D2B48C' : (parseInt(wayId) % 3 === 1 ? '#E6D7B8' : '#C4A482')
      });
    } else if (isWaterway) {
      const waterPoints = nds.map(pt => latLonToSphere(pt.lat, pt.lon, -0.05));
      rivers.push({
        name: name || 'Trave',
        points: waterPoints
      });
    }
  }

  console.log(`Extracted: ${roads.length} road ways, ${buildings.length} buildings, ${rivers.length} water features.`);

  // Key landmarks
  const landmarks = [
    { name: 'Lübecker Dom', lat: 53.8622, lon: 10.6855, type: 'cathedral' },
    { name: 'Holstentor', lat: 53.8662, lon: 10.6798, type: 'gate' },
    { name: 'Museumshafen Lübeck', lat: 53.8698, lon: 10.6815, type: 'harbor' },
    { name: 'Heiligen-Geist-Hospital', lat: 53.8710, lon: 10.6890, type: 'hospital' },
    { name: 'Hotel Motel One', lat: 53.8672, lon: 10.6860, type: 'hotel' }
  ].map(lm => ({
    ...lm,
    pos: latLonToSphere(lm.lat, lm.lon, 0.2)
  }));

  const sphereMapData = {
    planetRadius: PLANET_RADIUS,
    center: { lat: centerLat, lon: centerLon },
    landmarks,
    buildings,
    roads: roads.slice(0, 150), // keep main roads
    rivers
  };

  const code = `// Lübeck Spherical Map Database extracted from raw OSM
window.FFH = window.FFH || {};
window.FFH.luebeckSphereMap = ${JSON.stringify(sphereMapData, null, 2)};
`;

  fs.writeFileSync(outputPath, code, 'utf-8');
  console.log('Successfully written Lübeck Spherical Map to:', outputPath);
}

parseOsmXmlToSphere();
