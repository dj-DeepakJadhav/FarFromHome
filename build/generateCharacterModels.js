const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const charDir = path.join(root, 'assets', 'Characters');
const texDir  = path.join(root, 'assets', 'Characters', 'Textures');

// Parse an OBJ file and return geometry arrays + the texture name declared via usemtl
function parseOBJ(objText) {
  const lines = objText.split('\n');
  const positions = [], uvs = [], normals = [];
  const outPositions = [], outUvs = [], outNormals = [];
  let textureRef = null;  // first usemtl found

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    const type = parts[0];

    if (type === 'usemtl' && !textureRef) {
      textureRef = parts[1]; // e.g. "texture-a" or "colormap"
    } else if (type === 'v') {
      positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (type === 'vt') {
      uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
    } else if (type === 'vn') {
      normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (type === 'f') {
      const faceVerts = parts.slice(1);
      for (let i = 1; i < faceVerts.length - 1; i++) {
        const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
        tri.forEach(vStr => {
          const [vIdx, vtIdx, vnIdx] = vStr.split('/').map(s => parseInt(s, 10));
          outPositions.push(...(vIdx && positions[vIdx - 1] ? positions[vIdx - 1] : [0, 0, 0]));
          outUvs.push(...(vtIdx && uvs[vtIdx - 1] ? uvs[vtIdx - 1] : [0, 0]));
          outNormals.push(...(vnIdx && normals[vnIdx - 1] ? normals[vnIdx - 1] : [0, 1, 0]));
        });
      }
    }
  }

  return {
    p: outPositions.map(v => Math.round(v * 1000) / 1000),
    u: outUvs.map(v => Math.round(v * 1000) / 1000),
    n: outNormals.map(v => Math.round(v * 1000) / 1000),
    textureRef  // e.g. "texture-a" — used to look up the correct png
  };
}

// Resolve a texture reference string to the correct PNG file path
// Kenney chars use names like "texture-a", named NPCs use "colormap"
function resolveTexturePath(textureRef, searchDirs) {
  for (const dir of searchDirs) {
    const p = path.join(dir, textureRef + '.png');
    if (fs.existsSync(p)) return p;
  }
  // fallback: return colormap
  return path.join(texDir, 'colormap.png');
}

// All OBJ sources: named NPCs live in charDir, generic citizens in texDir
const objSources = [
  // Named NPCs
  { key: 'NPC_RITA',      objPath: path.join(charDir, 'Ch_female_ Works in Uni - Rita.obj') },
  { key: 'NPC_MARTHA',    objPath: path.join(charDir, 'Ch_female_ Oma walking around in city - Martha Webber.obj') },
  { key: 'NPC_NINA',      objPath: path.join(charDir, 'Ch_female_ Works at Kurma Express - Nina.obj') },
  { key: 'NPC_MATHIAS',   objPath: path.join(charDir, 'Ch_male_ Works at construction always angry _ Herr Mathias.obj') },
  { key: 'NPC_LOKKER',    objPath: path.join(charDir, 'Ch_male_ Works as locksmith _ Herr Lokker.obj') },
  { key: 'NPC_MARINA',    objPath: path.join(charDir, 'Ch_female_ Uni Student  - Marina.obj') },
  { key: 'NPC_EMILY',     objPath: path.join(charDir, 'Ch_female_ Uni student - Emily.obj') },
  { key: 'NPC_SOPHIE',    objPath: path.join(charDir, 'Ch_female_ Works at office - Sophie.obj') },
  { key: 'NPC_REINHARD',  objPath: path.join(charDir, 'Ch_male_ old man walking around city _ Herr Reinhard.obj') },
  { key: 'NPC_SCHUMAKER', objPath: path.join(charDir, 'Ch_male_ Police officer  _ Herr Schumaker.obj') },
  { key: 'NPC_OTTO',      objPath: path.join(charDir, 'Ch_male_ Works at office _ Herr Otto.obj') },
  { key: 'NPC_ZIMMERMAN', objPath: path.join(charDir, 'Ch_male_ Works at office _ Herr Zimmerman.obj') },
];

// Generic roaming citizens: character-a.obj through character-r.obj in texDir
for (let code = 97; code <= 114; code++) {
  const letter = String.fromCharCode(code);
  objSources.push({
    key: `NPC_CHAR_${letter.toUpperCase()}`,
    objPath: path.join(texDir, `character-${letter}.obj`)
  });
}

const characters  = {};  // geometry data per key
const textureMap  = {};  // base64 PNG per key

for (const { key, objPath } of objSources) {
  if (!fs.existsSync(objPath)) {
    console.warn(`WARNING: OBJ not found: ${objPath}`);
    continue;
  }

  const parsed = parseOBJ(fs.readFileSync(objPath, 'utf8'));
  characters[key] = { p: parsed.p, u: parsed.u, n: parsed.n };

  // Resolve the correct texture using the name embedded in the OBJ (via usemtl)
  // Search texDir first (has texture-a.png etc.), then charDir for anything else
  const texRef  = parsed.textureRef || 'colormap';
  const texPath = resolveTexturePath(texRef, [texDir, charDir]);
  textureMap[key] = fs.readFileSync(texPath).toString('base64');
  console.log(`  ${key}: OBJ ok, texture="${texRef}" → ${path.relative(root, texPath)}`);
}

// Shared colormap fallback (lives in charDir)
const colormapBase64 = fs.readFileSync(path.join(charDir, 'colormap.png')).toString('base64');

const outputCode = `// Autogenerated 3D Character Models & Texture Bundle
// Generated: ${new Date().toISOString()}
window.FFH = window.FFH || {};
window.FFH.CHARACTER_TEXTURE_BASE64 = "data:image/png;base64,${colormapBase64}";
window.FFH.CHARACTER_TEXTURES_BASE64 = ${JSON.stringify(textureMap)};
window.FFH.CHARACTER_MODELS = ${JSON.stringify(characters)};
`;

fs.writeFileSync(path.join(root, 'src', 'data', 'characterModels.js'), outputCode);
console.log('\nDone. Characters bundled:', Object.keys(characters).length);
