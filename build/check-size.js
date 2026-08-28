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

console.log(`Current index.html size: ${sizeMB.toFixed(2)} MB (${stats.size} bytes)`);

const MAX_SIZE_MB = 35;
if (sizeMB > MAX_SIZE_MB) {
  console.error(`ERROR: Build size (${sizeMB.toFixed(2)} MB) exceeds the strict offline limit of ${MAX_SIZE_MB} MB!`);
  process.exit(1);
} else {
  console.log(`SUCCESS: Build size is within limits (Limit: ${MAX_SIZE_MB} MB)`);
}
