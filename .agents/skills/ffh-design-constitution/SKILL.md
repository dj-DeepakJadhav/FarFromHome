---
name: ffh-design-constitution
description: Enforces strict compliance with Docs/README_HACKATHON.md (Section 2: Four Non-Negotiable Design Pillars). Use before making any gameplay, narrative, UI, or architectural changes to ensure non-negotiable pillars are upheld.
---

# FFH Design Constitution Enforcement Skill

Before modifying ANY game mechanic, UI layout, audio pipeline, or data model, verify compliance with `Docs/README_HACKATHON.md` (Section 2: Four Non-Negotiable Design Pillars):

## Mandatory Pre-Flight Checks:
1. **Spoken German Leads**:
   - German speech acts as the lead hint. The manifest row shows article and gender symbol only (e.g. `die ●`) until the icon reveal delay expires, after which it reveals the English name and icon.
   - Do not display the German written noun in the UI manifest.
2. **Upgrades Have Mechanical Effects**:
   - All shop items must have a direct, functional, and simulated mechanical effect.
   - Shop cards must display before/after parameter previews.
   - Decorative items with no mechanical effect are prohibited.
3. **One Core Verb**:
   - Does every interactive scene follow *Hear/Read ➔ Identify ➔ Tap/Route*? ➔ **REQUIRED**.
4. **Portrait Screen Layout**:
   - Does the UI fit 390×844 without overflowing or clipping? ➔ **REQUIRED**.
   - The manifest box must not overlap the shelf play field (dock to top strip or auto-dismiss).
