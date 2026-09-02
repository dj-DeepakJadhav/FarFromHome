# ONE-PAGE GAME DESIGN DOCUMENT
# Far From Home: Kruma Express
*Authored in the Stone Librande One-Page Design Methodology (GDC) | Single-Page Master Reference*

![One-Page Master Game Design Document Poster](./ONE_PAGE_DESIGN_DOCUMENT.jpg)

```
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  HIGH CONCEPT:  A high-speed courier & German expat bureaucracy life-sim. Work shifts, sort groceries by color,
                 ride cobblestones, charm quirky locals, and conquer the 4-document dossier before your visa runs out.
  PLATFORM:      Mobile-First WebGL (390×844 Portrait) | PACKAGING: 100% Offline Single-File HTML5 (≤ 35 MB)
  CORE PILLARS:  ① 60-Second Addictive Loop   ② English-First / German-Voiced   ③ Invest ➔ Harvest ➔ Upgrade Economy
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
 │    │ Talk to voiced NPCs    │         │ Audio rhythm ramp      │         │ E-Bike turbo boost     │         │
 │    └────────────────────────┘         └────────────────────────┘         └────────────────────────┘         │
 │                ▲                                                                     │                      │
 │                │                                                                     ▼                      │
 │    ┌────────────────────────┐         ┌────────────────────────┐         ┌────────────────────────┐         │
 │    │ 6. GROW & FURNISH      │ <────── │ 5. DEBRIEF & UPGRADE   │ <────── │ 4. DOORWAY HANDOFF     │         │
 │    │ Unlock 4-Doc Dossier   │         │ Shift receipt payout   │         │ Voiced German dialogue │         │
 │    │ Furnish 3D Dorm Room   │         │ Buy bike/gear upgrades │         │ Sie vs Du etiquette tip│         │
 │    └────────────────────────┘         └────────────────────────┘         └────────────────────────┘         │
 │                                                                                                             │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. SIGNATURE MECHANIC: 3-TIER SPATIAL SEARCH ENGINE

The player sorts grocery manifests in real time. **Grammar gender (`der/die/das`) doubles as an intuitive 3-tier spatial filter**, cutting search time by 66%:

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │  TOP SHELF: PURPLE [■]       das Brot / das Wasser / das Ei             NEUTER  das       (+2.0x Early) │
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │  MIDDLE SHELF: PINK [●]      die Milch / die Banane / die Pizza         FEMININE die      (+2.0x Early) │
 ├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
 │  BOTTOM SHELF: BLUE [▲]      der Apfel / der Käse / der Kaffee          MASCULINE der     (+2.0x Early) │
 └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> Rows are sorted by **grammatical gender only**. Do not label them with food
> categories — milk would not sit in a "chilled" row, and the bottom row groups
> apple, cheese and coffee purely because all three are *der*.

### The 90-Second Audio Rhythm Ramp (Pacing Curve)
- **Shift 1 — TEACH (0.0s Delay)**: Audio + English icon appear together (`"Die Milch!"` + Pink shelf glows).
- **Shift 2 — ANTICIPATE (1.5s Delay)**: Audio plays *before* icon. Guessing the shelf tier earns **2.0× Early Bonus**.
- **Shift 3 — TEST (2.5s Delay)**: Pure audio recognition. Couriers pick by ear for maximum streak multipliers.

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
| **E-Bike Conversion** | €45 | **+50% Movement Speed** across city | Motor & battery pack mounted on bike |
| **Insulated Thermal Bag** | €50 | **Halves freshness decay** while riding | Bright orange Kruma branded backpack |
| **Shelf Labeling Kit** | €25 | **Item gender symbols (▲●■)** visible | Color markers on warehouse shelves |
| **Pocket Vocab Notebook** | €20 | **1 Re-listen audio replay** per shift | Open notebook on handlebars |
| **Vocab Cards** | €35 | **-0.8s icon delay, +25% early pick bonus** | Flashcards in student room |

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
 │  [SUBTITLE] "Guten Tag! Ein Kaffee?"   │  Contextual Bilingual Subtitle Bar
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
- **Audio Engine**: Pre-baked studio voice clips + deterministic Web Audio SFX synthesis.
- **Rendering**: Three.js r128 (vendored), Sobel edge outlines, baked shadows, 60 FPS mobile performance.

```
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 "A good one-page design document is a map of the entire game that anyone can read at a glance." — Stone Librande
═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
```
