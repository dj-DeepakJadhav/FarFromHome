const fs = require('fs');
const path = require('path');

global.window = global;
global.FFH = {};
require('../src/data/characterGLB.js');

const catalog = window.FFH.GLB_CHARACTERS_BASE64;

function base64ToArrayBuffer(b64) {
  const buf = Buffer.from(b64, 'base64');
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

let allOk = true;
for (const key of Object.keys(catalog)) {
  const b64 = catalog[key];
  const ab = base64ToArrayBuffer(b64);
  const view = new DataView(ab);
  const jsonLen = view.getUint32(12, true);
  const jsonType = view.getUint32(16, true);
  const binOffset = 20 + jsonLen;
  const binLen = view.getUint32(binOffset, true);
  const binType = view.getUint32(binOffset + 4, true);

  const binTypeHex = '0x' + binType.toString(16);
  if (binTypeHex !== '0x4e4942') {
    console.error(`ERROR on ${key}: BIN chunk type is ${binTypeHex}, expected 0x4e4942`);
    allOk = false;
  }
}

if (allOk) {
  console.log(`SUCCESS: All ${Object.keys(catalog).length} GLBs have valid BIN chunk header (0x4e4942 / 'BIN ')!`);
}
