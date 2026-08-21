---
name: ffh-playtest-gate
description: Requires manual or automated playtest verification before declaring any task complete or pushing changes.
---

# FFH Playtest Gate Enforcement Skill

Never report a gameplay change complete without testing it live:

## Rules:
1. Re-run `node build/assemble.js` to refresh the root `index.html`.
2. Launch a local web server (e.g. `npx serve -l 3000 -s .` or `python -m http.server 3000`).
3. Verify the game in a 390×844 viewport:
   - Ensure the pick timer visibly counts down.
   - Ensure audio clips play without console errors.
   - Ensure streak multiplier grows on correct picks and drops on errors.
   - Ensure room furniture purchases immediately update the 3D room.
