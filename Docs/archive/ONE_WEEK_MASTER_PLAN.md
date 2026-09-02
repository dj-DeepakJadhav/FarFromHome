# Far From Home: Kruma Express — 1-Week Master Execution Plan

> **Target Horizon:** 7 Days to Feature-Complete Release Candidate  
> **Buffer Window:** 5 Days reserved for external beta playtesting, bug hunting, and final submission packaging.  
> **Master Design Authority:** `Docs/README_HACKATHON.md`

---

## 📅 System Milestones & Bureaucratic Loop Implementation

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ Milestone 1: Bureaucracy State Machine & Paperwork Checklist HUD            │
 │ Milestone 2: Character Cast & Nicos Weg Dialogue Scenarios                 │
 │ Milestone 3: Dynamic City POIs (Hostel, Uni, Rathaus, Bank, Dark Store)     │
 │ Milestone 4: Economic Balance & Gear Upgrades (E-Bike, Thermal Bag)         │
 │ Milestone 5: Audio Warehouse Picking & 90-Second Pedagogical Ramp           │
 │ Milestone 6: Final Verification, Packaging & Submission Gate                │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🏛️ Milestone 1: Bureaucracy State Machine & Paperwork Checklist HUD
*Goal: Give the player a clear, realistic student immigration goal: 28 days to complete the 5 essential bureaucratic milestones.*

- [x] **Bureaucracy State Flags**: Codify `hasJob`, `hasApartment`, `isMatriculated`, `hasAnmeldung`, `isSperrkontoUnlocked`, `hasVisaExtended`.
- [x] **Collapsible Paperwork Checklist**: Renders on HUD showing active documents and next immediate destination.
- [x] **28-Day Entry Visa Countdown**: Replaces arbitrary day limits with a meaningful immigration countdown.

- [ ] **Prominent Goal HUD**: Add persistent top banner: `🎓 Tuition Goal: €20 / €250 | ⚠️ Strikes: 0/3`.
- [ ] **First-Shift Spatial Tutorial**:
  - In Shift 1, show a 3-second animated callout:  
    *🔵 Bottom Shelf (▲) = DER  |  🔴 Middle Shelf (●) = DIE  |  🟣 Top Shelf (■) = DAS*.
  - Pulse the tier shelf color matching the spoken article so the connection is instant.
- [ ] **Clear Directional Flow**:
  - Highlight the route from the student sublet to Nina's Dark Store with glowing ground pulse markers so judges never get lost in the city.

---

### 💰 Day 2: Economic Engine Polish & Visible Upgrade Impact
*Goal: Make the simulation & management loop deeply satisfying and tactile.*

- [ ] **Tangible Upgrade Visuals**:
  - **E-Bike Upgrade**: Adds speed lines, higher top speed, and smoother handling in Ride Phase.
  - **Thermal Bag**: Adds glowing insulated visual to the courier backpack and stops cobblestone decay.
  - **Shelf Color Labels**: Renders permanent bold German text labels (`der`, `die`, `das`) on warehouse shelf rails.
  - **Vocab Pocket Notepad**: Shows floating translation hints on the order ticket.
- [ ] **Juicy Cash Feedback**:
  - Coin collection particle bursts and crisp "ka-ching" audio SFX when cashing in shift payouts.
  - Celebratory debrief screen when hitting quota milestones.

---

### 🇩🇪 Day 3: Vocabulary Expansion & Pedagogical Tuning
*Goal: Deliver the 90-second "I understood German!" breakthrough moment.*

- [ ] **Expand Grocery Lexicon**:
  - Integrate additional food items from `A1_German_Game_Assets.md` across shifts (e.g. *der Kaffee*, *der Kuchen*, *die Pizza*, *das Wasser*, *das Brötchen*).
- [ ] **Tune the 90-Second Progression Curve**:
  - **Shift 1 (TEACH - 0.0s delay)**: Immediate audio + icon.
  - **Shift 2 (ANTICIPATE - 1.5s delay)**: Audio first; guessing by color tier pays 2.0× Early Bonus.
  - **Shift 3 (TEST - 2.5s delay)**: Pure audio recognition; unlocks the high-score mastery feeling.

---

### 🏘️ Day 4: City Narrative & Nicos Weg Quest Immersion
*Goal: Deepen the emotional student story and character relationships.*

- [ ] **Dynamic Dialogue Responses**:
  - Update Rita (University), Mathias (Pizzeria), Martha (Bakery), Nina (Warehouse), and Lokker (Sublet) to acknowledge your earned money, past deliveries, and courier reputation.
- [ ] **Cultural Etiquette Scenarios**:
  - Add realistic doorstep choices (*Sie* vs. *Du*, polite delivery handoffs, tip bonuses).
- [ ] **Exploration Polish**:
  - Add sprint/boost button for bicycle riding in city exploration.
  - Refine minimap with building icons (University, Dark Store, Pizzeria, Bakery).

---

### 🎨 Day 5: Visual, Audio, & Mobile Responsiveness Polish
*Goal: Achieve AAA-level mobile WebGL visual craft and audio reliability.*

- [ ] **Cel-Shader & Ink Outline Pass**:
  - Fine-tune Sobel ink edge detection and cel-shading light ramps for stepped-gable Altbau facades and interior dioramas.
- [ ] **Speech Synthesis Fallbacks**:
  - Ensure all German voice audio triggers cleanly offline without clipping or browser latency.
- [ ] **Performance Audit**:
  - Verify solid 60 FPS performance on mobile portrait viewports (390×844) with zero memory leaks.

---

### 🧪 Day 6: Automated Simulation Balance & Rigorous Playtesting
*Goal: Guarantee the game is perfectly balanced, fun, and free of blocking bugs.*

- [ ] **Economy Balance Pass**:
  - Verify that a standard skilled run reaches the €250 win condition in 4–6 shifts (approx. 5 minutes total playtime).
  - Ensure 3 strikes legitimately triggers the game-over screen with clear restart option.
- [ ] **Automated End-to-End Test Suite**:
  - Script simulated full-run passes (Boot ➔ Hub ➔ Shift ➔ Ride ➔ Shop ➔ Win) asserting zero uncaught exceptions in the console.

---

### 📦 Day 7: Final Release Candidate Build & Submission Gate
*Goal: Lock the submission artifact and prepare for judging.*

- [ ] **Single-File Release Compilation**:
  - Run `node build/assemble.js` to produce pristine unminified `index.html`.
  - Validate total bundle footprint remains under 35 MB (currently ~1.8 MB release zip).
- [ ] **100% Offline Airgap Verification**:
  - Test build in airplane mode / DevTools offline network mode.
- [ ] **Export Submission Artifacts**:
  - Generate `DESIGN_INTENT_DOC.docx` (≤ 500 words).
  - Lock repository for the 5-day beta playtesting and buffer period.
