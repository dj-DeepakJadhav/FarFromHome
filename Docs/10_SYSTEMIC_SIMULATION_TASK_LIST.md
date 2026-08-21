# 10 — SYSTEMIC SIMULATION & MANAGEMENT TASK LIST

> **Target Audience**: Autonomous AI Agents & Developers.  
> **Authority**: Governed by `Docs/00_DESIGN_CONSTITUTION.md` and `Docs/09_Canonical_Tables.md`.  
> **Objective**: Execute and integrate systemic management simulation mechanics, itemized debriefing receipts, tactical route traversal, and the 15-minute room visible growth metagame into *Far From Home: Kruma Express*.

---

## 1. System Architecture & File Registry

| Module / System | Primary Source File | Dependencies / Data Source |
| :--- | :--- | :--- |
| **FSM & Loop Orchestration** | `src/core/fsm.js` | `src/core/clock.js`, `src/data/shifts.js` |
| **Economic Engine & Sinks** | `src/core/economy.js` | `Docs/09_Canonical_Tables.md` (§2) |
| **Debriefing Receipt Generator** | `src/ui/screens.js`, `src/ui/receipt.js` | `src/core/economy.js`, `src/phases/intercomPhase.js` |
| **Tactical Route & Cargo Physics**| `src/phases/ridePhase.js`, `src/render/objectPool.js` | `src/data/streets.js`, `src/data/items.js` |
| **Room Visible Growth Engine** | `src/render/dioramaRooms.js`, `src/phases/shopPhase.js` | Kenney CC0 kits (`furniture-kit`, `cube-pets`) |
| **Audio Sprites & Voice Cues** | `src/audio/speech.js`, `src/audio/sfx.js` | Web Audio API Sprite Engine |
| **Release Bundler & Validator** | `build/assemble.js` | Single unminified `index.html` pipeline |

---

## 2. Actionable Execution Tasks

### Task 1: 3-Tier Loop & State Machine Alignment (`src/core/fsm.js`)
Ensure the state machine cleanly cycles through all 5 phases per shift without state leaks.

- [ ] **1.1**: Audit state transitions: `BOOT` $\rightarrow$ `ROOM_HUB` $\rightarrow$ `PICK` $\rightarrow$ `RIDE` $\rightarrow$ `INTERCOM` $\rightarrow$ `DEBRIEF_RECEIPT` $\rightarrow$ `ROOM_SHOP` $\rightarrow$ (Next Shift or `WIN_STATE`).
- [ ] **1.2**: Implement `shiftIndex` tracker (0: Morning, 1: Lunch, 2: Night VIP) pulling from `src/data/shifts.js`.
- [ ] **1.3**: Wire clean reset handlers ensuring timers, bag slots, and active order manifests clear between shifts.
- [ ] **Verification**: Run browser console; step through all 3 shifts and confirm `window.FFH.state` transitions cleanly.

---

### Task 2: Post-Shift Itemized Debriefing Receipt (`src/ui/receipt.js` / `src/core/economy.js`)
Implement the Kolb experiential learning debriefing screen providing full cause-and-effect transparency.

- [ ] **2.1**: Add receipt ledger accumulator in `src/core/economy.js` tracking:
  - `grossBaseWage` (e.g. +22.00€)
  - `accuracyBonus` (e.g. +3.00€)
  - `streakBonus` (e.g. +0.25x per consecutive correct pick)
  - `etiquetteTip` (e.g. +3.00€ Du vs +20.00€ VIP Sie)
  - `damageDeductions` (e.g. -2.50€ for dropped/shaken fragile goods)
  - `netPayout`
- [ ] **2.2**: Build clean DOM overlay for the receipt modal in `src/ui/screens.js` styled as a classic Berlin gig-app courier slip.
- [ ] **2.3**: Add tactile cash register sound (`Ka-Ching!`) and coin tally animation upon pressing `[Accept Payout & Go to Room]`.
- [ ] **Verification**: Complete Shift 1; confirm receipt shows exact line-item breakdown matching `Docs/09_Canonical_Tables.md`.

---

### Task 3: Tactical Route Selection & Cargo Fragility Matrix (`src/phases/ridePhase.js`)
Transform traversal from an obstacle dodge into a systemic risk/reward management choice.

- [ ] **3.1**: Define item fragility tags in `src/data/items.js`:
  - `STURDY`: Bread, Apples (0% damage on cobblestone).
  - `FRAGILE`: Glass milk bottles, eggs (Takes -10% integrity per pothole/cobblestone bump).
  - `PERISHABLE`: Ice cream, oat milk (Decays 1.5x faster outside bike lane).
- [ ] **3.2**: Implement dual route choice in `src/phases/ridePhase.js`:
  - **Option A (Fahrradweg)**: Dedicated smooth green bike lane (+30% speed, 0 damage).
  - **Option B (Kurzer Weg)**: Bumpy cobblestone shortcut (-5s travel time, triggers cargo shake tests).
- [ ] **3.3**: Tie final package integrity to the post-shift receipt damage penalty.
- [ ] **Verification**: Carry fragile milk through cobblestones; verify bag integrity drops and appears as a deduction on the debrief receipt.

---

### Task 4: The 15-Minute Living Student Room Metagame (`src/render/dioramaRooms.js` / `src/phases/shopPhase.js`)
Deliver the core judging pillar: **The Room is the Progress Bar (Visible Growth)**.

- [ ] **4.1**: Create `createLevel0Room(purchasedItems)` in `src/render/dioramaRooms.js`:
  - **Base State (Minute 1)**: Bare floor mattress, single grey bulb, instant noodle cup.
  - **Tier 1 Furnishings**: Wooden bed frame, brass desk lamp (+1s timer buffer).
  - **Tier 2 Furnishings**: Cozy patterned wool rug, potted windowsill plant.
  - **Tier 3 Pet Companion**: Animated Cube Cat (*Minka*) sleeping on bed (+15% tip boost).
  - **Victory State (Minute 15)**: Festive holiday garland, stamped tuition certificate (`SEMESTERBEITRAG BEZAHLT`).
- [ ] **4.2**: Update Shop UI in `src/ui/screens.js` allowing players to toggle between **Courier Gear** (Bike, Thermal Bag, Vocab Guide) and **Room Comforts** (Desk Lamp, Rug, Cube Cat).
- [ ] **4.3**: Dynamically re-render/spawn purchased 3D meshes in the room upon purchase.
- [ ] **Verification**: Buy the Desk Lamp in Shop 1; verify the lamp immediately renders on the student desk with a warm light point.

---

### Task 5: Air-Gap Audit, Economy Validation & Release Packaging (`build/assemble.js`)
Guarantee strict competition rules and zero-network resilience.

- [ ] **5.1**: Validate arithmetic across all 3 shifts against `Docs/09_Canonical_Tables.md` (Total target: 264.50€).
- [ ] **5.2**: Run `build/assemble.js` to bundle all modules into root `index.html`.
- [ ] **5.3**: Perform Air-Gap Test:
  - Disconnect Wi-Fi / disable network in DevTools.
  - Load `index.html` locally via file or static server.
  - Complete full 3-shift loop to tuition victory screen.
  - Confirm zero console errors, zero CDN calls, and flawless audio playback.
- [ ] **5.4**: Package final `far-from-home.zip` ($\le$ 35 MB) and record verification in `Docs/BUILD_LOG.md`.

---

## 3. Mandatory Acceptance Criteria

1. **Orientation**: Fixed 390×844 portrait layout without scrollbars or clipped action zones.
2. **Spoken-Only German**: 100% English text in UI/HUD/Receipts; authentic German environmental audio.
3. **Loop Integrity**: Seamless flow from Briefing $\rightarrow$ Pick $\rightarrow$ Ride $\rightarrow$ Buzzer $\rightarrow$ Debrief Receipt $\rightarrow$ Room Shop.
4. **Economy Balance**: Player cannot win without thoughtful gear/room reinvestment.
5. **Visible Progress**: Player room at minute 15 must be visually rich, warm, and decorated compared to minute 1.
