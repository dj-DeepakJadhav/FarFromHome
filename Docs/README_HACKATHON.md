# Far From Home: Kruma Express
## Master Game Design Document — MHCP Game Prototype Submission

> **Genre**: Narrative Life & Courier Management Simulation  
> **Inspiration**: *Nicos Weg* (DW German Learning Series) × *Messenger by Abeto* × *Coffee Talk / Good Pizza, Great Pizza*  
> **Platform**: Mobile-first WebGL, fixed portrait 390×844  
> **Packaging**: Single unminified `index.html`, zero CDNs, 100% offline, ≤ 35 MB  
> **Engine**: Three.js r128 (vendored), plain ES6 — zero external build dependencies  

> **This document is the master design authority.** Every tunable number here matches `src/core/economy.js` and `src/data/shifts.js`.

---

## 1. Pitch & Premise

You are an international student newly arrived in the historic Hanseatic island city of Lübeck, Germany. You have **€20 in your wallet**, an urgent **€250 Semesterbeitrag (university tuition deadline)**, and 3 strikes before your work contract and student visa are revoked.

To survive and matriculate, you take up a bicycle courier job with **Kruma Express**. You explore a charming, living isometric diorama of Lübeck (*Messenger*), meet quirky local residents (Rita at the University Registry, Mathias at the Pizzeria, Oma Martha at the Bakery, Nina at Kruma Dispatch, and Hans Lokker at your WG sublet), fulfill grocery orders called out in authentic spoken German, ride through cobblestone streets to deliver parcels directly on the city map, and practice cultural etiquette (*Sie* vs. *Du*, *Ruhezeit*, tipping) at customer doorways.

**The Signature Twist**: By shift three, you are intuitively understanding spoken German articles and vocabulary because **German grammar (`der / die / das`) is the core spatial search filter that doubles your picking speed and economic earnings**.

---

## 2. The Unified Core Loop Architecture

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                                                                             │
 │  1. [CITY_EXPLORATION] — Living Lübeck Island Diorama (Messenger Style)     │
 │     • Explore the continuous 3D Altstadt on your bicycle with tap-to-move.  │
 │     • Talk to voiced NPCs directly in the city with dual German/English.   │
 │     • Discover local needs, story quests, and clock in at Kruma Dispatch.   │
 │                                                                             │
 │  2. [PICK] — Warehouse Packing Shift (Audio-First Pedagogical Core)         │
 │     • Spoken German orders called out ("Die Milch!", "Der Apfel!").         │
 │     • 3-tier shelves color-coded by gender (Der=Blue ▲, Die=Pink ●, Das=Purple ■). │
 │     • Spatial sorting cuts search time by 66% — earn massive early streaks! │
 │                                                                             │
 │  3. [CITY_DELIVERY] — In-Map Courier Run (Real City Navigation)             │
 │     • Step out of the warehouse with the packed order on your bike.         │
 │     • Glowing destination beacon highlights the customer's house on map.    │
 │     • Ride across cobblestones; E-Bike upgrade provides +50% speed boost!   │
 │                                                                             │
 │  4. [DIALOGUE] — Customer Doorway Handoff (Front-Facing 2.5D Diorama)       │
 │     • Deliver package at the warm customer doorway diorama.                 │
 │     • Meaningful, voiced German dialogue (*Sie* vs. *Du*, polite greetings).│
 │     • Earn customer satisfaction tip bonuses (+€3 to +€15).                 │
 │                                                                             │
 │  5. [DEBRIEF & SHOP] — Shift Receipt & Visible Economic Upgrades            │
 │     • Itemized payout: Base wage + Early Streak + Tips - Deductions.        │
 │     • Visit the Bike Shop: Invest in visible E-Bikes, Thermal Bags,         │
 │       Warehouse Shelf Labels, and Vocab Notebooks.                          │
 │     • Watch your Tuition Fund grow from €20 to €250 to win the game!        │
 │                                                                             │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Signature Mechanic: German Grammar as Spatial Search

The German learning system is not a disconnected quiz; it is **your primary economic efficiency tool**:

### 3.1 Spatial Gender Shelves
The warehouse shelf is structured into **three distinct horizontal tiers**, each mapping to one grammatical gender:

| Tier | Article | Color | Symbol | Canonical Items |
| :--- | :---: | :---: | :---: | :--- |
| **Bottom** | **der** | Blue `#3A86FF` | ▲ | *der Apfel*, *der Käse*, *der Kaffee*, *der Wein* |
| **Middle** | **die** | Coral `#FF006E` | ● | *die Milch*, *die Banane*, *die Karotte*, *die Pizza*, *die Dose* |
| **Top** | **das** | Purple `#8338EC` | ■ | *das Brot*, *das Wasser*, *das Ei* |

Hearing **"die Milch"** instantly directs the player's eyes to the middle pink tier before they even read or visualize milk. Twelve shelf slots collapse into four. This 3× spatial search reduction enables rapid picking and unlocks high streaks.

### 3.2 The Teach ➔ Anticipate ➔ Test Ramp
- **Shift 1 (TEACH - Delay 0.0s)**: Audio and icon arrive simultaneously. Pure association.
- **Shift 2 (ANTICIPATE - Delay 1.5s)**: Audio plays first. Guessing via gender tier grants early bonus.
- **Shift 3+ (TEST - Delay 2.5s)**: Audio-only window. The player actively listens and picks by ear.

### 3.3 Learning is the Skill Ceiling, Never the Floor
The item icon always resolves eventually. A player with zero German background can complete every shift, but learning the words allows them to earn the **2.0× Early Pick Multiplier** and reach the €250 goal much faster.

---

## 4. Deterministic Micro-NLP & Voiced Audio Architecture

### 4.1 100% Offline Symbolic Morphology Engine (`src/core/grammarEngine.js`)
- Dynamically constructs grammatically flawless German requests based on NPC needs:
  - Accusative: *"Ich brauche **den** Käse für die Pizza."*
  - Polite/Formal: *"Könnten Sie mir bitte **das** Mehl bringen?"*
- Calculates noun cases (*Nominativ*, *Akkusativ*, *Dativ*) and gender agreements deterministically with zero runtime latency.

### 4.2 Pre-Baked Studio Voice Acting Manifest (`src/audio/`)
- Eliminates robotic system voices by bundling expressive, character-acted German audio clips:
  - **Oma Martha**: Warm, grandmotherly, encouraging.
  - **Herr Mathias**: Expressive, lively Italian-German restaurant boss.
  - **Frau Rita**: Crisp, formal, bureaucratic registrar.
  - **Nina**: Friendly, energetic, street-smart dispatcher.
  - **12 Grocery Nouns**: Clear studio pronunciation of every item with its article.
- Audio footprint is **< 1 MB total**, fully within the 35 MB competition limit.
- Tapping the 🔊 icon on any dialogue choice previews the spoken German pronunciation before selecting.

---

## 5. Economic Tunables & Upgrades (Canon Authority)

All numbers are codified in `src/core/economy.js` and `src/data/shifts.js`:

```javascript
window.FFH.ECONOMY = {
  STARTING_WALLET: 20,           // Starting student funds (€)
  TUITION_GOAL: 250,             // Win condition: €250 Semesterbeitrag
  MAX_STRIKES: 3,                // Lose condition: 3 strikes fired
  
  ACCURACY_BONUS_PER_ITEM: 2.50, // Base accuracy pay per clean pick
  EARLY_PICK_MULTIPLIER: 2.0,    // Multiplier for picking before icon reveals
  STREAK_STEP: 0.14,             // Multiplier gained per consecutive clean pick
  STREAK_MAX: 2.5,               // Maximum streak multiplier cap
  
  MISPICK_INTEGRITY_COST: 8,     // Bag integrity damage per mis-tap
  FRESHNESS_DECAY_RATE: 0.10     // Freshness loss per second of delivery transit
};
```

### The Upgrades Catalog (`src/data/shop.js`):
1. **E-Bike Conversion Kit (€45)**:
   - *Visual*: Mounts a sleek battery pack to the bicycle frame.
   - *Mechanical*: Increases courier movement speed across the city map by +50%.
2. **Thermal Delivery Bag (€30)**:
   - *Visual*: Equips an insulated orange delivery backpack.
   - *Mechanical*: Completely halts food freshness decay during city delivery.
3. **Warehouse Shelf Labels (€25)**:
   - *Visual*: Permanently mounts metallic `DER`, `DIE`, and `DAS` plaques on shelf rails.
   - *Mechanical*: Provides permanent high-contrast spatial navigation cues.
4. **Pocket Vocab Notebook (€15)**:
   - *Visual*: Adds an interactive dictionary icon to the HUD.
   - *Mechanical*: Displays German-English word tooltips and expands early recognition bonuses.

---

## 6. Cast & Character Roles

- **Rita Schneider** (University Registrar): Formal, bureaucratic; tracks your €250 tuition deadline and issues your final Student ID.
- **Mathias Rossi** (Pizzeria Boss): Energetic local restaurant owner who orders ingredients and introduces Italian-German immigrant solidarity.
- **Martha Webber / Oma Martha** (Traditional Baker): Warm local baker who rewards proper formal German (*Sie*) and shares Hanseatic stories.
- **Nina Lindemann** (Kruma Dispatch Lead): Pragmatic warehouse manager who assigns shifts, tracks quotas, and manages equipment.
- **Hans Lokker** (WG Sublet Landlord): Strict building manager monitoring quiet hours (*Ruhezeit*) and waste separation (*Mülltrennung*).

---

## 7. Technical & Submission Compliance

- **Orientation**: Fixed Portrait (390×844 responsive scaling).
- **Runtime**: 100% Offline Single-File `index.html` (Concatenated via `build/assemble.js`).
- **Dependencies**: Three.js r128 (Inlined / local). Zero external network calls.
- **Bundle Footprint**: Sub-10MB uncompressed, ~2MB zipped (Well within the 35MB competition limit).
