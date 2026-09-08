global.window = global;
global.FFH = {};
require('../src/data/characterGLB.js');

const catalog = window.FFH.GLB_CHARACTERS_BASE64;
console.log('Catalog keys:', Object.keys(catalog));

function base64ToArrayBuffer(b64) {
  const buf = Buffer.from(b64, 'base64');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

const key = 'character-a';
const b64 = catalog[key];
const ab = base64ToArrayBuffer(b64);

console.log(`Testing parsing of '${key}' (${b64.length} base64 chars, ${ab.byteLength} bytes)...`);

const view = new DataView(ab);
const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
const version = view.getUint32(4, true);
const length = view.getUint32(8, true);
console.log(`GLB header: magic=${magic}, version=${version}, length=${length}, actualLength=${ab.byteLength}`);

const jsonLen = view.getUint32(12, true);
const jsonType = view.getUint32(16, true);
console.log(`JSON chunk: len=${jsonLen}, type=0x${jsonType.toString(16)}`);

const jsonBytes = new Uint8Array(ab, 20, jsonLen);
const jsonText = Buffer.from(jsonBytes).toString('utf8');
const json = JSON.parse(jsonText);
console.log('Parsed JSON buffers:', json.buffers);
console.log('Parsed JSON bufferViews count:', json.bufferViews ? json.bufferViews.length : 0);
console.log('Parsed JSON images:', json.images);

const binChunkOffset = 20 + jsonLen;
const binLen = view.getUint32(binChunkOffset, true);
const binType = view.getUint32(binChunkOffset + 4, true);
console.log(`BIN chunk: offset=${binChunkOffset}, len=${binLen}, type=0x${binType.toString(16)}`);
console.log(`Total GLB length check: headerLength=${length}, BIN end=${binChunkOffset + 8 + binLen}`);
