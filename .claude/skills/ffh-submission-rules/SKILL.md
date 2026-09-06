---
name: ffh-submission-rules
description: Validates strict competition constraints before release packaging (portrait orientation, offline-only, <=35MB, top-level index.html).
---

# FFH Submission Rules Enforcement Skill

Before claiming completion or assembling the final release zip, verify:

## Rules:
1. **Total Zip Size**: `far-from-home.zip` must be strictly $\le 35\text{ MB}$.
2. **Top-Level `index.html`**: Must exist at repository root and be self-contained / relative-linked.
3. **Zero External Requests**: No CDN links, Google Fonts, or external scripts.
4. **Portrait Aspect Ratio**: Locked to 390×844 mobile viewport.
5. **Zero Recorded Audio**: The bundle must contain no audio files, no base64 audio, and no `window.speechSynthesis` calls. All sound is synthesised at runtime from oscillators. If you find an audio asset, it does not belong here.
6. **Judge-Facing Copy Audit**: Every submission document (`Docs/submission/*`) must be free of claims about voice acting, spoken German, pronunciation, listening tests, spaced repetition, a vocabulary dictionary or notebook, and any framing of the game as educational. Pitch the comedy thesis instead. See `AGENTS.md` §3.1.
7. **Shop Names Match Code**: Upgrade names quoted anywhere must match `src/data/shop.js` exactly — E-Bike, Thermal Bag, Shelf Labels, Pocket Notepad, Shift Rota Cards.
