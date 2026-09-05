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
│  - Dialogue Card: Bilingual German/English + 🔊 Audio preview      │
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
│  AUDIO & MICRO-NLP                                                 │
│  - Symbolic German Morphology Engine (grammarEngine.js)            │
│  - Pre-Baked Studio Character Audio & Web Audio SFX Engine         │
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

## 2. Character Roster & Behavioral Roles (*Nicos Weg* Inspired)

### Core Representative Cast & Story Representatives
1. **Nico (Student WG Flatmate - `B_WG`)**: Anxious, well-meaning flatmate who tests your recycling discipline with yogurt pots and offers peppermint tea.
2. **Frau Klein (Local Resident - `B_UNI` Steps)**: Dry pensioner with potatoes who mocks 90-minute German municipal office hours at 17:01.
3. **Rita Schneider (University Registrar - `B_UNI`)**: Bureaucratic registrar; demands proof of €250 *Semesterbeitrag* payment to issue the Enrollment Certificate (*Immatrikulationsbescheinigung*).
4. **Klaus (Kruma Shift 1 Instructor - `B_DARKSTORE`)**: Deadpan warehouse trainer who teaches the 3-gender shelf filter on Day 2 morning.
5. **Nina Voss (Warehouse Dispatcher - `B_DARKSTORE`)**: Pragmatic Kruma Express manager; assigns shifts, monitors packing quotas, tracks strikes, and unlocks shop gear upgrades.
6. **Mathias Becker (Mechanic & Pizzeria Boss - `B_PIZZA` / `B_BIKESHOP`)**: Immigrant restaurateur & bike mechanic who sells e-bike gear upgrades and orders kitchen ingredients.
7. **Martha Beck / Oma Martha (Master Baker - `B_BAKERY`)**: Teaches traditional German noun gender patterns (*-ung = die*), rewards polite formal etiquette (*Sie*), and shares local wisdom.
8. **Hans Lokker (Apartment Landlord & Caretaker - `B_SUBLET` / `B_WG`)**: Enforces house rules, quiet hours (*Ruhezeit*), waste sorting (*Mülltrennung*), and collects the €30 Kaution deposit for the student lease.
9. **Herr Vogel (Rathaus Bürgeramt Official - `B_RATHAUS`)**: Formal town hall bureaucrat; tests formal *Beamtendeutsch* and stamps your *Meldebescheinigung* (Address Registration).
10. **Frau Weber (Sparkasse Bank Officer - `B_BANK`)**: Methodical bank officer; verifies enrollment and *Anmeldung* to unlock your blocked student account (*Sperrkonto*).
11. **Dr. Lindemann (Ausländerbehörde Immigration Director - `B_AUSLAENDER`)**: The Final Milestone; verifies the 4-document dossier and stamps your permanent residence permit (*Aufenthaltstitel*).

### Residential Customers & Neighbors
- **Frau Meier (`B_WG` OG 1)**: The fierce *Ruhezeit* enforcer who shouts from the intercom if buzzed at the wrong hour.
- **Frau Marina, Emily, Herr Reinhard, Frau Schumaker, Otto, & Zimmerman**: Doorway delivery encounters testing conversational choices (*Du* vs. *Sie*, tipping etiquette).

---

## 3. Micro-AI & German Morphology Engine (`src/core/grammarEngine.js`)

A 100% offline, lightweight symbolic morphology system grounded in standard beginner grammar (*Basic German: A Grammar and Workbook* by Schenke/Seago & Goethe/telc A1):

### 3.1 Core A1 Grammar Rules Codified in Engine
1. **Gender & Articles (Units 1–3)**:
   - Definite (*der, die, das*) & Indefinite (*ein, eine, ein*).
   - Negative article (*kein, keine, kein*).
2. **Case System — Nominativ vs. Akkusativ vs. Dativ (Units 4, 19, 21)**:
   - **Nominative (Subject)**: *"Das Zimmer ist groß."*
   - **Accusative (Direct Object / Food / Packing)**: *"Ich brauche **den** Apfel / **einen** Kaffee / **die** Milch."* (Masculine *der $\rightarrow$ den / einen* change).
   - **Dative (Locations, Persons, Prepositions *mit, bei, nach, zu, aus*)**: *"Ich fahre mit **dem** Fahrrad zum **Rathaus**."*, *"Das Zimmer gefällt **mir**."*
3. **Verb Conjugation & Word Order (Units 5–8)**:
   - Regular (*kommen, wohnen, arbeiten, lernen*) & Irregular (*sein, haben, fahren, sprechen*).
   - **V2 Rule (Verb in Second Position)**: *"Heute **fahre** ich zur Bank."*
   - **Yes/No Questions (Verb First)**: *"**Haben** Sie das Formular?"*
   - **W-Questions (Question Word + Verb)**: *"Wo **ist** die Universität?"*, *"Wie viel **kostet** die Miete?"*
4. **Modal Verbs (Units 11–13)**:
   - *müssen* (must): *"Ich muss den Semesterbeitrag bezahlen."*
   - *können* (can): *"Können Sie mir helfen?"*
   - *möchten* (would like): *"Ich möchte den Mietvertrag unterschreiben."*
   - *dürfen* (allowed to): *"Hier darf man nicht rauchen."*
5. **Separable Verbs (Unit 9)**:
   - *ausfüllen* $\rightarrow$ *"Füllen Sie das Formular **aus**."*
   - *unterschreiben* $\rightarrow$ *"Hier müssen Sie **unterschreiben**."*
   - *anmelden* $\rightarrow$ *"Ich möchte mich **anmelden**."*
   - *freischalten* $\rightarrow$ *"Wir schalten das Sperrkonto **frei**."*
6. **Formal vs. Informal Register (Unit 2)**:
   - Polite / Official (*Sie / Ihnen / Ihr*): Used for Rita, Herr Vogel, Dr. Lindemann, Hans Lokker, and customers for +tips.
   - Informal / Student (*Du / Dir / Dein*): Used with Nico, Priya, and warehouse colleagues.

### 3.2 The Spatial Gender Shelf System
- 🔵 **Masculine (`der` ▲ - Bottom Shelf):** *der Apfel*, *der Käse*, *der Kaffee*, *der Kuchen*, *der Schinken*, *der Wein*
- 🔴 **Feminine (`die` ● - Middle Shelf):** *die Milch*, *die Banane*, *die Karotte*, *die Pizza*, *die Butter*, *die Dose*
- 🟣 **Neuter (`das` ■ - Top Shelf):** *das Brot*, *das Wasser*, *das Ei*, *das Brötchen*, *das Bier*, *das Fleisch*

---

## 4. A1 German Vocabulary & Kenney 3D Asset Mapping

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
