---
name: ffh-canonical-numbers
description: Enforces that all economic tunables, timers, item quantities, and multipliers originate from Docs/README_HACKATHON.md (Section 5) without magic numbers.
---

# FFH Canonical Numbers Enforcement Skill

Every balance value in the game must derive from `Docs/README_HACKATHON.md` (Section 5: Canonical Economy & Upgrades Balance):

## Rules:
1. **No Magic Numbers**: Never hardcode wage rates, time limits, freshness decay rates, tip formulas, or streak caps in phase files.
2. **Single Source of Truth**: All economic values must be declared in `src/core/economy.js` or `src/data/shifts.js` and match `Docs/README_HACKATHON.md`.
3. **Dual Update Requirement**: Any change to an economic constant requires updating BOTH the JavaScript source AND `Docs/README_HACKATHON.md` in the exact same commit.
