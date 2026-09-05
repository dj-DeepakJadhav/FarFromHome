# ACT I — British Comedy & Shadow-of-Mordor NPC Memory Edition

> **Status**: DRAFT FOR REVIEW & APPROVAL  
> **Location**: `Docs/ACT_ONE_BRITISH_COMEDY.md`  
> **Master Game Design Authority**: `Docs/README_HACKATHON.md` & `Docs/ACT_ONE.md`  
> **Tone**: Everyday, relatable British deadpan comedy (*Peep Show*, *Inbetweeners*, *Hitchhiker's Guide*) meets unyielding German municipal bureaucracy. Simple vocabulary, instant laughs, zero highbrow pretension.

---

## 1. Core Design Pillars

### A. The Comedic Dynamic (British Understatement vs German Precision)
- **The World**: Germany is clean, hyper-punctual, rule-bound, and completely literal.
- **The Protagonist**: Polite, slightly bewildered, broke, exhausted, muttering dry complaints about walking, weather, tiny architecture, and tea deprivation.
- **Visual Meta-Jokes**: The game world itself is playfully roasted (the bus stop looks like an ATM, the river looks like it was ironed, the NPCs walk in right angles).
- **The Vocabulary Rule**: **No dictionary/IELTS words.** Dumbed-down, snappy, funny dialogue that anyone playing on mobile gets instantly in 2 seconds.

### B. Shadow-of-Mordor NPC Memory System
Every named NPC tracks an emotional state and **remembers your previous actions**:
```javascript
window.FFH.npcMemory = {
  nico: { trust: 0, trashDisaster: false, teaOwed: false, lastComment: null },
  frauKlein: { metAtUni: false, respectsPunctuality: false },
  herrBecker: { noiseStrikes: 0, paperworkInspected: false },
  martha: { boughtPretzel: false, gaveCashExact: false },
  klaus: { shiftsDone: 0, eggDropped: false, speedRating: 'average' }
};
```
- If you sort trash wrong with Nico, next time you see him in the kitchen, he covers his coffee mug: *"Careful! Don't throw that spoon in the paper bin, you menace!"*
- If you pay Oma Martha with exact cash coins, she smiles: *"Ah, the boy with real coins. Not like those phone-tapping heathens."*
- If you speak to Frau Klein again after being late to the University, she teases: *"Look, it’s Mr. 17:01! Still looking for government workers after teatime?"*

### C. The Day-to-Night Environmental Engine
The lighting and city audio dynamically reflect the ticking clock of Day 1:
1. **15:00 (Bright Afternoon)**: Crisp sunlight, blue sky, sharp shadows. Bus station arrival.
2. **16:45 (Golden Hour / Sunset)**: Sky shifts warm amber-orange, directional light turns gold, long dramatic shadows across cobblestones as you rush to the University.
3. **17:15 (Dusk)**: Purple-blue gradient in the sky, chill Baltic breeze SFX increases.
4. **19:00 (Night Mode)**: Midnight blue sky, ambient light drops to 0.25, street lamps cast circular golden pools on the streets, house windows glow warm yellow.
5. **07:00 (Day 2 Dawn)**: Fresh morning mist, bright yellow sun, church bells ring. Shift 1 begins!

### D. Canonical Economy Integration (No Magic Numbers)
- **Starting Wallet**: Exactly **€20.00**
- **Tuition Target**: Exactly **€250.00** (due in 28 days canonical visa / 6 days semester deadline)
- **Daily Hostel/WG Rent**: **€8.00** / day (or €30 Kaution downpayment)
- **Pfand Recycling Collectibles**: **+€0.25** per returned bottle (max 4-6 scattered in town on Day 1, total boost ~€1.00 - €1.50)
- **Accurate Shift Payout**: **+€2.50** per clean item pick, **2.0×** early pick multiplier.

### E. UI & Visual Feedback Effects Specification
All UI interactions utilize the existing engine's visual animation grammar:
1. **Thought Bubble Animation (`game.ui.spawnWandererThought`)**:
   - Projected dynamically from courier head position in 3D to 2D screen coordinates.
   - Dark glass translucent background (`rgba(18, 24, 38, 0.92)`), backdrop blur 8px.
   - Distinctive warm amber border (`2px solid #FFD166`), rounded 16px.
   - Smooth entrance: `translate(-50%, -120%) scale(1.0)` with cubic bezier ease-out.
   - Auto-fade after 3.5s.
2. **Pulsing Reveal Animations (`triggerFirstObjectiveReveal` & HUD elements)**:
   - Elements start at `opacity: 0, transform: translateY(-10px) scale(0.95)`.
   - On activation: keyframe pulse glow (0 to 1 to 0 box-shadow highlight in `#2EC4B6` or `#E76F51`), settling at steady state.
3. **Collectible Pfand Bottle Visuals & Effects**:
   - 3D Model: Low-poly glass cylinder (green/amber) floating at `y: 0.25` above ground.
   - Idle Animation: Continuous slow rotation around Y-axis (`rotY += delta * 1.5`) + gentle bobbing (`y = 0.25 + Math.sin(time * 3) * 0.05`).
   - Ground Highlight: Pulsing golden ring (`THREE.RingGeometry`, color `#FFD166`, pulsing opacity `0.4 - 0.85`).
   - Pickup Trigger: Player radius <= 1.2m.
   - Pickup FX: Cash register / coin chime SFX (`game.sfx.playSfx('register')`), floating popup text `+0.25€ Pfand!` (green `#4CAF50`), and brief sparkle scale-down.
4. **Day-to-Night Atmosphere Transitions (`updateAtmosphericTime`)**:
   - Driven smoothly using existing `cityExplorationPhase.updateAtmosphericTime(progress)` without reloading the scene.

---

## 2. Step-by-Step Implementation Checklist

Track progress item by item. We only proceed to the next after verifying the current:

- [x] **Step 1: The Station Arrival & Visual Roast (Scene 1)**
  - [x] Retain existing camera pan and spawn position at station (`B_ZOB` / North Gate).
  - [x] Add initial British thought bubble roasting the tiny bus shelter.
  - [x] Add inspect interaction on the bus stop plaque ("No buses in Altstadt, walk").
  - [x] Trigger existing compass pulse pointing South to `B_WG`.
- [x] **Step 2: Collectible Pfand Bottles in Town**
  - [x] Spawn 5 low-poly bottles at fixed safe road coordinates.
  - [x] Add rotation, bobbing, and glowing ground circle effect.
  - [x] Add proximity pickup (+€0.25, cash SFX, thought bubble).
- [x] **Step 3: Cobblestone Walk & Environmental Roast (Scene 2)**
  - [x] Update ambient wanderer thought triggers (ironed flat river, robotic blocky NPCs).
  - [x] Test branching alley vs canal route.
- [x] **Step 4: WG Doorbell 3-Button Buzzer (Scene 3)**
  - [x] Modal at `B_WG` door (Frau Meier Ruhezeit vs Schmidt vs Nico).
  - [x] Shadow-of-Mordor noise strike memory for Frau Meier.
- [x] **Step 5: Nico & The Mülltrennung Minigame (Scene 4)**
  - [x] Enter WG kitchen diorama.
  - [x] Simple 3-button trash sorting (Yellow vs Blue vs Black).
  - [x] Update `npcMemory.nico` (trust +2 vs trash disaster).
- [x] **Step 6: The Tuition Warning Letter (Scene 5)**
  - [x] Letter on desk highlighting €250 due and €20.25 in pocket.
  - [x] Objective update: Rush to University before 17:00.
- [x] **Step 7: Golden Hour Transition (Scene 6)**
  - [x] Time progression to 16:45 (warm amber lighting, long shadows).
- [x] **Step 8: Locked University & Frau Klein (Scenes 7 & 8)**
  - [x] Closed door notice at `B_UNI` (closed at 17:00).
  - [x] Encounter Frau Klein with potatoes (teasing about German public sector hours).
- [x] **Step 9: Night Walk & Kruma Flyer (Scene 9)**
  - [x] Time progression to 19:00 (street lamps on, dark blue sky).
  - [x] Kruma delivery flyer on lamp post.
- [x] **Step 10: Bedtime Sleep Screen & Shift 1 Hook (Scene 10)**
  - [x] Humorous job rejections at Pizzeria (no Italian) & Bakery (B1 certificate).
  - [x] Day 1 Summary modal (Wallet, Goal, Days Left, Rejections count).
  - [x] Transition to Day 2 morning dawn and Klaus at Kruma.

---

## 3. The 10 Interactive Story Beats (Act 1 Walkthrough)

```
[Arrival Bus Stop: 15:00] ➔ [Cobblestone Walk] ➔ [WG Doorbell] ➔ [Nico's Trash Test]
        │
        ▼
[Letter on Table: €250 Due] ➔ [Rush to Uni: 16:45 Golden Hour] ➔ [Uni Locked: 17:01]
        │
        ▼
[Frau Klein Interaction] ➔ [Night Street Walk: 19:00] ➔ [WG Bedtime Recap]
        │
        ▼
[Day 2 Morning: 07:00 Kruma Warehouse & Shift 1]
```

---

### Scene 1: Arrival & The Miniature Bus Shelter
* **Time / Weather**: 15:00 | Clear Day, Bright Sunlight (`dirLight: 0xffffff, 0.9`).
* **Location**: Bus Drop-off (`LM_ALTSTADT` North Gate).
* **Visual Gag**: The bus stop shelter model is comically smaller than the towering brick houses next to it.
* **Camera**: Smooth pan down from high isometric diorama to close third-person follow.
* **Thought Bubble**:
  > *"So this is Germany. Clean. Tidy. And possessing a bus shelter roughly the size of a microwave. If I try to stand under that, my knees will stick out into oncoming traffic."*
* **Inspect Interaction (The Bus Timetable)**:
  > *"Sign says: 'No buses permitted in town center. Pedestrians only.' Brilliant. Welcome to Germany, mate. Grab your 25kg suitcase and start marching."*
* **First UI Pulse**: Compass slides in from top right, pointing South toward `B_WG`.

---

### Scene 2: The Cobblestones & The Ironed River (Branching Choice)
* **Time**: 15:20 | Afternoon Sun.
* **Visual Gag**: The river water is an unmoving flat plane; the low-poly NPCs walk in sharp, robotic 90-degree corners.
* **Thought Bubble**:
  > *"Look at this river. It’s so flat it looks like someone ironed it with heavy starch. And everyone walks like toy soldiers. Don't make eye contact, they'll ask for my ID."*
* **Branching Walk Choice (Floating Buttons near player)**:
  - `[ Take the Short Alley ]` ➔ *Stumbles on cobblestone. Body -5. Thought: "Cobblestones. Nature's way of destroying ankles."*
  - `[ Walk Along the Canal ]` ➔ *Longer scenic walk. Body -6. Finds an empty beer bottle on a stone bench!*
* **Bottle Interaction (Pfand Discovery)**:
  - *Collect Pfand bottle*: *"Wait... there's a little recycle symbol on this. In England this is rubbish, here it's 25 cents! I'm practically an investor."*
  - **Wallet**: `€20.00 ➔ €20.25` *(Tiny positive audio ding)*.

---

### Scene 3: The WG Buzzer Board (Dorm Entrance)
* **Time**: 15:45 | Late Afternoon.
* **Location**: `B_WG` Doorway.
* **UI**: Clean 3-button modal popup.
* **Protagonist Thought**:
  > *"Right, which button is Nico's? Let's not wake up the whole building."*
* **Player Choices**:
  1. `[ Button 1: Frau Meier (OG 1) ]` ➔ *Loud scratchy intercom: "NEIN! Ruhezeit!" (Memory: Frau Meier noise strike +1).*
  2. `[ Button 2: Hausmeister Schmidt ]` ➔ *Intercom clicks, heavy sigh, hangs up.*
  3. `[ Button 3: WG 3B (Nico) ]` ➔ *Buzzes violently! Heavy oak latch clicks open.*

---

### Scene 4: Nico & The Yogurt Pot Bomb (Mülltrennung Minigame)
* **Location**: Inside WG Kitchen diorama.
* **Character**: Nico (standing stiffly, holding a plastic yogurt pot with tin foil lid).
* **Dialogue**:
  > **Nico**: *"Stop! Don't move your feet! Before you put your bag down, tell me: where does this yogurt pot go?!"*  
  > **Player**: *"In the bin, mate?"*  
  > **Nico (Whispering in terror)**: *"Which bin?! If you put plastic in the paper bin, Herr Becker the landlord will personally throw our clothes into the street! Look!"*
* **Super-Simple 3-Button Mini-Game**:
  Screen displays the 3 colored bins:
  - `[ Blue Bin (Paper) ]`
  - `[ Yellow Bin (Gelber Sack - Plastic/Foil) ]`
  - `[ Black Bin (Restmüll - Leftovers) ]`
* **Branching Memory Reaction**:
  - *Player picks Yellow Bin*:  
    ➔ **Nico sighs with massive relief**: *"Brilliant! You're a legend. Dump your stuff on that sofa. Watch out for the metal spring, it bites."*  
    ➔ `npcMemory.nico.trust += 2;`
  - *Player picks Blue or Black Bin*:  
    ➔ **Nico screams in a whisper**: *"NO! Are you mad?! Yellow sack!"* Snatches it from your hand.  
    ➔ `npcMemory.nico.trashDisaster = true;` *(He will bring this up later!)*

---

### Scene 5: The Letter on the Desk (The Threat)
* **Location**: Student WG Desk.
* **Item**: Stamped official envelope on the desk.
* **Inspection Text**:
  ```
  -----------------------------------------------
       HOCHSCHULE LÜBECK — ENROLLMENT DEPT
  -----------------------------------------------
  Tuition Deposit Due:         €250.00
  Deadline:                    Friday, 17:00
  Current Wallet:              €20.25
  Consequence of non-payment:  Immediate cancellation
  -----------------------------------------------
  ```
* **Protagonist Thought**:
  > *"Two hundred and fifty quid?! I've got twenty euros and a used yogurt lid. I need to run to the University office right now before they rip up my visa."*
* **Objective Updates**: `Sprint to University Campus before 17:00!`

---

### Scene 6: The Golden Hour Rush (16:45 Lighting Shift)
* **Visual Weather Transition**:
  - Sky transitions from pale blue to vibrant amber-gold.
  - Directional sunlight angle drops low (`dirLight.position.set(25, 8, 15)`).
  - Amber sunlight bounces off brick facades; long shadows stretch across the square.
* **Protagonist Thought**:
  > *"The sun is going down. It looks dead pretty, to be fair. Still completely broke, but at least the scenery is lovely."*
* **Player Movement**: Walking South-East across the canal bridge toward the campus.

---

### Scene 7: The Locked Door (17:01)
* **Time**: Exactly 17:01.
* **Location**: `B_UNI` (University Main Hall).
* **Visual**: Heavy oak double doors locked with an enormous brass chain and padlock.
* **Sign on Door**:
  > *"Öffnungszeiten: Di & Do 10:00 - 11:30. Freitags geschlossen."*
* **Protagonist Thought**:
  > *"Open Tuesday and Thursday from 10:00 to 11:30?! That’s a ninety-minute work week! What do they do the rest of the time, polish their stamps?!"*

---

### Scene 8: Frau Klein with the Potatoes (NPC Encounter)
* **Location**: Outside the University steps.
* **Character**: Frau Klein (elderly local in a green coat carrying a canvas bag of potatoes).
* **Branching Dialogue**:
  > **Frau Klein**: *"Looking for the enrollment office, young man?"*  
  > **Player Choice A**: `[ "Can I just knock? I'm only one minute late!" ]`  
  > **Player Choice B**: `[ "Do they ever work more than 90 minutes a week?!" ]`
* **Frau Klein's Response**:
  > **Frau Klein (Chuckling dryly)**: *"Haha! Liebling, this is Germany. At 16:59:59, the pen leaves the hand. At 17:01, the secretary is already on her sofa drinking herbal tea. If you bang on that door now, the police will come with a decibel meter. Come back tomorrow."*  
  > `npcMemory.frauKlein.metAtUni = true;`

---

### Scene 9: Night Walk & The Kruma Flyer (19:00 Night Mode)
* **Visual Weather Transition**:
  - Ambient light dims to dark navy blue (`0x1a2634`).
  - Cobblestone street lamps switch on with glowing warm circles.
  - Windows in town houses illuminate with cozy orange light.
* **Location**: Lamp post near the town square.
* **Visual Item**: A neon yellow flyer taped to the street lamp.
* **Inspection**:
  > *"KRUMA EXPRESS — 10-Minute Grocery Delivery. Immediate cash payouts! Riders wanted. Bring your own bicycle (or rent our rusty one). Shift starts 07:00 AM."*
* **Protagonist Thought**:
  > *"Delivery rider? Well, I know how to pedal, and I know how to panic. That’s tomorrow sorted."*

---

### Scene 10: Day 1 Bedtime Recap & Economy Screen
* **Location**: Back in the WG room.
* **Interaction with Nico**:
  - **If Nico trust was high (Trash solved correctly)**:
    > **Nico**: *"No luck at Uni? Don't worry, mate. I made peppermint tea. Drink up, Kruma shifts are brutal on the knees."*
  - **If Nico had trash disaster**:
    > **Nico**: *"Look who's back. Just remember: tea bags go in the organic bin. Don't touch anything until morning."*
* **Bedtime Interaction**: Tapping the sofa bed triggers the Day 1 Finish Screen:
  ```
  =============================================
                 DAY 1 CONCLUDED
  =============================================
  Time:                         22:00 (Ruhezeit)
  Wallet Balance:               €20.25
  Tuition Target:               €250.00 (Due in 6 Days)
  Offices Successfully Visited: 0
  Trash Correctly Sorted:       1
  Decibel Violations:           1 (Frau Meier)
  ---------------------------------------------
  Energy:                       Recharging...
  ---------------------------------------------
           [ TAP TO SLEEP UNTIL 06:30 ]
  =============================================
  ```
* **Transition to Day 2 (Shift 1 Hook)**:
  Screen fades to black. Rooster / clock alarm SFX. Sun rises with morning light. Player walks into Kruma Darkstore to meet **Klaus**:
  > **Klaus**: *"Guten Morgen. In this warehouse, words have genders. An apple is a boy: DER Apfel. A banana is a girl: DIE Banane. Pick them right, you get paid. Let's see what you've got."*  
  ➔ **Launches directly into Shift 1 (The core game picking loop)!**

---

## 3. Implementation Blueprint (Code Architecture)

1. **`src/data/npcMemory.js`**:
   - Central state object tracking NPC relationships, trust points, and player choices.
2. **`src/render/sceneSetup.js`**:
   - Add `window.FFH.setLightingPhase(phaseName)`:
     - `'afternoon'`: dirLight white (0xffffff), ambient 0.65.
     - `'golden_hour'`: dirLight warm amber (0xffa255), low sun angle, ambient 0.5.
     - `'night'`: dirLight off/moon blue (0x223355), ambient 0.2, streetlamp pointlights ON.
3. **`src/ui/hud.js`**:
   - Add `window.FFH.showDayRecapModal(dayNumber, stats)` modal for the end-of-day sleep cycle.
4. **`src/data/dialogue.js` & `src/data/prologueQuests.js`**:
   - Wire the humorous scripts, thought bubbles, and 3-choice micro-minigames directly.
