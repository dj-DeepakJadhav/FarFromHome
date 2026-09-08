const fs = require('fs');
const path = require('path');

function embedTextureInGLB(glbPath, pngPath) {
  const glbBuf = fs.readFileSync(glbPath);
  const pngBuf = fs.readFileSync(pngPath);

  const jsonChunkLen = glbBuf.readUInt32LE(12);
  const jsonStr = glbBuf.toString('utf8', 20, 20 + jsonChunkLen);
  const json = JSON.parse(jsonStr);

  let binBuf = Buffer.alloc(0);
  let binChunkOffset = 20 + jsonChunkLen;
  if (binChunkOffset < glbBuf.length) {
    const binChunkLen = glbBuf.readUInt32LE(binChunkOffset);
    binBuf = glbBuf.slice(binChunkOffset + 8, binChunkOffset + 8 + binChunkLen);
  }

  if (!json.buffers) json.buffers = [];
  if (json.buffers.length === 0) json.buffers.push({ byteLength: 0 });

  const currentBinLen = binBuf.length;
  const paddingLen = (4 - (currentBinLen % 4)) % 4;
  const paddedBinBuf = Buffer.concat([binBuf, Buffer.alloc(paddingLen)]);

  const textureByteOffset = paddedBinBuf.length;
  const textureByteLength = pngBuf.length;

  const pngPaddingLen = (4 - (textureByteLength % 4)) % 4;
  const newBinBuf = Buffer.concat([paddedBinBuf, pngBuf, Buffer.alloc(pngPaddingLen)]);

  json.buffers[0].byteLength = newBinBuf.length;

  if (!json.bufferViews) json.bufferViews = [];
  const imageBufferViewIndex = json.bufferViews.length;
  json.bufferViews.push({
    buffer: 0,
    byteOffset: textureByteOffset,
    byteLength: textureByteLength
  });

  if (!json.images) json.images = [];
  if (json.images.length > 0) {
    delete json.images[0].uri;
    json.images[0].bufferView = imageBufferViewIndex;
    json.images[0].mimeType = 'image/png';
  } else {
    json.images.push({
      bufferView: imageBufferViewIndex,
      mimeType: 'image/png',
      name: 'texture'
    });
  }

  let newJsonStr = JSON.stringify(json);
  let newJsonBuf = Buffer.from(newJsonStr, 'utf8');
  const jsonPaddingLen = (4 - (newJsonBuf.length % 4)) % 4;
  if (jsonPaddingLen > 0) {
    newJsonStr += ' '.repeat(jsonPaddingLen);
    newJsonBuf = Buffer.from(newJsonStr, 'utf8');
  }

  const totalLen = 12 + 8 + newJsonBuf.length + 8 + newBinBuf.length;
  const headerBuf = Buffer.alloc(12);
  headerBuf.write('glTF', 0);
  headerBuf.writeUInt32LE(2, 4);
  headerBuf.writeUInt32LE(totalLen, 8);

  const jsonHeaderBuf = Buffer.alloc(8);
  jsonHeaderBuf.writeUInt32LE(newJsonBuf.length, 0);
  jsonHeaderBuf.writeUInt32LE(0x4E4F534A, 4); // JSON

  const binHeaderBuf = Buffer.alloc(8);
  binHeaderBuf.writeUInt32LE(newBinBuf.length, 0);
  binHeaderBuf.writeUInt32LE(0x004E4942, 4); // BIN chunk type: 0x004E4942 ('BIN ')

  return Buffer.concat([headerBuf, jsonHeaderBuf, newJsonBuf, binHeaderBuf, newBinBuf]);
}

function packCharacterGLBs() {
  const root = path.join(__dirname, '..');
  const blockyDir = path.join(root, 'assets', 'Characters', 'glb', 'Blocky');
  const miniDir = path.join(root, 'assets', 'Characters', 'glb', 'Mini');

  const glbMap = {};

  // Load Blocky (character-a .. character-r) with texture-a.png .. texture-r.png embedded
  if (fs.existsSync(blockyDir)) {
    const files = fs.readdirSync(blockyDir);
    for (const file of files) {
      if (file.endsWith('.glb')) {
        const key = path.basename(file, '.glb'); // e.g. "character-a"
        const letter = key.replace('character-', ''); // e.g. "a"
        const pngPath = path.join(blockyDir, `texture-${letter}.png`);
        const glbPath = path.join(blockyDir, file);

        let finalBuf;
        if (fs.existsSync(pngPath)) {
          finalBuf = embedTextureInGLB(glbPath, pngPath);
        } else {
          finalBuf = fs.readFileSync(glbPath);
        }
        glbMap[key] = finalBuf.toString('base64');
      }
    }
  }

  // Load Mini (character-female-a..f, character-male-a..f) with colormap.png embedded
  const miniColormapPath = path.join(miniDir, 'colormap.png');
  if (fs.existsSync(miniDir)) {
    const files = fs.readdirSync(miniDir);
    for (const file of files) {
      if (file.endsWith('.glb')) {
        const key = path.basename(file, '.glb');
        const glbPath = path.join(miniDir, file);

        let finalBuf;
        if (fs.existsSync(miniColormapPath)) {
          finalBuf = embedTextureInGLB(glbPath, miniColormapPath);
        } else {
          finalBuf = fs.readFileSync(glbPath);
        }
        glbMap[key] = finalBuf.toString('base64');
      }
    }
  }

  const npcMapping = {
    "NPC_RITA": "character-female-a",
    "NPC_MARTHA": "character-female-b",
    "NPC_NINA": "character-female-c",
    "NPC_MARINA": "character-female-d",
    "NPC_EMILY": "character-female-e",
    "NPC_SOPHIE": "character-female-f",
    "NPC_MATHIAS": "character-male-a",
    "NPC_LOKKER": "character-male-b",
    "NPC_REINHARD": "character-male-c",
    "NPC_SCHUMAKER": "character-male-d",
    "NPC_OTTO": "character-male-e",
    "NPC_ZIMMERMAN": "character-male-f",
    "NPC_CHAR_A": "character-a",
    "NPC_CHAR_B": "character-b",
    "NPC_CHAR_C": "character-c",
    "NPC_CHAR_D": "character-d",
    "NPC_CHAR_E": "character-e",
    "NPC_CHAR_F": "character-f",
    "NPC_CHAR_G": "character-g",
    "NPC_CHAR_H": "character-h",
    "NPC_CHAR_I": "character-i",
    "NPC_CHAR_J": "character-j",
    "NPC_CHAR_K": "character-k",
    "NPC_CHAR_L": "character-l",
    "NPC_CHAR_M": "character-m",
    "NPC_CHAR_N": "character-n",
    "NPC_CHAR_O": "character-o",
    "NPC_CHAR_P": "character-p",
    "NPC_CHAR_Q": "character-q",
    "NPC_CHAR_R": "character-r",
    "NPC_NICO": "character-male-c"
  };

  const jsContent = `// Autogenerated Self-Contained GLB Characters with Embedded Animations & Textures
window.FFH = window.FFH || {};
window.FFH.GLB_CHARACTERS_BASE64 = ${JSON.stringify(glbMap)};
window.FFH.NPC_GLB_MAPPING = ${JSON.stringify(npcMapping)};
`;

  const outputPath = path.join(root, 'src', 'data', 'characterGLB.js');
  fs.writeFileSync(outputPath, jsContent, 'utf-8');
  console.log(`Successfully packed ${Object.keys(glbMap).length} self-contained GLB models into ${outputPath}.`);
}

packCharacterGLBs();
