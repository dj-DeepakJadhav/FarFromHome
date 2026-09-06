# Far From Home: Kruma Express — Technical & Systems Reference

> **Architecture Authority**: Plain ES6 + Three.js r128 (Vendored, zero CDNs, 100% offline).  
> **Viewport Constraint**: Fixed Portrait 390×844 responsive scale.  
> **Packaging Limit**: Single self-contained `index.html` ≤ 35 MB. Actual size: [`CANONICAL_NUMBERS.md`](CANONICAL_NUMBERS.md).

---

## 1. System Layer & State Machine

### 1.1 Architecture Layer Diagram
```text
┌────────────────────────────────────────────────────────────────────┐
│                 PORTRAIT VIEWPORT (390 × 844, locked)              │
├────────────────────────────────────────────────────────────────────┤
│  DOM UI LAYER  — #ui-container (Pointer-events passthrough)        │
│  - Persistent Header: Tuition (€20 / €250), Strikes (0/3)          │
│  - Warehouse Pick HUD: Time remaining, Der/Die/Das pulse rails     │
│  - In-City Delivery HUD: Freshness bar, Delivery destination pin   │
│  - Dialogue Card: English lines with German comedy flavour text    │
│  - Shift Debrief Receipt & Bike Shop Gear Catalog                  │
├────────────────────────────────────────────────────────────────────┤
│  THREE.JS SCENE RENDERING                                          │
│  - Lübeck 3D Altstadt Island (Continuous Isometric View)           │
│  - Warehouse Shelf Diorama (Front-Facing 2.5D, 3 gender tiers)     │
│  - Customer Doorway Entrance (Front-Facing 2.5D Diorama)           │
├────────────────────────────────────────────────────────────────────┤
│  POST-PROCESSING & SHADERS                                         │
│  - Cel-Shading Ramps & Normal+Depth Sobel Edge Ink Outlines        │
├────────────────────────────────────────────────────────────────────┤
│  SPATIAL ACCELERATION & NAVIGATION                                 │
│  - three-mesh-bvh (BVH Raycasting & Mesh Sliding Collision)        │
├────────────────────────────────────────────────────────────────────┤
│  PROCEDURAL AUDIO & MICRO-NLP                                      │
│  - Symbolic German Morphology Engine (grammarEngine.js)            │
│  - Web Audio SFX + per-character oscillator talk-blips (0 KB, no   │
│    recorded assets of any kind in the bundle)                      │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 Phase Flow
```text
BOOT ──► CITY_EXPLORATION ──► PICK ──► CITY_EXPLORATION (Delivery Active) ──► DIALOGUE ──► DEBRIEF_RECEIPT ──► SHOP ──┐
               ▲                                                                                                       │
               └───────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                 │
                       WIN (wallet ≥ €250) / LOSE (strikes ≥ 3)
```

---

## 2. Character Roster & Behavioral Roles

### Core Representative Cast & Story Representatives
1. **Nico (Student WG Flatmate - `B_WG`)**: Anxious, well-meaning flatmate who tests your recycling discipline with yogurt pots and offers peppermint tea.
2. **Frau Klein (Local Resident - `B_UNI` Steps)**: Dry pensioner with potatoes who mocks 90-minute German municipal office hours at 17:01.
3. **Rita Schneider (University Registrar - `B_UNI`)**: Bureaucratic registrar; demands proof of €250 *Semesterbeitrag* payment to issue the Enrollment Certificate (*Immatrikulationsbescheinigung*).
4. **Klaus (Kruma Shift 1 Instructor - `B_DARKSTORE`)**: Deadpan warehouse trainer who explains, entirely straight-faced, that an apple is a boy and a banana is a girl, and that the shelves are filed accordingly.
5. **Nina Voss (Warehouse Dispatcher - `B_DARKSTORE`)**: Pragmatic Kruma Express manager; assigns shifts, monitors packing quotas, tracks strikes, and unlocks shop gear upgrades.
6. **Mathias Becker (Mechanic & Pizzeria Boss - `B_PIZZA` / `B_BIKESHOP`)**: Immigrant restaurateur & bike mechanic who sells e-bike gear upgrades and orders kitchen ingredients.
7. **Martha Beck / Oma Martha (Master Baker - `B_BAKERY`)**: Rewards polite formal etiquette (*Sie*), grumbles about the shelf-filing regulations, and shares local wisdom.
8. **Hans Lokker (Apartment Landlord & Caretaker - `B_SUBLET` / `B_WG`)**: Enforces house rules, quiet hours (*Ruhezeit*), waste sorting (*Mülltrennung*), and collects the €30 Kaution deposit for the student lease.
9. **Herr Vogel (Rathaus Bürgeramt Official - `B_RATHAUS`)**: Formal town hall bureaucrat; tests formal *Beamtendeutsch* and stamps your *Meldebescheinigung* (Address Registration).
10. **Frau Weber (Sparkasse Bank Officer - `B_BANK`)**: Methodical bank officer; verifies enrollment and *Anmeldung* to unlock your blocked student account (*Sperrkonto*).
11. **Dr. Lindemann (Ausländerbehörde Immigration Director - `B_AUSLAENDER`)**: The Final Milestone; verifies the 4-document dossier and stamps your permanent residence permit (*Aufenthaltstitel*).

### Residential Customers & Neighbors
- **Frau Meier (`B_WG` OG 1)**: The fierce *Ruhezeit* enforcer who shouts from the intercom if buzzed at the wrong hour.
- **Frau Marina, Emily, Herr Reinhard, Frau Schumaker, Otto, & Zimmerman**: Doorway delivery encounters testing conversational choices (*Du* vs. *Sie*, tipping etiquette).

---

## 3. Micro-AI & German Morphology Engine (`src/core/grammarEngine.js`)

A 100% offline, lightweight symbolic morphology system. Its job is **comedy fidelity**,
not instruction: it lets dispatch notes, customer complaints and Beamtendeutsch forms
inflect themselves correctly so the bureaucracy sounds authentically, absurdly precise.
The player is never asked to know any of it.

### 3.1 Rules Codified in the Engine
1. **Gender & Articles**: definite (*der, die, das*), indefinite (*ein, eine, ein*), negative (*kein, keine, kein*).
2. **Case System**: nominative, accusative (*den Apfel / einen Kaffee*), dative (*mit dem Fahrrad*).
3. **Verb Conjugation & Word Order**: regular and irregular verbs, the V2 rule, yes/no questions (verb first), W-questions.
4. **Modal Verbs**: *müssen, können, möchten, dürfen* — the native tongue of a municipal office.
5. **Separable Verbs**: *ausfüllen, unterschreiben, anmelden, freischalten*.
6. **Register**: formal *Sie* for Rita, Herr Vogel, Dr. Lindemann and Hans Lokker; informal *Du* for Nico and warehouse colleagues. Getting the register wrong is a punchline and a tip modifier, never a test.

### 3.2 The Spatial Gender Shelf — The Joke, Not The Lesson
German nouns have arbitrary grammatical genders, so of course the warehouse is filed by
them. Items are labelled **English-first**; the player reads the shelf by **colour and
symbol** alone and never needs a word of German:

- 🔵 **Bottom tier — `der` ▲ — Blue `#3A86FF`**: Apple, Cheese, Coffee, Cake, Ham, Wine
- 🔴 **Middle tier — `die` ● — Pink `#FF006E`**: Milk, Banana, Carrot, Pizza, Butter, Can
- 🟣 **Top tier — `das` ■ — Purple `#8338EC`**: Bread, Water, Egg, Roll, Beer, Meat

The anticipation cue is **visual**: the gender rail pulses before the item icon resolves.
Tapping the correct tier inside that window pays the **2.0× Early Pick** bonus.
Ramp: Shift 1 = 0.0s · Shift 2 = 1.5s · Shift 3+ = 2.5s.

## 4. Item Catalogue & Kenney 3D Asset Mapping

> In-game the player sees the **English** name plus the tier colour/symbol. The German column is data used by the morphology engine for flavour text and by the shelf sorter — it is never something the player is quizzed on.

| ID | Article | German Noun | Plural | English | 3D Kenney Model Key | Tier / Shelf |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| `milch` | die | Milch | — | Milk | `food_carton` | Middle (Pink ●) |
| `apfel` | der | Apfel | Äpfel | Apple | `food_apple` | Bottom (Blue ▲) |
| `brot` | das | Brot | Brote | Bread | `food_bread` | Top (Purple ■) |
| `wasser` | das | Wasser | — | Water | `food_water` | Top (Purple ■) |
| `banane` | die | Banane | Bananen | Banana | `food_banana` | Middle (Pink ●) |
| `kaese` | der | Käse | — | Cheese | `food_cheese` | Bottom (Blue ▲) |
| `ei` | das | Ei | Eier | Egg | `food_egg` | Top (Purple ■) |
| `karotte` | die | Karotte | Karotten | Carrot | `food_carrot` | Middle (Pink ●) |
| `pizza` | die | Pizza | Pizzen | Pizza | `food_pizzabox` | Middle (Pink ●) |
| `wein` | der | Wein | — | Wine | `food_wine` | Bottom (Blue ▲) |
| `dose` | die | Dose | Dosen | Can | `food_can` | Middle (Pink ●) |

---

## 5. Build, Verification & Compliance Suite

- **Build Assembly Command**: `node build/assemble.js`
- **Size Verification**: `node build/check-size.js` (Must be ≤ 35 MB, target < 10 MB uncompressed).
- **Airgap Test**: DevTools ➔ Network ➔ Offline mode ➔ Ensure complete run functions with zero network requests.
