const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('CRITICAL: index.html does not exist at root!');
  process.exit(1);
}

const stats = fs.statSync(indexPath);
const sizeMB = stats.size / (1024 * 1024);
const devHtml = fs.readFileSync(path.join(root, 'index.dev.html'), 'utf8');
const vendorPaths = [...devHtml.matchAll(/<script src="(vendor\/[^"]+)"/g)].map(m => m[1]);
let packageBytes = stats.size;
for (const rel of new Set(vendorPaths)) {
  const library = path.join(root, rel);
  if (!fs.existsSync(library)) throw new Error(`Missing packaged library: ${rel}`);
  packageBytes += fs.statSync(library).size;
}
const packageMB = packageBytes / (1024 * 1024);

console.log(`Current index.html size: ${sizeMB.toFixed(2)} MB (${stats.size} bytes)`);
console.log(`Complete uncompressed package: ${packageMB.toFixed(2)} MiB (${packageBytes} bytes, including vendor libraries)`);

const MAX_SIZE_MB = 35;
if (packageBytes > MAX_SIZE_MB * 1000 * 1000) {
  console.error(`ERROR: Complete package exceeds the conservative ${MAX_SIZE_MB} MB limit!`);
  process.exit(1);
} else {
  console.log(`SUCCESS: Build size is within limits (Limit: ${MAX_SIZE_MB} MB)`);
}
