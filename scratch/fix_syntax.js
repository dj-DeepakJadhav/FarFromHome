const fs = require('fs');

let code = fs.readFileSync('src/phases/cityExplorationPhase.js', 'utf8');

code = code.replace(
  '          this.startBuildingExit();\n        });\n        return;\n      } else if (!this.game.state.hasDoneMuelltrennung) {',
  '          this.startBuildingExit();\n        });\n        });\n        return;\n      } else if (!this.game.state.hasDoneMuelltrennung) {'
);

code = code.replace(
  "          this.triggerBuildingInteraction('B_WG_ENTERED');\n        });\n        return;\n      }\n      // Buzzed but haven't done",
  "          this.triggerBuildingInteraction('B_WG_ENTERED');\n        });\n        });\n        return;\n      }\n      // Buzzed but haven't done"
);

// Wait, let's just make sure there are no other missing braces.
// To do this dynamically, let's just read and replace.
fs.writeFileSync('src/phases/cityExplorationPhase.js', code);
console.log('Fixed script');
