# Far From Home: Kruma Express (Arbeit & Sprache)
## MASTER GAME DESIGN DOCUMENT (GDD)
**Genre:** Systemic Simulation & Management (Subgenre: Dark-Store Logistics, Economic Engine & Immigrant Cultural Sim)  
**Platform:** Mobile Web Browser (Fixed Portrait 9:16 / 390x844 px, One-Thumb Touch)  
**Target Session Length:** 5–7 Minutes (3-Shift Workday Arc, 15-Minute Complete Transformation)  
**Language Modes:** English Default (English UI + Spoken German Environmental Audio) | German Immersion Mode Toggle  
**Lineage:** Built upon the award-winning *Kruma* engine architecture, refined for 100% offline client-side deterministic performance.

---

### 1. CONCEPT & NARRATIVE PREMISE
**Far From Home: Kruma Express** is an emotional, tactile systemic simulation and management game capturing the lived experience of an international university student working as a dark-store grocery fulfillment picker and bicycle courier in contemporary Berlin. Facing an urgent deadline to pay their 250€ university semester registration fee (*Semesterbeitrag*), the player must master three escalating delivery shifts across a single workday.

The gameplay fuses physical warehouse micro-management, tactical route traversal, and doorstep etiquette with **Systemic Economic Management & Language Immersion**:
- **Bilingual Accessibility (Pillar 1):** The game defaults to English UI (manifest, HUD, buttons, debrief receipts) with authentic spoken German voice callouts. Spoken German audio plays ~1.5s before visual icons, giving players an efficiency shortcut to move early and bank streak multipliers.
- **The Room is the Progress Bar (Pillar 2):** Money is not an abstract high score. Wages and tips buy physical furnishings, room comforts, and a pet companion for the student room (`createLevel0Room`), visibly transforming it from a cold, empty sublet into a warm sanctuary.
- **One Core Verb Across Contexts (Pillar 3):** *Hear/Read $\rightarrow$ Identify $\rightarrow$ Tap / Route* powers Dark Store picking, transit route selection, and intercom buzzer matching.
- **Systemic Loops & Experiential Debriefing (Pillar 4):** Every shift runs a structured Kolb learning cycle: Briefing $\rightarrow$ Shift Activity $\rightarrow$ Itemized Settlement Receipt $\rightarrow$ Room/Gear Reinvestment.

---

### 2. CORE LOOP & 3-TIER SYSTEM DESIGN

```text
+-----------------------------------------------------------------------------+
| TERTIARY / META LOOP (Session Arc: 5-7 mins)                                |
| Overarching Survival Goal: Pay 250€ Semesterbeitrag | Student Room Metagame |
+-----------------------------------------------------------------------------+
       │ Reinvests Into                                  ▲ Wages & Room Items
       ▼                                                 │
+-----------------------------------------------------------------------------+
| SECONDARY / MACRO LOOP (Shift Arc: 1-2 mins)                                |
| Briefing -> Pick Shift -> Route Transit -> Intercom Drop -> Debriefing/Shop |
+-----------------------------------------------------------------------------+
       │ Drives                                          ▲ Shift Multipliers
       ▼                                                 │
+-----------------------------------------------------------------------------+
| PRIMARY / MICRO LOOP (Second-to-Second: 1-5s)                               |
| Audio Callout -> Shelf Search -> Tap/Pack -> Route Dodge -> Buzzer Etiquette|
+-----------------------------------------------------------------------------+
```

#### Detailed Phase Breakdown:
1. **Phase 1: Briefing & Warehouse Fulfillment (Order Packing)**
   - *Action:* Read incoming order ticket (e.g., `[☐ 1x Oat Milk (die Hafermilch) 🥛]`) and tap 3D shelf groceries matching the spoken audio and visual icon.
   - *Tactile Juice:* Bouncy squash-and-stretch item physics, acoustic cardboard *thud*, sparkle particle burst, and native German voice clips. Correct picks bank a streak multiplier (+0.25x per streak).
2. **Phase 2: Tactical Route Traversal (Bicycle Courier)**
   - *Action:* Steer courier bicycle across tactical route cards balancing speed vs. risk:
     - **Smooth Fahrradweg (Bike Lane):** High speed, 0% cargo damage, requires clear path.
     - **Kurzer Weg (Cobblestone Shortcut):** Shorter distance but shakes fragile cargo (e.g. glass bottles/eggs) risking deductions.
   - *Variables:* Freshness timer decay vs. Cargo Fragility vs. Road Surface.
3. **Phase 3: Intercom Buzzer & Doorstep Etiquette**
   - *Action:* Read delivery ticket (e.g., *"Schmidt - EG"* or *"Müller - HH 3. OG"*) and tap matching brass nameplates on an Altbau facade.
   - *Dialogue Etiquette:* Select appropriate spoken farewell (Formal *Sie* for hospital doctors/seniors vs. Friendly *Du* for students) to maximize tips (*Trinkgeld*).
4. **Phase 4: Post-Shift Debriefing Receipt (Experiential Reflection)**
   - *Action:* View transparent, itemized gig-app settlement receipt:
     - Gross Base Wage: `+22.00€`
     - Streak/Accuracy Bonus: `+6.00€`
     - Doorstep Etiquette Tip: `+4.00€`
     - Broken Item / Freshness Penalty: `-2.00€`
     - **Net Payout:** `+30.00€`
5. **Phase 5: Intermission Shop & Room Upgrades (Reinvestment)**
   - *Action:* Reinvest net earnings into competing categories:
     - **Courier Tools:** City Bicycle (45€), Thermal Backpack (60€), Pocket Vocab Guide (35€).
     - **Room Comforts & Buffs:** Desk Lamp (+1s timer buffer), Cozy Rug (+morale), Adopt Cube Cat (+15% tip generosity).

---

### 3. THE 12 SIMULATION ELEMENTS (RIIS-DUKE FRAMEWORK)

| Element | FFH Implementation in Kruma Express |
| :--- | :--- |
| **1. Model** | Deterministic logistics and economic model (picking timers, decay rates, tip formulas). |
| **2. Scenarios** | 3 contextual shifts: Morning Training, Lunch Rush, Rainy Night Hospital VIP. |
| **3. Pulse / Events** | Sudden environmental & operational shocks: urgent express timers, wet asphalt rain slicks, complex Hinterhaus buzzers. |
| **4. Game Process** | Briefing $\rightarrow$ Fulfillment $\rightarrow$ Transit $\rightarrow$ Intercom $\rightarrow$ Debrief Receipt $\rightarrow$ Room Shop. |
| **5. Game Periods** | 3 escalating shifts forming a complete single workday. |
| **6. Roles** | International Student Courier (navigating language, survival, and academic fees). |
| **7. Procedures** | Standard picking and delivery SOPs: Hear $\rightarrow$ Pick $\rightarrow$ Route $\rightarrow$ Buzz $\rightarrow$ Greet. |
| **8. Decisions** | Meaningful trade-offs: Fast rough road vs Safe bike lane; Formal vs Informal greeting; Reinvesting in courier gear vs Room comfort items. |
| **9. Result Statement** | Transparent itemized post-shift settlement receipt detailing all bonuses and deductions. |
| **10. Indicators** | Real-time gauges: Freshness Decay Bar, Bag Integrity Meter, Live Streak Multiplier, Tuition Progress Meter (`XX€ / 250€`). |
| **11. Symbols** | High-contrast visual markers: Gender Glyphs (▲ Blue *der*, ● Coral *die*, ■ Purple *das*), Euro signs, Intercom codes (`EG, OG, HH, VH`). |
| **12. Materials** | Low-poly Kenney 3D assets, cardboard packing slots, brass buzzer panels, cozy student room furnishings. |

---

### 4. PROGRESSION & VISIBLE GROWTH (THE 15-MINUTE TRANSFORMATION)

#### 4.1 Minute 1 vs Minute 15 Visible Contrast
| Feature Dimension | **Minute 1 (Shift 1 Start)** | **Minute 15 (Shift 3 Win State)** |
| :--- | :--- | :--- |
| **The Student Room** | Bare mattress on floor, single unshaded bulb, empty instant noodle cup, grey walls. | Cozy wooden bed, warm brass desk lamp, patterned rug, potted plant, sleeping companion cat (*Minka*), celebration holiday garland. |
| **Courier Equipment** | On foot / worn shoes, torn brown paper bag, no weather gear. | High-speed orange City Bicycle, insulated yellow Thermal Backpack, rain poncho. |
| **Language Fluency** | Hesitant, waiting 1.5s for visual English icons to translate spoken German. | Instant audio recognition (*"Hafermilch! Apfelsaft!"*), banking 2.0x max streak multipliers. |
| **Economic Status** | 20€ starting pocket money, constant threat of student visa expiration. | **250€ Semesterbeitrag stamped "BEZAHLT" (PAID)**, university enrollment certificate unlocked! |

#### 4.2 Single-Session 3-Shift Escalation Arc
| Shift Stage | Theme & Narrative Context | Gameplay & Systemic Complexity | Target Economic Ledger |
| :--- | :--- | :--- | :--- |
| **Shift 1: Morning Training (*Der Vormittag*)** | Sunny sidewalk; nervous first day on the job. | 1 order (3 basic items). Low timer pressure. Walking delivery. Simple 4-button ground floor buzzer (`Schmidt - EG`). Friendly student neighbor. | Wage: 22€ + Acc: 3€ + Tip: 3€ = **28€**. Total Wallet: **48€**. Buy City Bicycle (45€). |
| **Shift 2: Lunch Rush (*Der Mittagsrush*)** | Bustling downtown traffic; speed and batching. | 2 batched orders (6 items). Dietary terms (*vegan, laktosefrei*). Rapid freshness decay. Tactical route trade-offs. 8-button intercom with floor codes (`1. OG, 2. OG`). | Wage: 40€ + Acc: 6€ + Tip: 8€ = **54€**. Total Wallet: **57€**. Buy Thermal Backpack or Room Lamp + Vocab Guide. |
| **Shift 3: Night VIP (*Der Nachtdienst*)** | Rainy night hospital boulevard; high-stakes climax. | 4-item express order under 20s timer. Wet asphalt hazards. Multi-courtyard buzzer (`Müller - HH 3. OG`). Formal doctor VIP etiquette (*Sie*). | Wage: 60€ + Acc: 12€ + VIP Tip: 20€ = **92€**. Total Wallet: **264.50€** $\rightarrow$ **Victory State!** |

---

### 5. WHAT MAKES IT FUN & COMPELLING
- **Tactile ASMR Feedback:** Cardboard clunks, satisfying squash-and-stretch item drops, and cash register chimes provide constant positive micro-rewards.
- **The Power of "Cozy" Simulation:** Tension during shifts gives way to relaxing, heartwarming satisfaction when decorating the student room and watching it come alive.
- **Grounded Empathy & Triumph:** The struggle to pay tuition and learn a language turns abstract game mechanics into an authentic, deeply resonant human journey.
