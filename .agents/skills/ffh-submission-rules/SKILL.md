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
5. **No Broken Fallbacks**: Missing voice clips must fail silently; do not call `window.speechSynthesis`.
