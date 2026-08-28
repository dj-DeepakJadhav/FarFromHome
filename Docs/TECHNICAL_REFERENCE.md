# Far From Home: Kruma Express — Technical & Systems Reference

> **Architecture Authority**: Plain ES6 + Three.js r128 (Vendored, zero CDNs, 100% offline).  
> **Viewport Constraint**: Fixed Portrait 390×844 responsive scale.  
> **Packaging Limit**: Single self-contained `index.html` ≤ 35 MB (Release build ~1.8 MB zipped).

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

## 2. Character Roster & Behavioral Roles

### Core Diorama Cast
1. **Rita Schneider (University Registrar - `B_UNI`)**: Tracks €250 matriculation fee; issues official Student ID upon victory.
2. **Mathias Rossi (Pizzeria Owner - `B_PIZZA`)**: Immigrant restaurateur who orders fresh cheeses and rewards fast couriers with food tips.
3. **Martha Becker (Master Baker - `B_BAKERY`)**: Teaches traditional German bakery terms and rewards polite formal etiquette (*Sie*).
4. **Nina Kowalski (Warehouse Dispatcher - `B_DARKSTORE`)**: Assigns shifts, monitors quota accuracy, tracks strikes, and unlocks shop gear upgrades.
5. **Herr Lokker (Sublet Landlord - `B_SUBLET`)**: Enforces house rules, quiet hours (*Ruhezeit*), and student residence registration.

### Residential Customers
- **Frau Marina, Emily, Herr Reinhard, Frau Schumaker, Otto, & Zimmerman**: Doorway delivery encounters testing conversational choices (*Du* vs. *Sie*, tipping etiquette).

---

## 3. Micro-AI & German Morphology Engine (`src/core/grammarEngine.js`)

A 100% offline, lightweight symbolic morphology system providing pedagogically accurate German orders:
- **Spatial Shelf Filter**:
  - 🔵 **Masculine (`der` ▲ - Bottom Shelf):** *der Apfel*, *der Käse*, *der Kaffee*, *der Kuchen*
  - 🔴 **Feminine (`die` ● - Middle Shelf):** *die Milch*, *die Banane*, *die Karotte*, *die Pizza*
  - 🟣 **Neuter (`das` ■ - Top Shelf):** *das Brot*, *das Wasser*, *das Ei*, *das Brötchen*
- **Slot Grammar**: Dynamically constructs valid phrases (*"Zwei Äpfel und eine Milch, bitte"*, *"Ich brauche frischen Käse"*).
- **Audio-First Reveal Delay**:
  - Shift 1 (TEACH): 0.0s delay (Immediate audio + icon).
  - Shift 2 (ANTICIPATE): 1.5s delay (Audio first; 2.0× Early Bonus for spatial guess).
  - Shift 3+ (TEST): 2.5s delay (Pure audio recognition).

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
