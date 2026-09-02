// Inlines the Kenney Food Kit models that the game actually references into
// src/data/objAssets.js, so the single-file release build stays airgapped.
//
// Two rules keep this honest:
//   1. Only models listed in USED_MODELS are bundled. The rest of assets/Food
//      is a source library, not payload. Adding a model to geometryFactory.js
//      means adding its key here too.
//   2. Every Kenney .mtl points at the shared Textures/colormap.png atlas via a
//      relative `map_Kd`. MTLLoader resolves that to a relative URL and fetches
//      it at runtime, which is a network request the offline build must not
//      make. We rewrite the atlas to an inline data: URI instead -- resolveURL()
//      passes those through untouched, so the models keep their real Kenney
//      colours with zero requests.

const fs = require('fs');
const path = require('path');

// Must stay in sync with the modelMap in src/render/geometryFactory.js
const USED_MODELS = [
  'apple',
  'banana',
  'bread',
  'carrot',
  'carton',
  'cheese',
  'egg',
  'soda-bottle'
];

const root = path.join(__dirname, '..');
const foodDir = path.join(root, 'assets', 'Food');
const atlasPath = path.join(foodDir, 'Textures', 'colormap.png');

function buildAtlasDataUri() {
  if (!fs.existsSync(atlasPath)) {
    console.error(`CRITICAL: colour atlas missing at ${atlasPath}`);
    process.exit(1);
  }
  const base64 = fs.readFileSync(atlasPath).toString('base64');
  return `data:image/png;base64,${base64}`;
}

// Replace the relative atlas reference with the inline data URI.
//
// The Kenney .mtl files use CRLF endings, and MTLLoader splits strictly on
// '\n'. Anchored multiline matching is unsafe here: JavaScript's /m flag counts
// a bare '\r' as a line start, so a leading ^\s* happily eats the preceding
// '\n' and welds two directives into one line, which makes the loader drop the
// map entirely. Match only the directive and the rest of its line so every
// line terminator survives untouched.
function inlineAtlas(mtlText, atlasDataUri) {
  return mtlText.replace(/map_Kd[^\r\n]*/g, `map_Kd ${atlasDataUri}`);
}

function bundle() {
  const atlasDataUri = buildAtlasDataUri();
  const assets = {};
  let inlinedAtlasCount = 0;

  for (const name of USED_MODELS) {
    const objPath = path.join(foodDir, `${name}.obj`);
    if (!fs.existsSync(objPath)) {
      console.error(`CRITICAL: referenced model missing: assets/Food/${name}.obj`);
      process.exit(1);
    }
    assets[`${name}_obj`] = fs.readFileSync(objPath, 'utf-8');

    const mtlPath = path.join(foodDir, `${name}.mtl`);
    if (fs.existsSync(mtlPath)) {
      const raw = fs.readFileSync(mtlPath, 'utf-8');
      const inlined = inlineAtlas(raw, atlasDataUri);
      if (inlined !== raw) inlinedAtlasCount++;
      assets[`${name}_mtl`] = inlined;
    }
  }

  const out =
    'window.FFH = window.FFH || {}; window.FFH.objAssets = ' +
    JSON.stringify(assets) +
    ';\n';

  const outPath = path.join(root, 'src', 'data', 'objAssets.js');
  fs.writeFileSync(outPath, out, 'utf-8');

  const kb = (Buffer.byteLength(out, 'utf-8') / 1024).toFixed(1);
  console.log(`Bundled ${USED_MODELS.length} models (${inlinedAtlasCount} atlas refs inlined) -> src/data/objAssets.js (${kb} KB)`);
}

bundle();
