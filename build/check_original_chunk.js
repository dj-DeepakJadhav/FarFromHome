const fs = require('fs');
const path = require('path');

const originalBlocky = path.join(__dirname, '..', 'assets', 'Characters', 'glb', 'Blocky', 'character-a.glb');
const buf = fs.readFileSync(originalBlocky);

const jsonChunkLen = buf.readUInt32LE(12);
const jsonChunkType = buf.readUInt32LE(16);

console.log(`Original JSON chunk len=${jsonChunkLen}, type=0x${jsonChunkType.toString(16)} ('${buf.toString('utf8', 16, 20)}')`);

const binOffset = 20 + jsonChunkLen;
if (binOffset < buf.length) {
  const binChunkLen = buf.readUInt32LE(binOffset);
  const binChunkType = buf.readUInt32LE(binOffset + 4);
  console.log(`Original BIN chunk offset=${binOffset}, len=${binChunkLen}, type=0x${binChunkType.toString(16)} ('${buf.toString('utf8', binOffset + 4, binOffset + 8)}')`);
}
