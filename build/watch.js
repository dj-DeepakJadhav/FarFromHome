const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.resolve(__dirname, '../src');
let debounceTimer = null;

function assemble() {
  const timestamp = new Date().toLocaleTimeString();
  console.log('[' + timestamp + '] Change detected in src/. Reassembling index.html...');
  try {
    execSync('node build/assemble.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    console.log('[' + timestamp + '] Assembly complete! Refresh your browser.\n');
  } catch (err) {
    console.error('[' + timestamp + '] Assembly failed:', err.message);
  }
}

console.log('Watching for changes in ' + srcDir + '...');
console.log('Press Ctrl+C to stop.\n');

assemble();

fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  if (filename.endsWith('.js') || filename.endsWith('.css') || filename.endsWith('.json')) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(assemble, 250);
  }
});
