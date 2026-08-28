const fs = require('fs');
const path = require('path');
const foodDir = path.join(__dirname, '..', 'assets', 'Food');
const files = fs.readdirSync(foodDir);
let objData = 'window.FFH = window.FFH || {}; window.FFH.objAssets = {';
for (const f of files) {
  if (f.endsWith('.obj') || f.endsWith('.mtl')) {
    const key = f.replace('.', '_');
    const content = fs.readFileSync(path.join(foodDir, f), 'utf-8');
    objData += `"${key}": ${JSON.stringify(content)},`;
  }
}
objData += '};\n';
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'objAssets.js'), objData);
console.log('Done!');
