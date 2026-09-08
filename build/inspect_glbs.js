const fs = require('fs');
const path = require('path');

const blockyDir = path.join(__dirname, '..', 'assets', 'Characters', 'glb', 'Blocky');
const miniDir = path.join(__dirname, '..', 'assets', 'Characters', 'glb', 'Mini');

function inspectImageDetails(filePath) {
  const buf = fs.readFileSync(filePath);
  const jsonLen = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
  const json = JSON.parse(jsonStr);
  return {
    images: json.images,
    textures: json.textures,
    materials: json.materials
  };
}

console.log('--- BLOCKY image detail ---');
console.log(inspectImageDetails(path.join(blockyDir, 'character-a.glb')));

console.log('--- MINI image detail ---');
console.log(inspectImageDetails(path.join(miniDir, 'character-female-a.glb')));
