const fs = require('fs');
const path = require('path');

const blockyDir = path.join(__dirname, '..', 'assets', 'Characters', 'glb', 'Blocky');
const miniDir = path.join(__dirname, '..', 'assets', 'Characters', 'glb', 'Mini');

function embedTextureInGLB(glbPath, pngPath) {
  const glbBuf = fs.readFileSync(glbPath);
  const pngBuf = fs.readFileSync(pngPath);

  // GLB Header: 12 bytes [magic (4), version (4), length (4)]
  const jsonChunkLen = glbBuf.readUInt32LE(12);
  const jsonChunkType = glbBuf.readUInt32LE(16); // 0x4E4F534A
  const jsonStr = glbBuf.toString('utf8', 20, 20 + jsonChunkLen);
  const json = JSON.parse(jsonStr);

  let binBuf = Buffer.alloc(0);
  let binChunkOffset = 20 + jsonChunkLen;
  if (binChunkOffset < glbBuf.length) {
    const binChunkLen = glbBuf.readUInt32LE(binChunkOffset);
    const binChunkType = glbBuf.readUInt32LE(binChunkOffset + 4); // 0x00415441
    binBuf = glbBuf.slice(binChunkOffset + 8, binChunkOffset + 8 + binChunkLen);
  }

  // Ensure buffer entry exists
  if (!json.buffers) json.buffers = [];
  if (json.buffers.length === 0) {
    json.buffers.push({ byteLength: 0 });
  }

  // Pad binBuf to 4-byte boundary
  const currentBinLen = binBuf.length;
  const paddingLen = (4 - (currentBinLen % 4)) % 4;
  const paddedBinBuf = Buffer.concat([binBuf, Buffer.alloc(paddingLen)]);

  const textureByteOffset = paddedBinBuf.length;
  const textureByteLength = pngBuf.length;

  // Append PNG bytes
  const pngPaddingLen = (4 - (textureByteLength % 4)) % 4;
  const newBinBuf = Buffer.concat([paddedBinBuf, pngBuf, Buffer.alloc(pngPaddingLen)]);

  // Update json.buffers[0]
  json.buffers[0].byteLength = newBinBuf.length;

  // Add new bufferView for PNG
  if (!json.bufferViews) json.bufferViews = [];
  const imageBufferViewIndex = json.bufferViews.length;
  json.bufferViews.push({
    buffer: 0,
    byteOffset: textureByteOffset,
    byteLength: textureByteLength
  });

  // Update json.images[0] to point to bufferView instead of uri
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

  // Re-encode JSON chunk
  let newJsonStr = JSON.stringify(json);
  let newJsonBuf = Buffer.from(newJsonStr, 'utf8');
  const jsonPaddingLen = (4 - (newJsonBuf.length % 4)) % 4;
  if (jsonPaddingLen > 0) {
    newJsonStr += ' '.repeat(jsonPaddingLen);
    newJsonBuf = Buffer.from(newJsonStr, 'utf8');
  }

  // Assemble GLB
  const totalLen = 12 + 8 + newJsonBuf.length + 8 + newBinBuf.length;
  const headerBuf = Buffer.alloc(12);
  headerBuf.write('glTF', 0);
  headerBuf.writeUInt32LE(2, 4); // version 2
  headerBuf.writeUInt32LE(totalLen, 8);

  const jsonHeaderBuf = Buffer.alloc(8);
  jsonHeaderBuf.writeUInt32LE(newJsonBuf.length, 0);
  jsonHeaderBuf.writeUInt32LE(0x4E4F534A, 4); // JSON

  const binHeaderBuf = Buffer.alloc(8);
  binHeaderBuf.writeUInt32LE(newBinBuf.length, 0);
  binHeaderBuf.writeUInt32LE(0x00415441, 4); // BIN

  return Buffer.concat([headerBuf, jsonHeaderBuf, newJsonBuf, binHeaderBuf, newBinBuf]);
}

console.log('Testing texture embedding on Blocky character-a.glb + texture-a.png...');
const selfContainedBlocky = embedTextureInGLB(
  path.join(blockyDir, 'character-a.glb'),
  path.join(blockyDir, 'texture-a.png')
);
console.log('Generated self-contained GLB buffer size:', selfContainedBlocky.length);

console.log('\nTesting texture embedding on Mini character-female-a.glb + colormap.png...');
const selfContainedMini = embedTextureInGLB(
  path.join(miniDir, 'character-female-a.glb'),
  path.join(miniDir, 'colormap.png')
);
console.log('Generated self-contained GLB buffer size:', selfContainedMini.length);
