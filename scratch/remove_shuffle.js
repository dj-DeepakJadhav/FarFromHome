const fs = require('fs');
let code = fs.readFileSync('src/ui/hud.js', 'utf8');

const shuffleRegex = /\/\/ Fisher-Yates shuffle to randomize button order on every visit[\s\S]*?\[shuffled\[j\], shuffled\[i\]\];\s*\}/;

if (shuffleRegex.test(code)) {
  code = code.replace(shuffleRegex, 'const shuffled = buzzerEntries;');
  fs.writeFileSync('src/ui/hud.js', code);
  console.log('Shuffle removed');
} else {
  console.log('Shuffle not found via regex');
}
