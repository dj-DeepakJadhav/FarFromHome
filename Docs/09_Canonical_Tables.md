# Far From Home: Kruma Express — Canonical Tables

> **Authority statement.** This document is the single source of truth for the **economy, item list, meters, fail states, timings, and shift structure**. Where any other doc (01–07) states a number that conflicts with a number here, **this document wins** and the other doc should be edited to *reference* this one rather than restate the value.
>
> **Status: PROPOSED — needs sign-off.** Every figure below is a reviewer's resolution to a contradiction identified in `08_Design_Review.md`, not a decision already made by the designer. The structure is what matters most; individual values are tuning knobs. Items still needing an explicit decision are collected in §10.

---

## 1. What this resolves

| Fixes | From `08` |
| :--- | :--- |
| Unwinnable economy | B1 |
| Three incompatible economies | B2 |
| Item count 8 vs 12 | B3 |
| Session length 5–7 vs 15 min | B4 |
| Gender glyphs missing (accessibility) | G1 |
| Fail states undefined | G2, G3 |
| Shift 1 traversal / bike ambiguity | G4 |
| Dialogue scoring axes | G5 |
| Dietary items missing | G6 |
| Item naming drift | G7 |
| Language toggle / pause / Codex | G8, G9 |

---

## 2. Economy

### 2.1 Constants

| Constant | Value | Notes |
| :--- | :--- | :--- |
| `STARTING_WALLET` | **20,00 €** | The "starter cash" doc 01 §4.1 alludes to but never quantifies. Makes the 45€ bike affordable at Intermission 1. |
| `TUITION_GOAL` | **250,00 €** | Unchanged. The *Semesterbeitrag* is the emotional core; not a tuning knob. |
| `WIN_CONDITION` | `wallet >= 250` at end of Shift 3 | **Net wallet**, not gross earnings — preserves the shop's opportunity cost. |

### 2.2 Upgrade prices — unchanged from doc 01 §3

| Upgrade | Price | Stated effect | Shift-3 condition it unlocks (see §2.5) |
| :--- | :--- | :--- | :--- |
| City Bicycle | **45,00 €** | +50% street speed | Arrive inside the express window |
| Thermal Insulated Backpack | **60,00 €** | Halves temperature decay | Arrive at Freshness ≥ 70% |
| Pocket Vocab Guide | **35,00 €** | Gender tags permanently highlighted | Pack 4 items inside the 20 s timer |

Total gear cost: **140,00 €**.

### 2.3 Per-shift earnings ledger

Freshness and speed bonuses are **gear-gated**: the high value applies with the relevant upgrade owned, the floor value without.

**Shift 1 — Der Vormittag** (no gear obtainable yet)

| Line | Amount |
| :--- | ---: |
| Base wage | 22,00 |
| Accuracy bonus (3 items × 1,00) | 3,00 |
| Etiquette tip — scenario 4A | 3,00 |
| **Shift total** | **28,00** |

**Shift 2 — Der Mittagsrush** (bike owned)

| Line | With bike | Without bike |
| :--- | ---: | ---: |
| Base wage (2 orders × 27,50) | 55,00 | 55,00 |
| Accuracy bonus (6 items × 1,00) | 6,00 | 6,00 |
| Freshness bonus (Freshness % × 27,00) | 25,00 | 3,00 |
| Etiquette tip — scenario 4B | 8,00 | 8,00 |
| **Shift total** | **94,00** | 72,00 |

**Shift 3 — Der Nachtdienst** (all gear owned)

| Line | All gear | No gear |
| :--- | ---: | ---: |
| Base wage | 30,00 | 30,00 |
| Accuracy bonus (4 items × 2,00) | 8,00 | 8,00 |
| Etiquette tip — scenario 4C | 20,00 | 20,00 |
| Freshness bonus (Freshness % × 60,00) | 57,00 | 12,00 |
| Speed bonus (bike) | 25,00 | 0,00 |
| **VIP Express Bonus** (conditional, §2.5) | 122,50 | 0,00 |
| **Shift total** | **262,50** | 70,00 |

### 2.4 Canonical playthrough — verified arithmetic

| Step | Δ | Wallet |
| :--- | ---: | ---: |
| Start | +20,00 | **20,00** |
| Shift 1 earnings | +28,00 | **48,00** |
| Intermission 1 — buy City Bicycle | −45,00 | **3,00** |
| Shift 2 earnings | +94,00 | **97,00** |
| Intermission 2 — buy Thermal Backpack | −60,00 | **37,00** |
| Intermission 2 — buy Vocab Guide | −35,00 | **2,00** |
| Shift 3 earnings | +262,50 | **264,50** ✅ |

- Gross earned: 28,00 + 94,00 + 262,50 = **384,50 €**
- Cross-check: 20,00 + 384,50 − 140,00 = **264,50 €** ✓
- **264,50 € is doc 02's own stated final figure** — preserved exactly.
- The `,50` also explains itself: freshness bonuses are percentage-scaled, so non-integer totals are expected and doc 02's decimal was always correct.

> **doc 02 correction required:** its Intermission 2 figure of "165€" is superseded by **97,00 €**. That one number should be edited; "only 85€ away" becomes "153€ away".

### 2.5 The VIP Express Bonus makes all three upgrades load-bearing

The Shift 3 bonus is **all-or-nothing** and requires three simultaneous conditions — one per upgrade:

| Condition | Enabled by |
| :--- | :--- |
| 4 items packed inside the 20 s timer | Pocket Vocab Guide (no hunting for gender, no −3 s error penalties) |
| Arrival inside the express window | City Bicycle (+50% speed) |
| Arrival at Freshness ≥ 70% | Thermal Backpack (halved decay) |

Verified outcomes:

| Gear owned | Shift 3 total | Final wallet | Result |
| :--- | ---: | ---: | :--- |
| All three | 262,50 | **264,50** | ✅ **Win** |
| Thermal only | 115,00 | 174,00 | ❌ Loss |
| Bike only | 95,00 | 192,00 | ❌ Loss |
| None | 70,00 | 189,00 | ❌ Loss |

This is why doc 01 §4.1 instructs buying all three — the instruction is now mechanically correct rather than aspirational. It also gives the Shift 3 climax a real dramatic structure: the hospital VIP bonus is the whole game, and it is won or lost on three earlier decisions.

---

## 3. Item table — 12 items (resolves B3, G1, G6, G7)

Gender is signalled **three independent ways** — colour, glyph, and spoken audio — so no single channel is load-bearing. The glyph column is new and resolves the accessibility gap in G1.

| # | German | English | Gender | Glyph | Colour | Emoji | Tier |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| 1 | der Apfel | Apple | Maskulin | ▲ | `#3A86FF` | 🍎 | 1 Produce |
| 2 | der Käse | Cheese | Maskulin | ▲ | `#3A86FF` | 🧀 | 2 Dairy |
| 3 | der Kaffee | Coffee | Maskulin | ▲ | `#3A86FF` | ☕ | 3 Dry |
| 4 | der Tee | Tea | Maskulin | ▲ | `#3A86FF` | 🍵 | 3 Dry |
| 5 | die Milch | Milk | Feminin | ● | `#FF006E` | 🥛 | 2 Dairy |
| 6 | die Tomate | Tomato | Feminin | ● | `#FF006E` | 🍅 | 1 Produce |
| 7 | die Banane | Banana | Feminin | ● | `#FF006E` | 🍌 | 1 Produce |
| 8 | die Butter | Butter | Feminin | ● | `#FF006E` | 🧈 | 2 Dairy |
| 9 | das Brot | Bread | Neutrum | ■ | `#8338EC` | 🍞 | 3 Dry |
| 10 | das Ei | Egg | Neutrum | ■ | `#8338EC` | 🥚 | 2 Dairy |
| 11 | das Wasser | Water | Neutrum | ■ | `#8338EC` | 💧 | 3 Dry |
| 12 | das Müsli | Muesli | Neutrum | ■ | `#8338EC` | 🥣 | 3 Dry |

Glyph choice is deliberate: ▲ / ● / ■ are distinguishable by silhouette alone at small size, which matters because **`#3A86FF` (der) and `#8338EC` (das) are the pair most likely to converge** under the common colour-blindness types.

### 3.1 Dietary variants (resolves G6, G7)

Variants **inherit the gender, glyph and colour of their base item** — so they add vocabulary without adding a new grammar case to learn. This also settles the naming drift: the base noun is canonical, the variant is a labelled form of it.

| Variant | Base | Gender | Dietary tag | Used in |
| :--- | :--- | :--- | :--- | :--- |
| die Hafermilch | die Milch | Feminin ● | `vegan` | Shift 2 |
| die laktosefreie Milch | die Milch | Feminin ● | `laktosefrei` | Shift 2 (required by scenario 4B) |
| das Vollkornbrot | das Brot | Neutrum ■ | — | Shift 2 |
| das glutenfreie Brot | das Brot | Neutrum ■ | `glutenfrei` | Shift 2 |

Scenario 4B's customer asks whether the lactose-free milk is in the bag — that item now exists, and the *vegan / glutenfrei* keywords doc 01 §4.1 promises for Shift 2 now have products behind them.

---

## 4. Meters & fail states (resolves G2, G3)

| Meter | Start | Cap | Changed by | At zero |
| :--- | :--- | :--- | :--- | :--- |
| **Freshness** | 100% | 100% | Decays over ride time; halved rate with Thermal Backpack | Freshness bonus → 0, etiquette tip halved. Delivery still completes. |
| **Bag Integrity** | 100% | 120% | −15% per pothole; **perfect pack starts the ride at 120%** | Bag bursts → that delivery pays **0** (no wage, no tip). Shift continues. |

This resolves doc 01 §3's ambiguous "+20% Bag Integrity bonus": integrity starts at **100%** and a perfect pack grants a **120% buffer**, i.e. one free pothole.

### 4.1 Timer expiry

| Timer | On expiry |
| :--- | :--- |
| Shift 1/2 order timer | Order still completes; accuracy bonus forfeited |
| Shift 3 **20 s** express packing timer | Order downgraded to standard → **VIP Express Bonus forfeited** (§2.5) |

### 4.2 The only run-losing condition

**End of Shift 3 with `wallet < 250`** → *"Semesterbeitrag nicht bezahlt"* screen with a Retry button.

Nothing mid-run ends the run. This is deliberate: at a 5–7 minute session length, a hard-fail at minute 4 wastes the player's whole commute. Mistakes cost **money**, not the run — which keeps pressure on the economy where the drama actually lives. This also gives doc 06 Part 4 §5's promised "Win/**Lose** evaluation screen" a real definition.

---

## 5. Timings & session length (resolves B4)

**Canonical: the 3-shift arc is 5–7 minutes.** doc 01's header and doc 02 §3 are correct; doc 02's "FIRST 15 MINUTES" matrix headers are not.

### 5.1 Rescaled timeline for doc 02

| doc 02 column | Currently labelled | Should be |
| :--- | :--- | :--- |
| The Golden Hook | First 30 seconds | 0:00 – 0:30 ✓ unchanged |
| Morning Shift & First Upgrade | ~1–3 min | **0:30 – 2:00** |
| Lunch Rush & Flow State | ~3–8 min | **2:00 – 4:30** |
| Night VIP Climax & Victory | ~8–15 min | **4:30 – 6:30** |

The pacing-graph x-axis in doc 02 §2 needs the same rescale (and the graph itself is corrupted — see `08` ⚪).

### 5.2 Phase budgets

| Shift | Pack | Traverse | Doorstep | Intermission | Total |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1 | 0:30 | 0:20 | 0:25 | 0:15 | **1:30** |
| 2 | 0:50 | 0:55 | 0:35 | 0:20 | **2:40** |
| 3 | 0:20 | 1:10 | 0:40 | — | **2:10** |
| | | | | **Arc** | **6:20** |

---

## 6. Shift structure & bike ownership (resolves G4)

| Shift | Orders | Items | Traversal | Intercom | Etiquette |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 Der Vormittag | 1 | 3 (Apfel, Milch, Brot) | **Walk** — short scripted sidewalk segment | 4 buttons, all EG | 4A (register) |
| 2 Der Mittagsrush | 2 | 6, incl. ≥2 dietary variants | Bike, 3-lane, potholes + 1 junction | 8 buttons, EG/OG codes | 4B (attentiveness) |
| 3 Der Nachtdienst | 1 express | 4, 20 s timer | Bike, wet asphalt, 2 junctions | 8 buttons, HH + OG + L/R | 4C (register, VIP) |

### 6.1 Bike ownership — resolved

**Traversal always happens; the bicycle is a speed multiplier, not a gate.** doc 01's reading wins over doc 02's.

- **Shift 1** is a walking segment: the RIDE phase runs with lane-switching disabled and no hazards. It exists to teach the camera and the Freshness meter, nothing else.
- **Shift 2 onward** always uses the bicycle model. Without the City Bicycle upgrade the player rides a slower company bike — hence the "Without bike" column in §2.3 rather than a blocked path.

> **Consequence for doc 04's Stage 2 gate:** the bike-lane boost, potholes and junction signs **cannot be validated through Shift 1**. Stage 2 verification must load Shift 2 directly. This needs a debug shift-skip control (§8).

---

## 7. Dialogue scoring — two axes (resolves G5)

doc 05's three scenarios are not all testing the same thing. The scoring code needs to know which axis applies.

| Scenario | Shift | Axis | Correct answer | Tip |
| :--- | :--- | :--- | :--- | ---: |
| 4A Student peer | 1 | **Register** | Informal *Du* | 3,00 / 1,00 |
| 4B Busy mother | 2 | **Attentiveness** — did you register the lactose-free request? | Confirm the specific item | 8,00 / 0,00 |
| 4C Hospital doctor | 3 | **Register** | Formal *Sie* | 20,00 / 2,00 |

4B contains no *Sie*/*Du* marker in either option and never did — it is a listening test, and is better for it. Tip values are unchanged from doc 05 §5.

---

## 8. UI additions (resolves G3, G8, G9)

Not present in any doc 03 §4 mockup, and required:

| Element | Placement | Notes |
| :--- | :--- | :--- |
| **Bag Integrity meter** | Top HUD, beside Freshness | Currently a scored, damageable resource with no display at all |
| **Gender glyph** | On every manifest badge and shelf-item label | ▲ ● ■ per §3 — carries the accessibility claim |
| **Pause button** | Top-right, all gameplay phases | The game has running timers and no way to stop them |
| **Language toggle** | Inside pause + on boot screen | EN ↔ German Immersion, promised by every doc, homed by none |
| **Debug shift-skip** | Pause menu, dev builds only | Required to verify doc 04's Stage 2/3 gates without a full playthrough (§6.1) |

### 8.1 Wortschatz-Codex — MVP status decided

**In MVP, minimal form:** an end-of-run wrap-up list of the German terms encountered that session (12 base items + up to 4 variants + floor codes). doc 02 already shows it on the wrap-up screen, and doc 06 Part 4 §5 already promises vocabulary retention, so it ships.

**Out of MVP:** the illustrated diary, the 50+ term collection, and the permanent cross-run tip bonuses from doc 01 §4.2. Those are meta-progression and depend on persistence the MVP does not have.

---

## 9. Corrections required in other docs

| Doc | Change |
| :--- | :--- |
| 01 §4.1 | Replace the wage column with a reference to §2.3 here. Shift totals become 28 / 94 / 262,50. |
| 01 §3 | Note that "250€ total bank balance" means **net wallet**, per §2.1. |
| 01 §2, 02, 03, 04 | `9:16` → `~9:19.5` (390×844). |
| 02 §1 | Intermission 2 wallet 165€ → **97,00 €**; "only 85€ away" → "153€ away". |
| 02 §1–2 | Retitle "FIRST 15 MINUTES" and rescale the timeline per §5.1. Redraw the corrupted pacing graph. |
| 03 §2.1, 05 §2.2 | Add the glyph column and the dietary variants per §3. |
| 03 §4.1–4.3 | Add Bag Integrity meter, gender glyphs, pause button. Fix the mockup so a `Müller – HH 2. OG R` nameplate actually exists in the grid, with L/R markers. |
| 04 §1.2 | "8 low-poly items" → **12**. |
| 04 §2 | Note Stage 2/3 gates require a shift-skip; add EffectComposer to the vendor list *if* Shader Option B is kept. |
| 05 §5 | Label each scenario with its scoring axis per §7. |
| 06 Part 4 §6 | Delete "**Barista**" (copy-paste residue from another game). |
| 06 Part 4 §7 | Reconcile future cities with doc 01 §4.2 (Tokyo/Paris/Berlin vs Munich/Hamburg/Vienna). |
| 06 Part 5 | Rewrite the build log in future/planned tense until the work actually exists. |
| 07 | Item count 8 → 12; adopt §2 economy; add the vendor/UI items above. |

---

## 10. Still needs an explicit decision

These are genuinely yours to make — I have not assumed an answer.

1. **Berlin or Lübeck?** Docs 01/05 are Berlin-Kreuzberg with *Altbau* / *Hinterhaus*. Lübeck is Brick-Gothic with *Gang* / *Hof*. Changing city changes setting text, facade geometry, and intercom vocabulary. See `07` "Real-Town Level".
2. **Keep Shader Option B?** It is the specified Shift 3 rainy-night mood but requires vendoring EffectComposer + RenderPass + ShaderPass, which no doc currently budgets for (`08` T1). Dropping it means Shift 3 gets its atmosphere from lighting and palette only.
3. **One shop or two?** doc 02 has *Der Fahrradladen* then the *Späti*; docs 04/06 assume one generic intermission screen.
4. **Real German audio, or ship with `SpeechSynthesis`?** `07` assumption 3 — affects whether the Kokoro pipeline (`08` T4) is in scope at all.
5. **Are the §2.3 values tunable by me during balancing**, or fixed once signed off? The *structure* in §2.5 is the load-bearing part; the individual euro amounts are knobs that want playtesting.
