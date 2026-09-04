---
name: ffh-act-one-focus
description: Enforces strict one-by-one incremental implementation focusing exclusively on Docs/ACT_ONE_BRITISH_COMEDY.md without multi-file sprawl or unrequested refactoring.
---

# Far From Home — Act One Strict Focus Protocol

> **Governing Document**: Docs/ACT_ONE_BRITISH_COMEDY.md  
> **Rule Level**: STRICT / NON-NEGOTIABLE

When working on Far From Home:

1. **MAXIMUM FILE EDIT RULE**:
   - Never touch or modify more than five files across the codebase without stopping and asking the user for explicit approval first.

2. **SINGLE TARGET FOCUS**:
   - Focus exclusively on the single current scene or interaction requested from Docs/ACT_ONE_BRITISH_COMEDY.md.
   - Do NOT refactor future scenes, orthogonal systems, or unrelated game phases.

3. **NO PREMATURE OR SPECULATIVE MULTI-FILE REFACTORING**:
   - Touch ONLY the exact 1 or 2 files strictly necessary to fix the immediate issue or advance the active step.

4. **STEP-BY-STEP PROGRESSION**:
   - Follow the step checklist in Docs/ACT_ONE_BRITISH_COMEDY.md sequentially:
     Scene 1 (Bus Stop) -> Scene 2 (Walk & Pfand) -> Scene 3 (WG Doorbell) -> Scene 4 (Nico Mülltrennung) -> Scene 5 (Tuition Letter) -> Scene 6 (Golden Hour) -> Scene 7-8 (Uni Locked & Frau Klein) -> Scene 9 (Night Flyer) -> Scene 10 (Bedtime Recap).
   - Verify each step before moving to the next.

5. **NO TECHNICAL LEAKS TO THE UI**:
   - Never expose internal engine IDs (e.g., LM_MARKTPLATZ, B_UNI, B_WG) to the player. Always display clean, narrative English text.

6. **FREE ROAM IS PASSIVE UNLESS ACTIVE IN STORY**:
   - If the player visits a building that is NOT part of the current active story objective, do NOT trigger future story beats.
   - Simply display a brief visit feedback (e.g., Visited: [Building Name] or a neutral ambient thought) and exit.
