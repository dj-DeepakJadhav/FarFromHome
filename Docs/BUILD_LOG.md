# Far From Home — Build Log & Development Ledger

> **Submission Artifact**: Complete record of agentic AI iteration, architectural pivots, and verifiable delivery milestones.

---

## 2026-08-20 (Part 2) — Systemic Simulation & Management Integration
- **Framework Integration**: Codified systemic simulation pedagogy (Riis-Duke 12 Elements, Kolb-Ruohomäki Experiential Cycle) and modern game loops (3-tier loop hierarchy, emergent cargo fragility $\times$ road friction, economy as the engine).
- **Skills Created**:
  - `ffh-simulation-management` (Invest-Harvest-Upgrade loops with visible progress).
  - `ffh-systemic-simulation-engineering` (12 simulation elements, 3-tier loop audit, sources/sinks accounting).
  - Deployed in both `.agents/skills/` and `.claude/skills/`.
- **Documentation Overhaul & Cleanup**:
  - Updated `Docs/00_DESIGN_CONSTITUTION.md` with Pillar 4 (Systemic 3-Tier Loops & Experiential Debriefing).
  - Updated `Docs/01_GDD`, `Docs/02_Player_Journey_Map`, `Docs/04_Production_Plan` with the 15-minute room transformation matrix and itemized debriefing receipts.
  - Purged obsolete superseded folders (`Docs/plans/`, `Docs/specs/`).
  - Created master actionable task list: `Docs/10_SYSTEMIC_SIMULATION_TASK_LIST.md`.
- **Systemic Mechanics Executed**:
  - `src/core/economy.js` and `src/phases/intercomPhase.js`: Built itemized debriefing receipt tracking base wage, accuracy, streak, tip, and damage deductions.
  - `src/ui/hud.js`: Designed gig-app style receipt overlay for `DEBRIEF_RECEIPT` phase.
  - `src/data/items.js`: Introduced `STURDY`, `FRAGILE`, and `PERISHABLE` tags.
  - `src/phases/ridePhase.js`: Integrated cargo fragility matrix into dual route choices (Kurzer Weg vs Fahrradweg).
  - `src/render/dioramaRooms.js`: Refactored `createLevel0Room` into a rigid tier-based visible growth system (Base -> Tier 1 -> Tier 2 -> Tier 3 -> Victory).
  - Ran `build/assemble.js` to create offline-ready `index.html`.
- **Juice, Atmosphere & Tactile Feedback Overhaul**:
  - `src/render/particles.js`: Built ambient floating dust motes and star sparkle/burst feedback particles.
  - `src/phases/pickPhase.js`: Added 3D parabolic squash-and-stretch item arcs, floating combo/feedback text (`+Name!`, `x1.5 Streak`, `Falsch!`), and bag bounce reaction.
  - `src/phases/ridePhase.js`: Built live 3D isometric scrolling street corridor with Altbau buildings, bike lane, and pedaling courier with cobblestone wobble/tilt animation.
  - `src/ui/hud.js`: Overhauled Intercom with spring-loaded brass buzzer buttons and comic dialogue speech bubbles with instant resident feedback.
  - `src/ui/hud.js`: Implemented the hand-drawn whiteboard/notepad `CHECKLIST:` card with toggle button, dynamic strikethroughs, item fractions (`3/3`), and bottom item dock pill badges matching the reference art.
  - `src/render/geometryFactory.js`: Redesigned all 8 grocery items based on Kenney Mini-Market assets (gable milk carton with label, apple with stem/leaf, artisan baguette with score cuts, PET water bottle with cap, cheese wedge with holes, banana with stalk).
  - `src/phases/pickPhase.js`: Replaced plain wood shelves with Mini-Market steel supermarket gondolas and red pricing rails.
  - `src/render/dioramaRooms.js`: Added Kenney Furniture Kit details (vinyl shelf, framed posters, fairy lights, mugs).
---

## 2026-08-20 — Core Pivot: Room as Progress Bar & Spoken-Only German
- **Architecture**: Enacted `00_DESIGN_CONSTITUTION.md`. Established the 3 core pillars: Spoken-only German with English UI, the student room as the visible growth progress bar, and one unified verb (*hear/read $\rightarrow$ identify $\rightarrow$ tap/route*) across Dark Store, Transit Route, and Intercom contexts.
- **Documentation**: Overhauled `Docs/00` through `Docs/09` to eliminate all contradictions, obsolete mini-game proposals, and duplicate numbering.
- **Skills**: Implemented 5 mechanical agent enforcement skills (`ffh-design-constitution`, `ffh-canonical-numbers`, `ffh-submission-rules`, `ffh-build-log`, `ffh-playtest-gate`).
- **Audio Pipeline**: Switched from Kokoro TTS to Piper TTS (Thorsten German CC0). Built in-memory audio sprite player with zero runtime web font/CDN dependency.
- **Gameplay**:
  - Wired `shift.pickTimeLimit` timer into `PickPhase` with live countdown.
  - Coupled freshness decay to elapsed pick time.
  - Converted RIDE into tactical route resource choice (*Kurzer Weg* vs *Fahrradweg*).
  - Integrated Kenney CC0 kits (`furniture-kit`, `cube-pets`, `holiday-kit`) into `createLevel0Room` room-as-shop economy.

---

## 2026-08-19 — Initial 3D Isometric Engine & Shaders
- Built core Three.js orthographic diorama render setup with custom multi-band cel shaders (`MESSENGER_COZY`, `INK_OUTLINE`, `CEL_3BAND`, `RETRO_POSTER`).
- Implemented single-file bundler in `build/assemble.js` generating offline standalone `index.html`.
