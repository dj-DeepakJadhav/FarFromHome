const fs = require('fs');
const path = require('path');

function optimize() {
  const root = path.join(__dirname, '..');
  const objPath = path.join(root, '..', 'Tools', 'luebeck.obj');
  const outputPath = path.join(root, 'src', 'data', 'luebeckMap.js');
  
  console.log('Optimizing Lübeck OBJ model data into low-poly structures...');
  
  if (!fs.existsSync(objPath)) {
    console.warn(`Lübeck OBJ model not found at ${objPath}. Generating mock layout data instead...`);
    // Create mock Lübeck map data to allow app to run successfully if raw OBJ isn't present
    writeMockData(outputPath);
    return;
  }
  
  const content = fs.readFileSync(objPath, 'utf-8');
  const lines = content.split('\n');
  
  const buildings = [];
  const roadVerts = [];
  
  let currentGroup = '';
  let currentVerts = [];
  
  // Extract coordinate sets from OBJ file
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === 'g') {
      currentGroup = parts[1] || '';
    } else if (parts[0] === 'v') {
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);
      currentVerts.push({ x, y, z });
    } else if (parts[0] === 'f' && currentGroup.includes('building')) {
      // Process building face to approximate box coordinates
      // Store a simplified box outline per building to keep file size small
      if (currentVerts.length > 3) {
        const bbox = getBoundingBox(parts, currentVerts);
        if (bbox && buildings.length < 350) { // Limit to 350 buildings for performance
          buildings.push(bbox);
        }
      }
    } else if (parts[0] === 'f' && currentGroup.includes('road')) {
      // Extract road vertex center splines
      const firstIdx = parseInt(parts[1].split('/')[0]) - 1;
      if (currentVerts[firstIdx]) {
        roadVerts.push(currentVerts[firstIdx]);
      }
    }
  }
  
  // Assemble final JSON database structure
  const mapData = {
    buildings: buildings.length > 0 ? buildings : getMockBuildings(),
    roads: roadVerts.length > 0 ? roadVerts.filter((_, i) => i % 10 === 0) : getMockRoads()
  };
  
  fs.writeFileSync(outputPath, `window.FFH.luebeckMap = ${JSON.stringify(mapData, null, 2)};\n`, 'utf-8');
  console.log(`SUCCESS: Optimized Lübeck map saved to ${outputPath}. (${buildings.length} buildings, ${roadVerts.length} road coordinates)`);
}

function getBoundingBox(faceParts, verts) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (let i = 1; i < faceParts.length; i++) {
    const idx = parseInt(faceParts[i].split('/')[0]) - 1;
    const v = verts[idx];
    if (v) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
      if (v.z < minZ) minZ = v.z;
      if (v.z > maxZ) maxZ = v.z;
    }
  }
  
  if (minX === Infinity) return null;
  
  return {
    px: (minX + maxX) / 2,
    py: (minY + maxY) / 2,
    pz: (minZ + maxZ) / 2,
    w: maxX - minX,
    h: Math.max(1, maxY - minY),
    d: maxZ - minZ
  };
}

function writeMockData(outputPath) {
  const mapData = {
    buildings: getMockBuildings(),
    roads: getMockRoads()
  };
  fs.writeFileSync(outputPath, `window.FFH.luebeckMap = ${JSON.stringify(mapData, null, 2)};\n`, 'utf-8');
  console.log('SUCCESS: Mock Lübeck map dataset generated.');
}

function getMockBuildings() {
  const list = [];
  // Grid of mock houses
  for (let x = -8; x <= 8; x += 3) {
    for (let z = -40; z <= 10; z += 5) {
      if (Math.abs(x) > 1.5) { // don't block center road
        list.push({
          px: x + (Math.random() - 0.5) * 0.5,
          py: 1.0,
          pz: z + (Math.random() - 0.5) * 1.0,
          w: 1.5,
          h: 2.0 + Math.random() * 2.0,
          d: 2.0
        });
      }
    }
  }
  return list;
}

function getMockRoads() {
  const points = [];
  for (let z = 20; z >= -60; z -= 2) {
    points.push({ x: Math.sin(z * 0.05) * 1.5, y: 0.01, z });
  }
  return points;
}

optimize();
