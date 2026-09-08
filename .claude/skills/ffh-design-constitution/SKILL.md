---
name: ffh-design-constitution
description: Enforces strict compliance with Docs/README_HACKATHON.md (Section 2: Four Non-Negotiable Design Pillars). Use before making any gameplay, narrative, UI, or architectural changes to ensure non-negotiable pillars are upheld.
---

# FFH Design Constitution Enforcement Skill

Before modifying ANY game mechanic, UI layout, audio pipeline, or data model, verify compliance with `Docs/README_HACKATHON.md` (Section 2: Four Non-Negotiable Design Pillars) and with `AGENTS.md` §3.1 (permanently removed claims).

*Far From Home: Kruma Express* is a **narrative courier-management sim**. Single thesis: **British deadpan comedy colliding with German municipal precision.** It is not a language-learning game and makes no pedagogical claim.

## Mandatory Pre-Flight Checks:
1. **Comedy, Not Curriculum**:
   - Does the change describe or frame the game as teaching, learning, vocabulary, or pronunciation? $\rightarrow$ **REJECT**.
   - Is the player ever *required* to know German to proceed? $\rightarrow$ **REJECT**. Items are English-first; tiers are read by colour and symbol.
   - Is German text used as comedy flavour (Beamtendeutsch, *Ruhezeit*, *Sie*/*Du*)? $\rightarrow$ **ALLOWED**.
2. **Procedural Audio Only**:
   - Does the change add a voice clip, sprite sheet of speech, `window.speechSynthesis` call, or a *second* recorded audio asset? $\rightarrow$ **REJECT**. One music track ships; every sound effect is synthesised at runtime from oscillators (`src/audio/sfx.js`, `src/audio/speech.js`).
   - Is audio ever the *informative* cue for a mechanic? $\rightarrow$ **REJECT**. The anticipation cue is the **visual gender-rail pulse**.
3. **Room is the Progress Bar**:
   - Is a separate verbless location being created? $\rightarrow$ **REJECT**.
   - Do purchased upgrades and furnishings visibly appear in the student room? $\rightarrow$ **REQUIRED**.
4. **One Core Verb**:
   - Does every interactive scene follow *Read the pulse $\rightarrow$ Identify the tier $\rightarrow$ Tap/Route*? $\rightarrow$ **REQUIRED**.
5. **Portrait Screen Layout**:
   - Does the UI fit 390×844 without overflowing or clipping? $\rightarrow$ **REQUIRED**.
6. **No Resurrection**:
   - Does the change restore spaced repetition / Leitner boxes, a vocabulary dictionary or self-quiz, or a Vocab Notebook HUD button? $\rightarrow$ **REJECT**. All were deleted.
   - Does it promote the skill tree as a headline system? $\rightarrow$ **REJECT**. Six of its nine effects are dead writes.
