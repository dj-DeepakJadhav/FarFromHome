#!/usr/bin/env node
/**
 * Builds the competition submission zip.
 *
 * MHCP packaging rules this enforces:
 *   - one .zip, index.html at the TOP LEVEL (not nested in a folder)
 *   - third-party libraries live in vendor/, referenced by relative path
 *   - every asset is inside the zip, no external URLs at runtime
 *   - total zip <= 35 MB
 *
 * The vendor list is derived from index.html itself, so a script tag that is
 * added or dropped cannot silently desync from what gets packaged.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const stageDir = path.join(dist, 'submission');
const zipPath = path.join(dist, 'far-from-home-kruma-express.zip');

const MAX_ZIP_BYTES = 35 * 1000 * 1000;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

const indexPath = path.join(root, 'index.html');
if (!fs.existsSync(indexPath)) fail('index.html is missing at the repository root.');
const html = fs.readFileSync(indexPath, 'utf8');

// --- 1. Refuse to package a build that would reach out to the network. ---
const externalRefs = [
  ...html.matchAll(/(?:src|href)\s*=\s*["'](https?:)?\/\/[^"']+["']/gi),
].map((m) => m[0]);
if (externalRefs.length) {
  fail(`build references external URLs, which fails validation:\n  ${externalRefs.join('\n  ')}`);
}

// --- 2. Collect the vendor files index.html actually asks for. ---
const vendorRefs = [...new Set(
  [...html.matchAll(/(?:src|href)\s*=\s*["'](vendor\/[^"']+)["']/g)].map((m) => m[1]),
)].sort();
if (!vendorRefs.length) fail('no vendor/ references found in index.html — expected Three.js at minimum.');

// --- 3. Any other relative reference must resolve to a file we ship. ---
const otherRefs = [...new Set(
  [...html.matchAll(/(?:src|href)\s*=\s*["']([^"'#]+)["']/g)]
    .map((m) => m[1])
    .filter((ref) => !ref.startsWith('data:') && !ref.startsWith('vendor/')),
)];
const missing = otherRefs.filter((ref) => !fs.existsSync(path.join(root, ref)));
if (missing.length) fail(`index.html references files that do not exist:\n  ${missing.join('\n  ')}`);

// --- 4. Stage a clean tree so nothing stray (logs, node_modules, old zips) leaks in. ---
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(stageDir, 'vendor'), { recursive: true });
fs.copyFileSync(indexPath, path.join(stageDir, 'index.html'));
for (const rel of [...vendorRefs, ...otherRefs]) {
  const src = path.join(root, rel);
  if (!fs.existsSync(src)) fail(`missing packaged file: ${rel}`);
  const dest = path.join(stageDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// --- 5. Zip from inside the stage dir so index.html sits at the zip root. ---
execFileSync('zip', ['-r', '-q', '-X', zipPath, '.', '-x', '.*'], { cwd: stageDir });

// --- 6. Verify the artefact we just produced, rather than trusting step 5. ---
const listing = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
  .split('\n').filter(Boolean).sort();
if (!listing.includes('index.html')) fail('index.html is not at the top level of the zip.');

const zipBytes = fs.statSync(zipPath).size;
if (zipBytes > MAX_ZIP_BYTES) {
  fail(`zip is ${(zipBytes / 1e6).toFixed(2)} MB, over the 35 MB limit.`);
}

console.log('Submission package contents:');
for (const entry of listing) console.log(`  ${entry}`);
console.log(`\nindex.html at top level : yes`);
console.log(`vendor/ libraries       : ${vendorRefs.length}`);
console.log(`external URL references : 0`);
console.log(`zip size                : ${(zipBytes / 1e6).toFixed(2)} MB / 35 MB`);
console.log(`\nOK -> ${path.relative(root, zipPath)}`);
