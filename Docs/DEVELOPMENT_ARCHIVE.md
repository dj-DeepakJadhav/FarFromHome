# Far From Home: Kruma Express — Development Archive & Historical Records

> ## ⚠️ THIS IS HISTORY, NOT A SPECIFICATION. DO NOT BUILD FROM IT.
>
> This file is the chronological record and the competition build log. Parts of it describe
> designs that were **never implemented and are not planned** — most notably the 2026-08-26
> "Comprehensive Life Simulation Pivot" entry, which specifies a 14-day Lübeck life sim with a
> *Sperrkonto* unlock chain, *Bürgeramt* appointments, WG viewings, flea markets and a weekly
> calendar. None of that exists in `src/`, and none of it is in scope.
>
> **Authoritative sources, in order:**
> 1. `Docs/README_HACKATHON.md` — design authority
> 2. `Docs/TECHNICAL_AND_AI_ARCHITECTURE.md` — systems detail
> 3. `Docs/TASKLIST.md` — execution order

> **Notice**: This document consolidates all historical design specifications, sprint task lists, dialogue matrices, and development logs used during the production of *Far From Home: Kruma Express*.  
> For the official submission and game design overview, see **`Docs/README_HACKATHON.md`**.  
> For the technical and shader architecture, see **`Docs/TECHNICAL_AND_AI_ARCHITECTURE.md`**.

---

# Table of Contents
1. [Minute-by-Minute Player Journey Map](#1-minute-by-minute-player-journey-map)
2. [Production Roadmap & Scope Cuts](#2-production-roadmap--scope-cuts)
3. [Scenario Dialogue & Linguistic Specs](#3-scenario-dialogue--linguistic-specs)
4. [Procedural Asset Specs & Tooling](#4-procedural-asset-specs--tooling)
5. [Systemic Simulation Task List](#5-systemic-simulation-task-list)
6. [Complete Chronological Build Log](#6-complete-chronological-build-log)

---

## 1. Minute-by-Minute Player Journey Map

*(Preserved from `02_Player_Journey_Map_Far_From_Home.md`)*

### Minute 0:00–1:30 | The Sublet & First Shift
- **Narrative Hook**: The player sits in a dark, cold student room in Berlin. An email notification glows on their laptop: *250€ Semesterbeitrag due in 5 days or university enrollment will be terminated.*
- **First Harvest**: Player taps "Start Shift 1" and enters Kruma Dark Store #104. Fulfills 3 basic grocery orders (Milk, Bread, Apple) and earns 28.00€.
- **Emotional Arc**: Anxious urgency $\rightarrow$ Relieved confidence.

### Minute 1:30–5:00 | Intermission 1 & Shift 2 (Lunch Rush)
- **First Investment**: Player visits the Intermission Shop and buys the **City Bicycle (45.00€)**.
- **The Rush**: Double order manifests under tighter timers. Faster street transit with bike lane lane-switching.
- **Harvest**: Earns 94.00€, bringing wallet to 97.00€. Player buys the **Thermal Courier Bag (60.00€)** and **Pocket Vocab Guide (35.00€)**.

### Minute 5:00–10:00 | Shift 3 (Night VIP Hospital Delivery)
- **High-Stakes Climax**: Rainy nighttime hospital delivery requiring all three upgrades to unlock the 122.50€ VIP Express Bonus.
- **Doorstep Resolution**: Complex Hinterhaus buzzer matching and formal *Sie* etiquette dialogue.
- **Victory**: Total wallet hits 264.50€, exceeding the 250€ goal.

---

## 2. Production Roadmap & Scope Cuts

*(Preserved from `04_Production_Plan_and_MVP_Scope.md`)*

| System | In MVP | Explicit Scope Cuts |
| :--- | :--- | :--- |
| **Warehouse** | 3 shelf tiers, 8 low-poly items, spoken audio lead | Barcode laser scanning, 50+ inventory SKU list |
| **Street Transit** | 3-lane road, green bike lane, tactical route choice | Day/night weather cycle, crowd AI |
| **Intercom** | 8-button brass panel with floor codes (*EG, OG, HH*) | Multi-floor 3D stairwell climbing minigame |
| **Economy** | Itemized settlement debrief receipt, room upgrades | Multi-city franchise expansion, multiplayer |

---

## 3. Scenario Dialogue & Linguistic Specs

*(Preserved from `05_Dialogue_and_Interaction_System_Spec.md`)*

### Grammatical Dual-Signaling Palette
- **Maskulin (*der* / Blue `#3A86FF` / ▲)**: *der Apfel* 🍎, *der Käse* 🧀, *der Kaffee* ☕, *der Tee* 🍵
- **Feminin (*die* / Coral Red `#FF006E` / ●)**: *die Milch* 🥛, *die Tomate* 🍅, *die Banane* 🍌, *die Butter* 🧈
- **Neutrum (*das* / Purple `#8338EC` / ■)**: *das Brot* 🍞, *das Ei* 🥚, *das Wasser* 💧, *das Müsli* 🥣

### Etiquette Branch Scenarios
1. **Shift 1 — Student Peer (*Du*)**:
   - Customer: *"Hey! Kruma Express? Super schnell, danke!"*
   - Choice A (*Friendly Du*): *"Gerne! Guten Appetit und viel Erfolg beim Lernen!"* $\rightarrow$ **+3€ Tip**
2. **Shift 2 — Busy Mother (*Polite Sie*)**:
   - Customer: *"Guten Tag! Ist die laktosefreie Milch dabei?"*
   - Choice A (*Polite Sie*): *"Ja, genau hier: Einmal laktosefreie Milch. Schönen Tag noch!"* $\rightarrow$ **+8€ Tip**
3. **Shift 3 — Hospital Doctor (*Formal VIP Sie*)**:
   - Customer: *"Guten Abend. Ich habe die Express-Lieferung für Station 4B bestellt."*
   - Choice A (*Formal Sie*): *"Guten Abend Frau Doktor! Hier ist Ihre Express-Bestellung. Einen ruhigen Dienst noch!"* $\rightarrow$ **+20€ VIP Tip**

---

## 4. Procedural Asset Specs & Tooling

*(Preserved from `08_Asset_Specs_And_Procedural_Tooling.md`)*

### 3D Geometric Primitives
- **Courier Bicycle**: Orange box frame with dual-cylinder wheels.
- **Shelving**: Steel 4-post supermarket gondola with red price tag rails.
- **Grocery Meshes**: Gable-top milk carton, indented apple with leaf stem, scored artisan baguette, clear PET bottle, perforated Swiss cheese wedge, and leafy carrot.
- **Particle VFX**: Instanced star sparkle mesh emitters for successful picks and error sparks for mispicks.

---

## 5. Systemic Simulation Task List

*(Preserved from `10_SYSTEMIC_SIMULATION_TASK_LIST.md`)*

- [x] **Task 1: 3-Tier Loop & State Machine Alignment (`src/main.js` / `src/phases/shopPhase.js`)**
  - Added `ROOM_HUB` and `DEBRIEF_RECEIPT` states.
  - Initial load transitions into room hub; shift increments upon leaving the shop.
- [x] **Task 2: Itemized Post-Shift Debriefing Receipt (`src/ui/hud.js` / `src/core/economy.js`)**
  - Full transparent breakdown of wages, accuracy, streaks, tips, and damage deductions.
- [x] **Task 3: Tactical Route Selection & Cargo Fragility Matrix (`src/phases/ridePhase.js`)**
  - E-Bike speed boost and Thermal Bag freshness insulation.
  - Fragility mechanics mapping fragile items (*milch*, *ei*) to cobblestone road damage.
- [x] **Task 4: Living Student Room Metagame (`src/render/dioramaRooms.js`)**
  - Dynamic spawning of bed frame, desk, lamp, rug, and breathing Cube Cat upon purchase.
- [x] **Task 5: Air-Gap Audit & Release Packaging (`build/assemble.js`)**
  - Standalone `index.html` bundled into `far-from-home.zip` at 1.47 MB.

---

## 6. Complete Chronological Build Log

*(Preserved from `BUILD_LOG.md`)*

### 2026-08-26 — Comprehensive Life Simulation Pivot (Lübeck Student Journey)
- **Life Sim Architecture**: Expanded the game from a single dark store shift runner into a rich, narrative student life simulation in historic Lübeck.
- **The German Catch-22 Chain**: Structured the core progression around real-world German student bureaucracy (Hostel bed $\rightarrow$ WG viewing & lease $\rightarrow$ Bürgeramt *Anmeldung* $\rightarrow$ Sparkasse bank account $\rightarrow$ Sperrkonto 934€/mo payout $\rightarrow$ 250€ tuition victory).
- **Weekly Rhythm & Cultural Authenticity**: Integrated a 3-slot daily schedule (Morning, Afternoon, Evening) with Friday night Kneipen, Saturday flea markets (50% off furniture), and legally quiet Sundays (*Ruhetag*).
- **Consolidated Authoritative Documentation**: Merged 13 fragmented docs into 3 comprehensive files (`README_HACKATHON.md`, `TECHNICAL_AND_AI_ARCHITECTURE.md`, `DEVELOPMENT_ARCHIVE.md`).

### 2026-08-21 — Systemic Simulation & Management Integration
- **FSM & Room Hub**: Added dedicated `ROOM_HUB` phase; player starts in their 3D student room sublet.
- **Post-Shift Receipt**: Integrated classic Berlin gig-app courier receipt calculation and UI overlay.
- **Gear Upgrades in Transit**: Connected E-Bike speed multiplier and Thermal Bag insulation to the 3D street scrolling engine.
- **Kenney Asset Geometry Overhaul**: Built realistic gable-top milk cartons, artisan baguettes, PET water bottles, and steel supermarket shelving.
- **Living Room Idle VFX**: Enabled synchronized breathing animations for the pet Cube Cat.

### 2026-08-20 — Core Pivot: Room as Progress Bar & Spoken-Only German
- **Constitutional Alignment**: Codified the non-negotiables in `Docs/00_DESIGN_CONSTITUTION.md`.
- **Notepad Manifest UI**: Built the hand-drawn checklist card with dynamic strikethroughs and bottom dock bar.
- **Kinetic 3D Transit**: Built scrolling 3D Altbau street diorama with bike lane lean and cobblestone wobble.
- **Juicy Feedback**: Added parabolic 3D grocery drop physics with squash-and-stretch and star sparkles.
- **Visual Concept Guide**: Authored 4 reference concept illustrations for the core gameplay loop.

### 2026-08-27 — Audio Leads Manifest, Early-Pick Reward, & Mechanical Upgrades Shop
- **Audio-Leads-Manifest**: Implemented 3-tier ramp stage progression (`TEACH`, `ANTICIPATE`, `TEST`) to escalate audio-visual reveal delays across shifts.
- **Ramping Audio Mechanics**: Enabled spoken German prompts to play instantly alongside 3D color-coded rail flash animations, delaying English/icon checklists to reward early picks.
- **Early-Pick Reward Loop**: Hooked up early picks to double streak combo increments, gold starburst particles, and dynamic `"gehört!"` floating toasts.
- **Mechanical Upgrades Shop**: Replaced decorative room furnishings with 5 mechanical cards (E-Bike, Thermal Bag, Shelf Labels, Pocket Notepad, Vocab Cards), implementing next-shift parameter previews.
- **Pocket Notepad (One-Time Re-listen)**: Added a single-use re-play audio button to the manifest checklist toolbar.
- **Diorama Clean-up**: Streamlined room diorama rendering to be fully furnished by default, removing obsolete conditional branches.
- **Offline & Packaging compliance**: Verified 100% offline local vendor loading and compiled an unminified single-file `far-from-home.zip` under 1.6MB.

### 2026-08-27 — Official Kenney 3D Art Kit Integration & Visual Overhaul
- **Automated GLB Packaging Pipeline**: Created `build/pack_kenney_assets.js` to convert 29 selected 3D GLB assets from local Kenney folders into an offline Base64 dictionary (`src/data/kenneyAssets.js`), bundling seamlessly into `index.html`.
- **Food Kit Integration**: Connected 8 core grocery items (`apple`, `carton`, `bread`, `soda-bottle`, `banana`, `cheese-cut`, `egg`, `carrot`) in `src/render/geometryFactory.js` to official Kenney models while retaining gender color rings and floating 3D labels.
- **Suburban City & Scenery**: Upgraded town building generation in `src/render/townFactory.js` and street scenery in `src/phases/ridePhase.js` with modular Suburban City Kit houses (`building-type-*.glb`), trees, and fences.
- **Roads & Transit Polish**: Enhanced the transit cycling experience with modular road surfaces, streetlights, traffic lights, and construction barriers.
- **3D Customer & Doorstep Delivery**: Integrated Kenney mini-character models into `src/render/character.js` (courier cyclist) and spawned 3D resident characters at the destination doorstep for the Du/Sie etiquette dialogue challenge.
- **Bundle Constraints Verified**: Successfully assembled the updated single-file `index.html` (5.2 MB uncompressed, 1.8 MB zipped release), well below the 35 MB competition constraint.

### 2026-08-27 — 3D Hanseatic Lübeck City Island Map & Bicycle Exploration Engine
- **3D City Island Architecture**: Generated procedural 18×18 Lübeck Altstadt island map surrounded by an animated Trave canal water shader with vertex wave displacement.
- **Hanseatic Landmarks & Altbauten**: Integrated stepped-gable brick townhouses, twin conical Holstentor gate towers, St. Mary's (Marienkirche) twin spires, Kruma Dark Store #104, Bürgeramt/Rathaus, and University courtyard.
- **Interactive Bicycle Roaming**: Implemented player-controlled 3D bicycle navigation with pedaling kinetics, courier thermal backpack, camera following, and responsive dual controls (WASD/Arrow keys + mobile touch joystick/pan).
- **POI Dispatch & Shift Triggers**: Connected city points of interest with interactive slide-over inspector cards, enabling the player to explore the city to initiate grocery picking shifts, visit their student WG sanctuary, and track tuition goals.
- **Mobile Portrait UI**: Polished the HUD with SimCity-style top status bar and bottom navigation dock optimized for 390×844 portrait orientation.

### 2026-08-28 — Master Narrative & Simulation Alignment ("Nicos Weg" × "Messenger of Abeto")
- **Core Loop & Economy Repair**: Fixed null pointer dereference on debrief receipt transition, resolved missing `updateQuestTracker`, aligned `FFH.finishShift` invocation, and ensured active delivery flags cleanly reset on shift completion.
- **Micro-Grammar Engine & German Pedagogy Integration**: Created `src/core/grammarEngine.js` for symbolic morphology and slot-filling grammar rules; wired dynamic spoken German audio (`der/die/das` + noun) into `src/phases/pickPhase.js`.
- **German Reality Courier Runner**: Overhauled `src/phases/ridePhase.js` with cobblestone texture paths, dedicated bicycle lanes, realistic obstacle scaling (construction barriers, pedestrians), live bag integrity & freshness HUD meters, and visual distance fog.
- **Budget Reclaim & Asset Pruning**: Removed dead town factories and legacy assets (`townModels.js`, `townFactory.js`), removed ~22MB of non-runtime research PDFs from release artifacts, keeping build at ~8.5MB uncompressed (~1.8MB zipped).
- **Master Documentation Unification**: Realigned `README_HACKATHON.md`, `DESIGN_INTENT_DOC.md`, `OFFLINE_AI_AND_GERMAN_LEARNING_SYSTEM.md`, and `CHARACTERS_AND_BEHAVIOR.md` to establish *Far From Home* as a narrative student life & courier management simulation.

