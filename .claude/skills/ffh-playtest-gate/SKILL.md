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
   - Ensure the **gender rail pulses before the item icon resolves** on Shift 2+, and that tapping the correct tier inside that window awards the 2.0× Early Pick bonus.
   - Ensure procedural SFX and per-character talk-blips fire without console errors. There are no audio files to load, so any network request for audio is a bug.
   - Ensure streak multiplier grows on correct picks and drops on errors.
   - Ensure shop purchases immediately change both the mechanic and the 3D room.
   - Ensure `pocketNotepad`'s re-pulse button renders in the shift HUD **only** when the upgrade is owned.
4. Confirm a fresh player reaches Shift 3 within 90 seconds.
5. Console must be clean: zero uncaught exceptions, zero 404s.
