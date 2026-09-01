---
name: ffh-design-authority
description: Mandates checking the master resources archive, German expat laws compendium, and living game mind map before making any game design, narrative, or code changes in Far From Home.
---

# Far From Home — Master Design Authority Skill

Use this skill whenever working on *Far From Home: Kruma Express* to ensure that all changes adhere to the canonical design decisions, external GDC frameworks, and German legal constraints.

## Mandatory Step 1: Consult Authority Documents

Before modifying any code, dialogue, or gameplay balance in this repository, the agent MUST review:
1. **[`Docs/MASTER_RESOURCES_AND_DECISION_ARCHIVE.md`](file:///c:/DeepakJadhav/Personal/FarFromHome/Docs/MASTER_RESOURCES_AND_DECISION_ARCHIVE.md)**: Understand *why* existing systems and narrative mechanics were built (Antonisse, Walsh, *Startup Panic*, Schell, Ingold, Meg Jayanth's *80 Days*).
2. **[`Docs/GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md`](file:///c:/DeepakJadhav/Personal/FarFromHome/Docs/GERMAN_EXPATS_LIVING_RULES_AND_LAWS.md)**: Enforce authentic German laws (§16b AufenthG 20h student limit, *Schwarzarbeit* risks, *Anmeldung* sequential dependencies, *Stoßlüften*, *Pfand*, *Ruhezeit*).
3. **[`Docs/GAME_MIND_MAP_AND_NARRATIVE_DESIGN.md`](file:///c:/DeepakJadhav/Personal/FarFromHome/Docs/GAME_MIND_MAP_AND_NARRATIVE_DESIGN.md)**: Keep the living systemic mind map and 11-character interaction matrix updated.

## Mandatory Step 2: Quality & Verification Gate

Before claiming any task is complete or preparing a commit:
1. Run `node build/assemble.js` and verify it exits cleanly with code 0.
2. Run `node build/check-size.js` and ensure bundle size remains `< 35 MB` (currently ~6.13 MB uncompressed / ~1.8 MB zipped).
3. Append completed milestone notes to `Docs/DEVELOPMENT_ARCHIVE.md`.
