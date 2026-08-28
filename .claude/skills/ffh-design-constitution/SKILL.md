---
name: ffh-design-constitution
description: Enforces strict compliance with Docs/README_HACKATHON.md (Section 2: Four Non-Negotiable Design Pillars). Use before making any gameplay, narrative, UI, or architectural changes to ensure non-negotiable pillars are upheld.
---

# FFH Design Constitution Enforcement Skill

Before modifying ANY game mechanic, UI layout, audio pipeline, or data model, verify compliance with `Docs/README_HACKATHON.md` (Section 2: Four Non-Negotiable Design Pillars):

## Mandatory Pre-Flight Checks:
1. **Spoken-Only German**: 
   - Is any German text rendered in the HUD, buttons, dialog, or manifest? $\rightarrow$ **REJECT**. UI MUST BE ENGLISH.
   - Is German speech used as a blocker/gate rather than an audio shortcut/reward? $\rightarrow$ **REJECT**.
2. **Room is the Progress Bar**:
   - Is a separate verbless location being created? $\rightarrow$ **REJECT**.
   - Do purchased furniture items and pets dynamically appear in `createLevel0Room()`? $\rightarrow$ **REQUIRED**.
3. **One Core Verb**:
   - Does every interactive scene follow *Hear/Read $\rightarrow$ Identify $\rightarrow$ Tap/Route*? $\rightarrow$ **REQUIRED**.
4. **Portrait Screen Layout**:
   - Does the UI fit 390×844 without overflowing or clipping? $\rightarrow$ **REQUIRED**.
