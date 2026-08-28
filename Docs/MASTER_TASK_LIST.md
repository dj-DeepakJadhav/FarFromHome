# Far From Home: Kruma Express — Master Implementation Task List

> **Master Architecture Authority**: `Docs/README_HACKATHON.md`  
> **Technical Reference**: `Docs/TECHNICAL_REFERENCE.md`  
> **Vision**: *Messenger by Abeto* (Isometric Diorama) × *Nicos Weg* (Living German Immersion) × *Coffee Talk / Good Pizza, Great Pizza* (Tactile Management Loop)

---

## 🗺️ Master Milestone Roadmap

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Milestone 1: Deterministic Micro-NLP & Pre-Baked Voiced Dialogue Engine     │
│ Milestone 2: Unified In-City Delivery & Courier Navigation Loop             │
│ Milestone 3: Smooth Navigation & Sliding Collision (three-mesh-bvh)         │
│ Milestone 4: Economic Engine & Visible Upgrades ($15K Progression Target)    │
│ Milestone 5: 90-Second Pedagogical Golden Pacing ($15K Innovation Target)    │
│ Milestone 6: Automated Playtesting, Size Review & Final Packaging Gate       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Granular Task Breakdown

### 🎯 Milestone 1: Deterministic Micro-NLP & Pre-Baked Voiced Dialogue Engine
*Goal: Replace robotic voices and shallow one-liners with authentic, character-acted German dialogue and dynamic grammar generation.*

- [ ] **1.1 Micro-Grammar Conjugation Expansion (`src/core/grammarEngine.js`)**
  - Implement deterministic dynamic order and request generators with accurate German cases (*Nominativ*, *Akkusativ*, *Dativ*).
  - Add morphological rules for quantities, food requests, and polite formulas (*"Ich brauche..."*, *"Könnten Sie mir bitte... bringen?"*).
- [ ] **1.2 Audio Manifest & Web Audio Integration (`src/audio/sfx.js` / `src/audio/speech.js`)**
  - Bundle crisp, studio-recorded character German voice clips (< 1 MB total) for:
    - **Oma Martha** (Bakery - warm, grandmotherly)
    - **Herr Mathias** (Pizzeria - lively, expressive Italian-German)
    - **Frau Rita** (University - crisp, formal registrar)
    - **Nina** (Kruma - energetic, street-smart)
    - **12 Canonical Grocery Nouns** (Article + Noun pronunciation)
  - Deprecate robotic `window.speechSynthesis` calls in favor of the instant Web Audio engine.
- [ ] **1.3 Bilingual Dialogue Card UI (`src/phases/dialoguePhase.js` / `src/ui/hud.js`)**
  - Create sliding bottom dialogue card directly inside the city view (no cutaway void boxes).
  - Render big German text with highlighted vocabulary words and clean English subtitle hints below.
  - Add interactive 🔊 speaker buttons on dialogue choices allowing the player to hear the German pronunciation before selecting.
  - Wire cultural etiquette scoring (*Sie* vs. *Du*, polite greetings) into NPC relationship stats and customer tips.

---

### 🚴 Milestone 2: Unified In-City Delivery & Courier Navigation Loop
*Goal: Ground all deliveries in the continuous isometric Lübeck city map and retire the disconnected 3D runner.*

- [ ] **2.1 Retire Standalone Runner (`src/phases/ridePhase.js`)**
  - Transition packing completion in `pickPhase.js` directly to `CITY_EXPLORATION` with `state.activeDelivery = true`.
  - Equip the packed grocery delivery bag visibly onto the courier's bicycle model.
- [ ] **2.2 In-City Delivery Destination & Beacon**
  - Spawn an animated, glowing 3D beacon above the designated customer building (e.g. *Altbau Townhouse #4*, *Pizzeria*, *Hospital*).
  - Add an on-screen HUD mini-compass / distance indicator pointing to the destination.
- [ ] **2.3 Cargo Freshness & Transit Management**
  - Implement gentle transit freshness decay in `cityExplorationPhase.js` based on delivery time.
  - Stepping up to the customer's doorway automatically initiates the front-facing **Doorway Dialogue Handoff**.
- [ ] **2.4 Seamless Shift Debrief & Payout**
  - Transition from customer doorway to the itemized **Shift Receipt** (Base Pay + Streak Bonus + Etiquette Tip - Freshness Penalty).
  - Add coin chime audio SFX and animated Tuition Progress fill bar (€20 ➔ €250).

---

### 🧭 Milestone 3: Smooth Navigation & Sliding Collision (`three-mesh-bvh`)
*Goal: Deliver buttery-smooth, organic bicycle navigation that never gets stuck on building corners.*

- [ ] **3.1 Vendor `three-mesh-bvh`**
  - Include the lightweight (~45 KB) `three-mesh-bvh` library locally in `vendor/`.
  - Ensure zero external network calls (100% offline airgap).
- [ ] **3.2 Static Geometry Bounds Tree Compilation**
  - Compute bounds trees for static city ground, buildings, bridges, and canal walls on scene load.
- [ ] **3.3 Capsule/Sphere Sliding Collision**
  - Upgrade courier movement in `cityExplorationPhase.js` to use BVH sliding collision.
  - Smooth out corners around stepped-gable Altbau buildings, canal bridges, and sidewalks.
- [ ] **3.4 Instant Tap-to-Move Raycasting**
  - Accelerate touch destination picking using BVH raycasting for instant, lag-free response on mobile portrait.

---

### 💰 Milestone 4: Economic Engine & Visible Upgrades ($15K Progression Target)
*Goal: Ensure every euro invested in the Bike Shop creates an unmistakable, immediate visual and mechanical impact.*

- [ ] **4.1 Visible E-Bike Conversion Kit (€45)**
  - Add visual battery pack and illuminated headlight to the courier's 3D bicycle mesh.
  - Increase in-city cycling speed by +50% with an electric motor hum SFX.
- [ ] **4.2 Visible Thermal Insulated Bag (€30)**
  - Upgrade courier backpack to a glowing, insulated orange cube pack.
  - Completely halt food freshness decay during city delivery navigation.
- [ ] **4.3 Warehouse Shelf Labels (€25)**
  - Physically mount metallic, glowing `DER` (Blue), `DIE` (Pink), and `DAS` (Purple) plaques onto warehouse shelf rails.
- [ ] **4.4 Pocket Vocab Notebook (€15)**
  - Add an interactive German-English reference handbook to the HUD with audio pronunciation replays.
- [ ] **4.5 Win Condition (€250 Tuition Goal)**
  - When wallet hits €250, highlight the University Registry on the city map.
  - Talking to Frau Rita triggers the celebratory **Matriculation Victory Screen** and issues the official Student ID card!

---

### ⏱️ Milestone 5: 90-Second Pedagogical Golden Pacing ($15K Innovation Target)
*Goal: Ensure judges experience the "German grammar as spatial search" breakthrough within the first 90 seconds.*

- [ ] **5.1 Shift 1 (TEACH - 0.0s Delay)**
  - Spoken audio *"Die Milch!"* + Shelf Rail pulses in Pink ● + Item icon visible immediately.
  - Teaches the basic rule: *Der = Blue, Die = Pink, Das = Purple*.
- [ ] **5.2 Shift 2 (ANTICIPATE - 1.5s Delay)**
  - Spoken audio *"Der Apfel!"* plays first. Item icon is hidden for 1.5s.
  - Guessing the bottom blue tier before the icon reveals awards the **`2.0× EARLY PICK MULTIPLIER`** with gold sparkles.
- [ ] **5.3 Shift 3 (TEST - 2.5s Delay)**
  - Pure audio recognition. The player picks items by ear, earning maximum streak multipliers.
- [ ] **5.4 First-Time User Experience (FTUE) Tutorial Callouts**
  - Subtle, high-contrast tutorial banners on Shift 1 that never freeze or wrestle control away from the player.

---

### 🔒 Milestone 6: Automated QA, Size Compliance & Packaging Gate
*Goal: Guarantee zero console errors, rock-solid 60 FPS performance, and strict < 35 MB offline delivery.*

- [ ] **6.1 Single-File Concatenation & Build Verification**
  - Run `node build/assemble.js` to ensure single unminified `index.html` builds with 0 errors.
- [ ] **6.2 Strict Size Audit**
  - Run `node build/check-size.js` to verify bundle is `< 10 MB uncompressed` (< 35 MB hard limit).
- [ ] **6.3 100% Offline Airgap Test**
  - Verify complete loop in Chrome DevTools Offline mode: `Boot ➔ City ➔ Kruma Pack ➔ City Delivery ➔ Doorway ➔ Receipt ➔ Shop ➔ Win`.
- [ ] **6.4 Submission Deliverables Sync**
  - Keep `Docs/submission/DESIGN_INTENT_DOC.md` (≤ 500 words), `DEVPOST_SUBMISSION_FORM.md`, and `VIDEO_SCRIPT_AND_STORYBOARD.md` 100% in sync.

---

## 📈 Execution Order
1. **Milestone 1** (Micro-NLP & Voiced Audio)
2. **Milestone 2** (In-City Delivery Flow)
3. **Milestone 3** (`three-mesh-bvh` Navigation)
4. **Milestone 4** (Visible Upgrades & Economy)
5. **Milestone 5** (90-Second Pacing Polish)
6. **Milestone 6** (Verification & Release Gate)
