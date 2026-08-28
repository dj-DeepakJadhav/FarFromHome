const fs = require('fs');
const path = require('path');

function packKenneyAssets() {
  const root = path.join(__dirname, '..');
  const outputPath = path.join(root, 'src', 'data', 'kenneyAssets.js');
  
  const baseArtDir = 'C:\\DeepakJadhav\\Personal\\ART';

  const assetMappings = {
    // 1. Food items (kenney_food-kit)
    'food_apple': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'apple.glb'),
    'food_carton': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'carton.glb'),
    'food_bread': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'bread.glb'),
    'food_water': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'soda-bottle.glb'),
    'food_banana': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'banana.glb'),
    'food_cheese': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'cheese-cut.glb'),
    'food_egg': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'egg.glb'),
    'food_carrot': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'carrot.glb'),
    'food_pizzabox': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'pizza-box.glb'),
    'food_wine': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'glass-wine.glb'),
    'food_can': path.join(baseArtDir, 'kenney_food-kit', 'Models', 'GLB format', 'can.glb'),

    // 2. Suburban Buildings & Nature (kenney_city-kit-suburban_20)
    'bldg_suburban_a': path.join(baseArtDir, 'kenney_city-kit-suburban_20', 'Models', 'GLB format', 'building-type-a.glb'),
    'bldg_suburban_b': path.join(baseArtDir, 'kenney_city-kit-suburban_20', 'Models', 'GLB format', 'building-type-b.glb'),
    'bldg_suburban_c': path.join(baseArtDir, 'kenney_city-kit-suburban_20', 'Models', 'GLB format', 'building-type-c.glb'),
    'bldg_suburban_d': path.join(baseArtDir, 'kenney_city-kit-suburban_20', 'Models', 'GLB format', 'building-type-d.glb'),
    'bldg_suburban_e': path.join(baseArtDir, 'kenney_city-kit-suburban_20', 'Models', 'GLB format', 'building-type-e.glb'),
    'tree_large': path.join(baseArtDir, 'kenney_city-kit-suburban_20', 'Models', 'GLB format', 'tree-large.glb'),
    'tree_small': path.join(baseArtDir, 'kenney_city-kit-suburban_20', 'Models', 'GLB format', 'tree-small.glb'),
    'fence_wood': path.join(baseArtDir, 'kenney_city-kit-suburban_20', 'Models', 'GLB format', 'fence.glb'),

    // 3. Roads & Street Furniture (kenney_city-kit-roads)
    'road_straight': path.join(baseArtDir, 'kenney_city-kit-roads', 'Models', 'GLB format', 'road-straight.glb'),
    'road_crossing': path.join(baseArtDir, 'kenney_city-kit-roads', 'Models', 'GLB format', 'road-crossing.glb'),
    'road_bend': path.join(baseArtDir, 'kenney_city-kit-roads', 'Models', 'GLB format', 'road-bend.glb'),
    'light_curved': path.join(baseArtDir, 'kenney_city-kit-roads', 'Models', 'GLB format', 'light-curved.glb'),
    'traffic_light': path.join(baseArtDir, 'kenney_city-kit-roads', 'Models', 'GLB format', 'traffic-light.glb'),
    'barrier_construction': path.join(baseArtDir, 'kenney_city-kit-roads', 'Models', 'GLB format', 'construction-barrier.glb'),
    'cone_construction': path.join(baseArtDir, 'kenney_city-kit-roads', 'Models', 'GLB format', 'construction-cone.glb'),

    // 4. Characters (kenney_mini-characters)
    'char_courier': path.join(baseArtDir, 'kenney_mini-characters', 'Models', 'GLB format', 'character-female-a.glb'),
    'char_customer_young': path.join(baseArtDir, 'kenney_mini-characters', 'Models', 'GLB format', 'character-male-a.glb'),
    'char_customer_senior': path.join(baseArtDir, 'kenney_mini-characters', 'Models', 'GLB format', 'character-male-b.glb')
  };

  console.log('Packing Kenney 3D Art Kit GLB models into Base64 lookup table...');
  const packedAssets = {};
  let totalBytes = 0;

  for (const [key, filePath] of Object.entries(assetMappings)) {
    if (!fs.existsSync(filePath)) {
      console.warn(`WARNING: File not found for ${key}: ${filePath}`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    const dataUri = `data:application/octet-stream;base64,${base64}`;
    packedAssets[key] = dataUri;
    totalBytes += buffer.length;
    console.log(`  + Packed ${key} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  const jsContent = `// Auto-generated Kenney 3D Art Kit Base64 Asset Bundle
window.FFH = window.FFH || {};
window.FFH.kenneyAssets = ${JSON.stringify(packedAssets, null, 2)};
`;

  fs.writeFileSync(outputPath, jsContent, 'utf-8');
  console.log(`\nSUCCESS: Packed ${Object.keys(packedAssets).length} models into ${outputPath} (Total GLB raw size: ${(totalBytes / 1024).toFixed(1)} KB).`);
}

packKenneyAssets();
