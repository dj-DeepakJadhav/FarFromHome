# Far From Home: Kruma Express
## Master Game Design Document — MHCP Game Prototype Submission

> **Genre**: Narrative Life & Courier Management Simulation  
> **Inspiration**: *Nicos Weg* (DW German Learning Series) × *Messenger by Abeto* × *Coffee Talk / Good Pizza, Great Pizza*  
> **Platform**: Mobile-first WebGL, fixed portrait 390×844  
> **Packaging**: Single `index.html` (game source unminified), zero CDNs, 100% offline, ≤ 35 MB  
> **Engine**: Three.js r128 (vendored), plain ES6 — zero external build dependencies  

> **Master Game Design Authority**: Single Master Blueprint for Far From Home: Kruma Express.
> **Narrative Dynamic**: Relatable British deadpan comedy (*Peep Show*, *Inbetweeners*, *Hitchhiker's Guide*) meets unyielding German municipal precision. Simple vocabulary, instant laughs, zero highbrow pretension.
> **Code-Data Architecture**: `assets/narrative/story.json` is the authoritative narrative asset and is automatically inlined into `window.FFH.storyData` during release assembly for 100% offline compliance.
> **Canonical Numbers**: All economic tunables, build sizes, and prices are strictly governed by [`CANONICAL_NUMBERS.md`](CANONICAL_NUMBERS.md).
> **Tasks**: Tracked in [`TASKS.md`](TASKS.md). Submission deliverables live in [`submission/`](submission/).

---

## 1. Pitch & Premise: The German Bureaucracy Gauntlet (*Bürokratie-Spießrutenlauf*)

You are an international student newly arrived in the historic Hanseatic island city of Lübeck, Germany, on a 1-month temporary entry visa. You check into a temporary student hostel with only **€20 in your pocket** and face a strict 28-day deadline to solve the infamous German bureaucratic puzzle before your visa expires.

To matriculate and secure your permanent residence permit (*Aufenthaltstitel*), you must navigate a realistic web of interdependent real-world requirements:
1. **Find a Job**: Work as an e-bike courier at **Kruma Express** with Dispatcher **Nina Voss** to earn funds.
2. **Matriculate at University**: Pay the **€250 Semesterbeitrag** to Registrar **Rita Schneider** at the Universität.
3. **Find a Permanent Apartment (*Wohnungssuche*)**: Save the **€30 Kaution (deposit)** and sign a lease with Caretaker **Hans Lokker** to move out of the temporary hostel.
4. **City Registration (*Anmeldung*)**: Bring your lease to the **Rathaus (Bürgeramt)** to obtain your **Meldebescheinigung** from Bureaucrat **Herr Vogel**.
5. **Unlock Blocked Account (*Sperrkonto*)**: Present your enrollment certificate and *Meldebescheinigung* to Banker **Frau Weber** to unlock your monthly living funds.
6. **Foreigners' Registration Office (*Ausländerbehörde*)**: Present all stamped documents to Case Worker **Frau Dr. Lindemann** before Day 28 to receive your Residence Permit (*Aufenthaltstitel*).

**The Signature Charm**: To succeed, you explore a charming, living isometric diorama of Lübeck (*Messenger*), fulfill high-speed grocery orders, ride through cobblestone streets to deliver parcels directly on the city map, and practice cultural etiquette (*Sie* vs. *Du*, *Ruhezeit*, tipping) at customer doorways. **Gameplay and dialogues are 100% English-first for instant frictionless playability, enriched with authentic studio German voice acting and color-coded shelf categories (Blue/Pink/Purple)** that make warehouse picking feel like a rhythmic, addictive arcade management loop.

---

## 2. Character Cast, Quirky Behaviors & Humor Dynamics (*Nicos Weg* Meets *Coffee Talk*)

To make every interaction memorable, characters have distinct, exaggerated personalities and humorous idiosyncrasies reflecting real life in Germany:

```mermaid
graph TD
    A[🛫 ARRIVAL: Temporary Hostel] -->|28-Day Visa Countdown Starts| B[🏛️ University Registry: Rita]
    B -->|Catch: Must pay €250 Semesterbeitrag| C[⚡ Kruma Express: Nina Voss Dispatch]
    
    subgraph "THE CORE ECONOMIC ENGINE (Invest ➔ Harvest ➔ Upgrade)"
        C -->|Audio Packing Shift: der/die/das Filter| D[📦 Warehouse Picking Minigame]
        D -->|Ride cobblestones & Doorway Etiquette| E[💶 Shift Payout + Customer Tips]
        E -->|Reinvest in Bike Shop| F[🚴 Hansa Rad: Mathias]
        F -->|E-Bike +50% Speed / Thermal Bag| C
    end

    E -->|Save €250| B
    B -->|Issues Immatrikulationsbescheinigung| G[📜 University Enrollment Certificate]

    E -->|Save €30 Kaution| H[🏠 WG Sublet: Hans Lokker]
    H -->|Sign Mietvertrag & Obey Ruhezeit| I[📄 Wohnungsgeberbestätigung]

    I -->|Take lease & passport| J[🏛️ Rathaus Bürgeramt: Herr Vogel]
    J -->|Pass Beamtendeutsch Dialogue| K[📑 Meldebescheinigung Stamped]

    K & G -->|Present Address + Uni Certificate| L[🏦 Sparkasse Bank: Frau Weber]
    L -->|Unlock Blocked Account| M[💳 Active Girokonto & Sperrkonto Payout]

    G & I & K & M -->|Complete 4-Document Dossier before Day 28| N[⚖️ Ausländerbehörde: Dr. Lindemann]
    N -->|VICTORY!| O[🎉 Aufenthaltstitel Stamped: Permanent Residence Permit!]
```

### The Roster of Quirky Characters:

| Character | Location | Personality & Trait | Humor & Idiosyncrasy |
| :--- | :--- | :--- | :--- |
| **Nico** | `B_WG` | Panicked Flatmate & Tea Addict | Terrified of municipal recycling fines; tests your bin sorting with yogurt pots; drinks peppermint tea. |
| **Frau Meier** | `B_WG` | Ruhezeit Enforcer (OG 1) | Shouts "NEIN! Ruhezeit!" through the intercom if you buzz during afternoon or evening quiet hours. |
| **Frau Klein** | `B_UNI` (Exterior) | Dry Local Pensioner | Carries canvas bags of potatoes; dryly mocks German public-sector 90-minute work weeks at 17:01. |
| **Rita Schneider** | `B_UNI` (Office) | Bureaucratic & Stamp-Obsessed | Takes deep sensual pleasure in stamping official papers (`*THUD-CLACK*`); gasps in horror at un-stapled forms. |
| **Klaus** | `B_DARKSTORE` (Shift 1) | Deadpan Warehouse Veteran | Teaches the 3-gender shelf filter on Day 2: *"An apple is a boy, a banana is a girl. Pick them right."* |
| **Nina Voss** | `B_DARKSTORE` | High-Speed Dispatch Lead | Drinks 6 espressos per shift; treats grocery delivery like an Olympic sport; unlocks shop gear upgrades. |
| **Mathias Becker** | `B_BIKESHOP` / `B_PIZZA` | Grumpy & Loudhearted | Shouts at everyone in Italian-German; rejects your delivery job inquiry; sells E-Bike gear upgrades. |
| **Martha Beck / Oma Martha** | `B_BAKERY` | Warm, Sweet & Traditional Baker | Family baked since 1952; tells 40-year Hanseatic stories; slips you free *Franzbrötchen* if you use polite *Sie*. |
| **Hans Lokker** | `B_WG` / Sublet | Fanatical Rule Enforcer | Measures recycling bin angles with a ruler; patrols hallways with a decibel meter at 22:01 for *Ruhezeit*. |
| **Herr Vogel** | `B_RATHAUS` | Peak *Amtsschimmel* (Bureaucrat) | Speaks strictly in passive-voice *Beamtendeutsch*; visibly brightens when rejecting forms missing middle names. |
| **Frau Weber** | `B_BANK` | Hyper-Methodical & Formal | Refuses to touch coins without hand sanitizer; gives an 8-minute lecture on German interest rates. |
| **Dr. Lindemann** | `B_AUSLAENDER` | Stern Immigration Director | Imposing and poker-faced; secretly roots for hardworking students and breaks into a warm smile when the dossier is complete. |

### 2.1 The Shadow-of-Mordor NPC Memory System
Every named NPC tracks an emotional state and **remembers your previous actions** across shifts:
```javascript
window.FFH.npcMemory = {
  nico: { trust: 0, trashDisaster: false, teaOwed: false, lastComment: null },
  frauKlein: { metAtUni: false, respectsPunctuality: false },
  herrBecker: { noiseStrikes: 0, paperworkInspected: false },
  martha: { boughtPretzel: false, gaveCashExact: false },
  klaus: { shiftsDone: 0, eggDropped: false, speedRating: 'average' }
};
```
- **Consequences**:
  - Sort trash wrong with Nico? He covers his mug next time: *"Careful! Don't throw that spoon in the paper bin!"*
  - Pay Oma Martha with exact physical coins? She beams: *"Ah, the boy with real coins. Not like those phone-tapping heathens."*
  - Late to the University? Frau Klein dryly teases: *"Look, it’s Mr. 17:01! Still looking for civil servants after teatime?"*

### 2.2 Day-to-Night Dynamic Environmental Progression
The 3D Altstadt atmosphere dynamically advances as the Day 1 visa clock ticks:
1. **15:00 (Bright Afternoon)**: Crisp Baltic sunlight, blue sky, sharp shadows. Bus station arrival.
2. **16:45 (Golden Hour / Sunset)**: Warm amber-gold sunlight, long shadows across cobblestones as you rush to the University.
3. **17:15 (Dusk)**: Purple-blue gradient in the sky, chilly coastal breeze audio ramps up.
4. **19:00 (Night Mode)**: Midnight sky, street lamps project glowing golden pools, windows lit from within.
5. **07:00 (Day 2 Dawn)**: Fresh morning mist, church bells ring, Shift 1 clock-in begins!

---

## 3. The Unified Core Loop Architecture

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

## 4. The Core Packing Mechanic: Spatial Color Sorting & Audio Cues

The packing minigame is designed for **instant arcade flow and tactile rhythm**:

### 4.1 Spatial Gender Tiers & English-First Manifest
The warehouse shelf is structured into **three horizontal tiers, sorted purely by
grammatical gender**, each color-coded with high visual contrast:

| Tier | Article | Color | Symbol | Canonical Items (English First) |
| :--- | :--- | :---: | :---: | :--- |
| **Bottom** | **der** | Blue `#3A86FF` | ▲ | Apple *(der Apfel)*, Cheese *(der Käse)*, Coffee *(der Kaffee)* |
| **Middle** | **die** | Pink `#FF006E` | ● | Milk *(die Milch)*, Banana *(die Banane)*, Carrot *(die Karotte)*, Pizza *(die Pizza)* |
| **Top** | **das** | Purple `#8338EC` | ■ | Bread *(das Brot)*, Water *(das Wasser)*, Egg *(das Ei)* |

> **Do not relabel these rows as food categories.** Earlier drafts called them
> "Chilled & Drinks", "Fresh & Snacks" and "Bakery & Dry". Those labels were never
> in the code and they contradict the data — milk is not in the chilled row, and
> apple, cheese and coffee share the bottom row only because all three are *der*.
> The mechanic is coherent as gender sorting. The category names broke it.

- Items on the packing manifest display **English first** with subtle German subtitles: `Milk (die Milch)`.
- When the order audio plays, the character voice announces the item in German (`"Die Milch!"`), providing a rhythmic audio lead.
- English-speaking judges instantly recognize the item name and color tier in under 0.1 seconds, achieving fast, satisfying combo streaks with zero cognitive friction.

### 4.2 The Rhythm Ramp
- **Shift 1 (Immediate Cue - Delay 0.0s)**: Audio and icon arrive simultaneously. Pure arcade sorting.
- **Shift 2 (Anticipation - Delay 1.5s)**: Audio plays first. Tapping the correct color shelf tier before the icon reveals grants a **2.0× Early Speed Multiplier**.
- **Shift 3+ (Expert Flow - Delay 2.5s)**: Extended audio window for seasoned couriers to maximize streak payouts.

---

## 5. Deterministic Micro-NLP & Voiced Audio Architecture

### 5.1 100% Offline Symbolic Morphology Engine (`src/core/grammarEngine.js`)
- Dynamically constructs grammatically flawless German requests based on NPC needs:
  - Accusative: *"Ich brauche **den** Käse für die Pizza."*
  - Polite/Formal: *"Könnten Sie mir bitte **das** Mehl bringen?"*
- Calculates noun cases (*Nominativ*, *Akkusativ*, *Dativ*) and gender agreements deterministically with zero runtime latency.

### 5.2 Pre-Baked Studio Voice Acting Manifest (`src/audio/`)
- Eliminates robotic system voices by bundling expressive, character-acted German audio clips:
  - **Oma Martha**: Warm, grandmotherly, encouraging.
  - **Herr Mathias**: Expressive, lively Italian-German restaurant boss.
  - **Frau Rita**: Crisp, formal, bureaucratic registrar.
  - **Nina Voss**: Friendly, energetic, street-smart dispatcher.
  - **12 Grocery Nouns**: Clear studio pronunciation of every item with its article.
- Audio footprint is **< 1 MB total**, fully within the 35 MB competition limit.
- Tapping the 🔊 icon on any dialogue choice previews the spoken German pronunciation before selecting.

---

## 6. Economic Tunables & Upgrades

> **Numbers live in [`CANONICAL_NUMBERS.md`](CANONICAL_NUMBERS.md), not here.**
> That file is generated from `src/core/economy.js` and `src/data/shop.js`. Quoting
> tunables in prose is what let four different build sizes and a non-existent
> `FRESHNESS_DECAY_RATE` circulate across the docs for weeks.

### The Upgrades Catalog (`src/data/shop.js`):
1. **E-Bike Conversion Kit (€45)**:
   - *Visual*: Mounts a sleek battery pack to the bicycle frame.
   - *Mechanical*: Increases courier movement speed across the city map by +50%.
2. **Thermal Delivery Bag (€50)**:
   - *Visual*: Equips an insulated orange delivery backpack.
   - *Mechanical*: Halves food freshness decay during city delivery.
3. **Warehouse Shelf Labels (€25)**:
   - *Visual*: Permanently mounts metallic `DER`, `DIE`, and `DAS` plaques on shelf rails.
   - *Mechanical*: Displays gender symbols on items for faster spatial navigation.
4. **Pocket Vocab Notebook (€20)**:
   - *Visual*: Adds an interactive dictionary icon to the HUD.
   - *Mechanical*: Allows one re-listen per shift to replay spoken German nouns.
5. **Vocab Cards (€35)**:
   - *Visual*: Flashcard deck in student room.
   - *Mechanical*: -0.8s icon delay, +25% early-pick accuracy bonus.

---

## 7. Cast & Character Roles

- **Nico** (Student WG Flatmate): Chaotic student flatmate in `B_WG` who tests your recycling competence with yogurt pots and offers peppermint tea.
- **Frau Klein** (Local Pensioner): Meets you outside the locked University gates at 17:01 with a sack of potatoes, mocking German public-sector work hours.
- **Rita Schneider** (University Registrar): Formal, bureaucratic; tracks your €250 tuition deadline and stamps your Enrollment Certificate.
- **Klaus** (Kruma Shift 1 Instructor): Deadpan warehouse veteran who introduces you to the gendered warehouse shelves on Day 2 morning.
- **Nina Voss** (Kruma Dispatch Lead): Pragmatic warehouse manager who assigns shifts, tracks quotas, and manages equipment.
- **Mathias Becker** (Hansa Rad Bike Mechanic / Pizzeria Boss): Energetic Italian-German mechanic and restaurateur who repairs bikes and sells E-Bikes.
- **Martha Beck / Oma Martha** (Traditional Baker): Warm local baker who rewards proper formal German (*Sie*) and shares Hanseatic pastries.
- **Hans Lokker** (WG Sublet Landlord): Strict building manager monitoring quiet hours (*Ruhezeit*), waste separation (*Mülltrennung*), and €30 Kaution deposit.
- **Herr Vogel** (Rathaus Bürgeramt Bureaucrat): Peak *Amtsschimmel* who stamps residence registrations (*Meldebescheinigung*).
- **Frau Weber** (Sparkasse Bank Officer): Methodical banker who verifies your enrollment and unlocks your blocked student account (*Sperrkonto*).
- **Dr. Lindemann** (Ausländerbehörde Immigration Director): Stern Director who audits your 4-document dossier and stamps your Residence Permit (*Aufenthaltstitel*).

---

## 8. Narrative Architecture: Antonisse Paper Prototyping Framework (GDC 2014)

The narrative design is structured around **Jamie Antonisse's GDC Narrative Prototyping Principles**:

1. **The Player as the True Hero**: The narrative stakes are directly tied to player agency—immigrant survival, economic freedom, and mastery of a foreign language.
2. **The Mountain on the Horizon**: The €250 Semesterbeitrag goal, 28-day visa countdown, and 4-document dossier `[Uni 📜] [Lease 📄] [Anmeldung 📑] [Bank 💳]` remain persistently visible on the HUD, giving every shift high-stakes emotional weight.
3. **Strict Narrative Economy (Rule of 4 Story Functions)**: Every dialogue beat strictly serves one of four functions:
   - *Showcase the Goal* (Visa countdown & tuition pressure)
   - *Call to Action* (Immediate warehouse picking or courier dispatch)
   - *Direct Feedback* (Reactions to picking speed, grammar accuracy, and etiquette)
   - *Emotional Respite & Reward* (Warm doorstep banter, fresh Franzbrötchen, and debrief receipt satisfaction)
4. **Contextual Story Shifts**: Grocery packing shifts are grounded in community narratives (Oma Martha's emergency baking order, WG party supplies, Rathaus breakfast rush).

---

## 9. Progression Systems Beyond the Core Loop

Two systems ship on top of the shift loop and are frequently missed by older docs:

- **3-Branch Expat Skill Tree** (`src/data/skillTree.js`, surfaced in `src/ui/hud.js`):
  *The Courier Hustler* (speed, pick grace, VIP tips), *The Bureaucrat* (legal aid
  with AStA's Dr. Schmidt, exemptions) and *The Diplomat* (thrift, *Pfand* bonuses,
  *Stoßlüften* stamina). Funded by `skillPoints` earned through play.
- **Spaced-Repetition Vocabulary** (`SpacedRepetition` in `src/data/items.js`):
  a 4-box Leitner system that schedules which nouns reappear, so vocabulary
  genuinely consolidates across shifts rather than resetting.

---

## 10. Technical & Submission Compliance

- **Orientation**: Fixed Portrait (390×844 responsive scaling).
- **Runtime**: 100% Offline Single-File `index.html` (Concatenated via `build/assemble.js`).
- **Dependencies**: Three.js r128 (Inlined / local). Zero external network calls,
  verified in the DevTools Network tab: the document loads and nothing else.
- **Bundle Footprint**: see [`CANONICAL_NUMBERS.md`](CANONICAL_NUMBERS.md).

