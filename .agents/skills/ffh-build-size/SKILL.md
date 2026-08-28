---
name: ffh-build-size
description: Strict monitoring of the single-file index.html build size to ensure it remains below the 35MB competition limit.
---

# FFH Build Size Verification Skill

Always check the build size after editing files and assembling the final package.

## Rules:
1. **Target Limit**: The single-file build `index.html` at the repository root must be strictly $\le 35\text{ MB}$.
2. **Auto-check command**: Run `node build/check-size.js` to verify.
3. **Optimizations**: 
   - If the size grows too fast, audit inlined assets (such as inline audio sprites or SVG assets).
   - Ensure the asset pipeline is optimized.
