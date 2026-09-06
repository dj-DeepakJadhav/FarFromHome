# ONE-PAGE GAME DESIGN DOCUMENT
# Far From Home: Kruma Express
*Authored in the Stone Librande One-Page Design Methodology (GDC) | Single-Page Master Reference*

![One-Page Master Game Design Document Poster](./ONE_PAGE_DESIGN_DOCUMENT.jpg)

```
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  HIGH CONCEPT:  A narrative courier-management sim: British deadpan comedy colliding with German municipal precision.
                 Work shifts, file groceries by colour, ride cobblestones, endure quirky locals, and conquer the
                 4-document dossier before your visa runs out.
  PLATFORM:      Mobile-First WebGL (390×844 Portrait) | PACKAGING: 100% Offline Single-File HTML5 (≤ 35 MB)
  CORE PILLARS:  ① 60-Second Addictive Loop   ② British Deadpan vs. German Precision   ③ Invest ➔ Harvest ➔ Upgrade Economy
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
```

---

## 1. THE 60-SECOND CORE GAMEPLAY LOOP

```text
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                                             │
 │    ┌────────────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐         │
 │    │ 1. EXPLORE & CLOCK IN  │ ──────> │ 2. WAREHOUSE PICKING   │ ──────> │ 3. 3D COURIER RIDE     │         │
 │    │ Continuous 3D Altstadt │         │ Color-tier shelf sort  │         │ Steer bike on map      │         │
 │    │ Meet deadpan locals    │         │ Rail-pulse timing ramp │         │ E-Bike turbo boost     │         │
 │    └────────────────────────┘         └────────────────────────┘         └────────────────────────┘         │
 │                ▲                                                                     │                      │
 │                │                                                                     ▼                      │
 │    ┌────────────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐         │
 │    │ 6. GROW & FURNISH      │ <────── │ 5. DEBRIEF & UPGRADE   │ <────── │ 4. DOORWAY HANDOFF     │         │
 │    │ Unlock 4-Doc Dossier   │         │ Shift receipt payout   │         │ Beamtendeutsch banter  │         │
 │    │ Furnish 3D Dorm Room   │         │ Buy bike/gear upgrades │         │ Sie vs Du etiquette tip│         │
 │    └────────────────────────┘         └────────────────────────┘         └────────────────────────┘         │
 │                                                                                                             │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. SIGNATURE MECHANIC: 3-TIER SPATIAL SEARCH ENGINE

The player fills grocery manifests in real time. German nouns have arbitrary genders — so of course the warehouse is filed by them. **`der/die/das` doubles as a 3-tier spatial filter**, cutting search time by 66%. The player never needs a word of German: items are labelled **English-first** and the tiers are read by **colour and symbol**.

> Klaus sets the tone: *"An apple is a boy, a banana is a girl. Pick them right."*

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │  TOP SHELF: PURPLE [■]       das Brot / das Wasser / das Ei             NEUTER  das       (+2.0x Early) │
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │  MIDDLE SHELF: PINK [●]      die Milch / die Banane / die Pizza         FEMININE die      (+2.0x Early) │
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │  BOTTOM SHELF: BLUE [▲]      der Apfel / der Käse / der Kaffee          MASCULINE der     (+2.0x Early) │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> Rows are filed by **grammatical gender only** — a joke about German filing, not a
> lesson. Do not label them with food categories: milk would not sit in a "chilled"
> row, and the bottom row groups apple, cheese and coffee purely because all three
> are *der*.

### The 90-Second Rail-Pulse Ramp (Pacing Curve)
The anticipation cue is **visual**: the gender rail pulses before the item icon resolves.
- **Shift 1 (0.0s Delay)**: Rail pulse and icon land together — the pink rail glows as the Milk icon appears.
- **Shift 2 (1.5s Delay)**: The rail pulses *before* the icon. Tapping the right tier in that window earns the **2.0× Early Pick Bonus**.
- **Shift 3+ (2.5s Delay)**: Pure pattern recognition on the pulse alone, for maximum streak multipliers.

---

## 3. ECONOMIC ENGINE: €20 ➔ €250 TUITION GAUNTLET

```
  [START: €20] ──> [Courier Shifts: +€15-45] ──> [Bike Shop: Upgrades] ──> [Save €250] ──> [WIN: University Paid]
```

### Shift Payout Formula
$$\text{Total Payout} = \text{Base Wage (€15)} + (\text{Speed Streak} \times 2.0) + \text{Doorstep Tip (€3–€15)} - \text{Damage Deductions}$$

### Equipment Upgrades (Mathias' Hansa Rad Bike Shop)
| Upgrade Item | Cost | Gameplay Effect | Visual 3D Impact |
| :--- | :---: | :--- | :--- |
| **E-Bike Conversion** | €45 | **-40% transit time** across city | Motor & battery pack mounted on bike |
| **Insulated Thermal Bag** | €50 | **Halves freshness decay** while riding | Bright orange Kruma branded backpack |
| **Shelf Labeling Kit** | €25 | **Stamps the tier symbol (▲●■)** on every item | Colour markers on warehouse shelves |
| **Pocket Notepad** | €20 | **1 free rail re-pulse** per shift | Open notepad on handlebars |
| **Shift Rota Cards** | €35 | **-0.8s icon delay, +25% early pick bonus** | Rota cards pinned in student room |

---

## 4. THE 4-DOCUMENT DOSSIER (BUREAUCRACY VICTORY PATH)

| Step | Milestone Document | Official NPC & Location | Required Condition |
| :--- | :--- | :--- | :--- |
| **1** | **Immatrikulation** (Enrollment) | Rita Schneider *(Universität)* | Pay **€250 Semesterbeitrag** |
| **2** | **Wohnungsgeberbestätigung** (Lease) | Hans Lokker *(WG Dorm)* | Pay **€30 Kaution downpayment** + Obey *Ruhezeit* |
| **3** | **Meldebescheinigung** (Address Reg.) | Herr Vogel *(Bürgeramt)* | Present signed lease & pass formal *Sie* dialogue |
| **4** | **Sperrkonto Freigabe** (Bank Unlocked) | Frau Weber *(Sparkasse)* | Present Address Reg. + Matriculation Certificate |
| 🏆 | **AUFENTHALTSTITEL (Residence Permit)** | Dr. Lindemann *(Ausländerbehörde)* | **Deliver 4-doc dossier before Day 28 visa deadline!** |

---

## 5. ONE-THUMB MOBILE INTERFACE LAYOUT (390 × 844 Portrait)

```text
 ┌────────────────────────────────────────┐ ── 0px
 │ [HUD] Day 1/28 | 💶 €20 | 📜 Docs: 0/4 │  Upper HUD: Vital status & dossier tracker
 ├────────────────────────────────────────┤ ── 70px
 │                                        │
 │        3D ISOMETRIC DIORAMA            │
 │     • Historic Lübeck Altstadt         │  Primary Game View:
 │     • Warehouse Interior / Shelves     │  Three.js Canvas with stepped-gable buildings,
 │     • 2.5D Doorstep Customer Handoff   │  ambient weather, dynamic lighting & ink outline
 │                                        │
 ├────────────────────────────────────────┤ ── 640px
 │  [DIALOGUE] "NEIN! Ruhezeit!"          │  Contextual Dialogue Bar (Beamtendeutsch comedy flavour)
 ├────────────────────────────────────────┤ ── 710px
 │  [ ACTION / INTERACTION / DOCK AREA ]  │  Thumb Action Zone (Bottom 25%):
 │   [BLUE: Der ▲] [PINK: Die ●] [PUR: Das ■]  Large touch-target buttons (min 48px),
 │   or [Steer D-Pad / Dialogue Responses] │  single-hand thumb reachable.
 └────────────────────────────────────────┘ ── 844px
```

---

## 6. TECHNICAL & AIRGAP CONSTRAINTS (MHCP Hard Rules)

- **Zero External Requests**: 100% offline airgap. No CDNs, no remote fonts, no remote audio.
- **Single-File Deliverable**: Builds via `node build/assemble.js` to a self-contained root `index.html`.
- **Bundle Size**: ≤ 35 MB budget. Actual size: see [`CANONICAL_NUMBERS.md`](CANONICAL_NUMBERS.md).
- **Audio Engine**: 100% runtime synthesis. No recorded audio ships — every sound is built from Web Audio oscillators: SFX plus pitched per-character talk-blips (`src/audio/speech.js`).
- **Rendering**: Three.js r128 (vendored), Sobel edge outlines, baked shadows, 60 FPS mobile performance.

```
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 "A good one-page design document is a map of the entire game that anyone can read at a glance." — Stone Librande
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
```
