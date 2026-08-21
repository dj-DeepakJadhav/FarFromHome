# FAR FROM HOME: KRUMA EXPRESS — AI PLAYBOOK & HACKATHON WIN KIT
**Target Engine:** Pure Client-Side HTML5 / Three.js (r128+)  
**Game Title:** Far From Home: Kruma Express (Arbeit & Sprache)  
**Architectural Standard:** 100% Offline, Zero-CDN, Single Unminified `index.html` Build  
**Lineage:** Built upon the award-winning *Kruma* engine architecture.

---

## PART 1: AGENTIC AI ROLE DEFINITIONS & CODING PROTOCOLS

When prompting AI coding agents (Claude Code, Cursor, Codex, Windsurf, Ollama):
- **Role Persona:** Senior Three.js Game Architect & Optimization Specialist.
- **Core Directive:** Write clean, modular, self-contained JavaScript that executes entirely client-side without external dependencies.
- **Golden Rule:** Never insert CDN links (`cdnjs`, `unpkg`, `jsdelivr`). All external libraries must reside locally in `/vendor/`.
- **Packaging Rule:** Assemble all game code into a single unminified, human-readable `index.html` file at the root of the `.zip`.

---

## PART 2: REQUIRED SKILL SETS MATRIX FOR THE AI AGENT

| Technical Domain | Specific Skill & Execution Capability | Project Application in *Far From Home* |
| :--- | :--- | :--- |
| **Three.js Core (r128+)** | Isometric cameras, lighting setups, scene graphs, shadow maps, and Draco GLTFLoader. | Warehouse picking diorama and 3D grocery models. |
| **Custom GLSL Shaders** | Custom `ShaderMaterial` implementing cel-quantization, sobel screen ink, and tilt-shift blur. | Unifying free Quaternius/Poly Pizza assets into a graphic novel look. |
| **Object Pooling & Recycling** | Procedural mesh pooling and continuous position wrapping. | Top-down infinite 3-lane street scrolling without frame drops. |
| **Web Audio API** | AudioContext decoding, audio sprite offset slicing, low-pass filter biquad nodes. | Pre-baked Kokoro German voice lines and intercom telephone filter effects. |
| **Deterministic State Machine** | Finite state management without circular dependencies (`BOOT`, `PICK`, `RIDE`, `INTERCOM`, `SHOP`, `WIN`). | Shift transitions, score tracking, and clean session resets. |
| **Juice & Game Feel (VFX/SFX)** | Easing curves (parabolic drops, squash & stretch), canvas particle emitters, screen shake. | ASMR item bounce physics into grocery bag and pothole collision jolts. |

---

## PART 3: MASTER COPY-PASTE PROMPTS FOR AI CODING SESSIONS

### Prompt A: Engine Setup & Phase 1 Warehouse Station (Day 1)
```text
You are an expert Three.js game engineer building "Far From Home: Kruma Express", a mobile portrait simulation game (390x844 viewport).
CRITICAL RULES:
1. Bundle everything in a single, clean, unminified index.html.
2. Reference local Three.js via: <script src="vendor/three.min.js"></script>. Zero CDNs.
3. Language toggle: Support English UI as default with spoken German audio callouts, plus a German UI toggle.
4. Implement Phase 1 (Warehouse Picking Station):
   - Isometric Three.js camera (45 deg angle) viewing a 3-tier grocery shelf.
   - Apply a custom 3-band Cel ShaderMaterial to all 3D items with grammatical gender color borders (#3A86FF der, #FF006E die, #8338EC das).
   - Raycast touch picking: tapping an item triggers a smooth parabolic bounce into a 3D paper bag.
   - Immediate audio trigger via Web Audio API and 8-star green sparkle particle burst.
   - An active order ticket manifest with checkboxes that update on correct pick.
```

### Prompt B: 3-Lane Street Traversal & Road Signs (Day 2)
```text
Extend the Far From Home Three.js codebase with Phase 2 (STREET_RIDE):
1. Transition camera to top-down street perspective following an orange Kruma courier bicycle.
2. Implement a 3-lane modular road system using a recycled mesh pool (3 road tiles looping seamlessly).
3. The right lane is marked in green as "FAHRRADWEG" (bike lane) granting +30% travel speed.
4. Left/Right screen tap zones handle instantaneous responsive lane switching with bike tilt.
5. Road hazards: Cobblestones/potholes that trigger screen shake and reduce Bag Integrity (-15%).
6. Navigation junctions: Display blue German road signs ("Hauptstraße" = correct route; "Einbahnstraße" = 5s detour).
7. Top HUD displays a decaying "Freshness" meter that dictates doorstep tips.
```

### Prompt C: Intercom Buzzer & Offline Audio Sprite Pipeline (Day 3)
```text
Extend the Far From Home codebase with Phase 3 (INTERCOM_PUZZLE) and audio integration:
1. Audio Engine: Implement a self-contained Web Audio API sprite player loading local 'assets/audio/de_voices.ogg' with an inline timestamp dictionary.
2. Brass Intercom UI: Display an authentic 8-button intercom board with German floor codes (EG, 1. OG, 2. OG, HH).
3. Tapping the correct buzzer matching the delivery slip plays a door unlock chime and resident voice ("Tür ist auf!").
4. Doorstep Etiquette: Present 2 quick dialogue cards (Formal 'Sie' vs. Informal 'Du'). Correct formal greeting awards a +20€ VIP tip.
```

### Prompt D: 3-Shift Progression, Upgrade Shop & Win State (Day 4)
```text
Complete the Far From Home game loop across 3 escalating shifts:
1. Shift 1: Der Vormittag (Morning Training) -> Walk delivery -> 25€ earnings.
2. Intermission Shop: Bike Shop menu where player buys City Bicycle (45€) for +50% traversal speed.
3. Shift 2: Der Mittagsrush (Lunch Rush) -> Batched orders, dietary keywords -> 85€ earnings -> Buy Thermal Bag.
4. Shift 3: Der Nachtdienst (Night VIP) -> Rainy hospital rush, complex Hinterhaus intercom -> 150€ VIP tip.
5. Win Condition: When total wallet >= 250€, trigger the Victory Screen ("SEMESTERBEITRAG BEZAHLT!") with confetti and restart button.
```

---

## PART 4: OFFICIAL DESIGN-INTENT DOCUMENT (WORD .DOCX READY)
*(Strictly under 500 words, plain text, official 7-heading structure)*

```text
1. Game title and genre
Far From Home: Kruma Express - Simulation & Management

2. Target player and pitch
Designed for mobile players who love tactile, fast-paced management sims and emotional cultural stories. You play as an international student working as a dark-store grocery picker and bicycle courier in Germany, mastering survival German while racing shift timers to fund your university semester tuition fee.

3. How to play (controls)
The game is played in fixed portrait orientation with one-thumb touch controls. In the warehouse, tap 3D shelf items to pick and pack them into paper bags. On the road, tap left and right screen zones to steer your bicycle along bike lanes and navigate intersections. At delivery doors, tap the matching apartment buzzer nameplate and select a polite German etiquette farewell.

4. Core loop
The core loop consists of a repeating 3-phase shift cycle: Order Packing -> Street Traversal -> Intercom Delivery -> Gear Upgrade.
1. Packing: Read the bilingual order ticket and tap matching 3D shelf groceries while hearing native spoken German pronunciation and seeing gendered color tags (der/die/das).
2. Traversal: Steer your courier bike across city intersections following German road signs (Hauptstraße, Fahrradweg) before food temperature decays.
3. Delivery: Locate the target nameplate on an authentic German apartment buzzer plate and choose the appropriate greeting to secure tips.
The session goal is earning 250 Euros across three escalating shifts to pay your student semester fee. Instant tactile feedback includes cash register audio, item bounce physics, customer patience gauges, and grammar sparkle VFX. Inventory speed and accuracy directly fund bicycle and thermal bag upgrades.

5. What is in this prototype
- A fully playable 3-shift workday simulation (Morning Training, Lunch Rush, Night VIP).
- Interactive 3D dark-store picking station with 12 distinct low-poly grocery models.
- Top-down 3D bicycle street traversal with procedural German road signage and hazard dodging.
- Interactive apartment intercom buzzer puzzle with authentic German nameplates and floor codes.
- In-game upgrade shop with 3 unlockable equipment tiers (City Bicycle, Thermal Bag, Vocab Guide).
- High-quality offline pre-baked German voice acting for all grocery items and customer greetings.
- Comprehensive Win/Lose shift evaluation screen tracking shift revenue and vocabulary retention.

6. Progression and signature twist
Progression escalates across three shifts: Shift 1 features single basic grocery orders on foot; Shift 2 unlocks the bicycle and introduces multi-order batching under tight timers; Shift 3 introduces complex delivery locations (Hospitals/Altbau Hinterhaus) with formal German etiquette. The signature twist is Contextual Deduction Barista Mechanics: German language acquisition is woven directly into physical management puzzles rather than multiple-choice quizzes, where matching spoken gendered nouns to 3D objects directly dictates customer satisfaction and tip earnings.

7. Future-state vision
The full game will expand into a multi-city international student simulator across Tokyo, Paris, and Berlin, featuring expanded vehicle customization, dynamic apartment building interiors, and deeper social simulation mechanics.
```

---

## PART 5: MASTER BUILD LOG (BUILDLOG.MD)

```markdown
# Build Log: Far From Home: Kruma Express
Genre: Simulation & Management
Platform: Mobile Web (Fixed Portrait 390x844)

## Decisions Locked So Far
- Lineage: Architecture builds upon lessons from the winning Kruma prototype, refined for 100% offline mobile play.
- Architecture: Single-player, pure client-side HTML5/Three.js (r128). Zero network dependencies, zero CDNs.
- Packaging: Single .zip bundle (< 6 MB total, well below 35 MB budget) with index.html at root.
- Visuals: Low-poly European diorama aesthetic with a 3-band Berlin Graphic Novel cel-shader and grammatical gender color coding (#3A86FF der, #FF006E die, #8338EC das).
- Audio: Offline pre-baked Kokoro TTS German voice sprites (df_eva model) + Web Audio API synthesized SFX.
- Language Architecture: English UI default with spoken German audio triggers; German Immersion toggle.
- Game Loop: 3 Escalating Shifts (Morning -> Lunch Rush -> Night VIP) + Intermission Upgrade Shop. Goal: 250€ Semesterbeitrag.

## Session 1: Architecture Setup & 3D Warehouse Picking Station
- Tool(s): Ollama (qwen2.5-coder:7b), Cursor / Claude Code
- What was built: Set up HTML5 canvas with fixed 390x844 portrait aspect ratio and Three.js isometric camera. Implemented 3-tier shelf system with raycasting touch input, graphic novel cel shading, and packing animations.
- Key decisions: Bundled Three.js r128 locally into /vendor/three.min.js to ensure 100% offline compliance.
- Pivots: Switched manifest to English default with German spoken callouts to ensure zero onboarding friction for international judges.
- What changed after playtesting: Added instant parabolic bounce animation on item click with particle sparkle on match.
- Biggest problem & solution: AI initially inserted CDN script tags; replaced with local relative paths.
- Where things stand / Next: Warehouse picking loop works smoothly. Next: Street traversal module.

## Session 2: Bike Traversal, Intersection Navigation & Road Hazards
- Tool(s): Ollama (qwen2.5-coder:7b), Cursor
- What was built: Continuous top-down scrolling street grid with bike lane (Fahrradweg), cobblestone hazards, and intersection navigation with German road signs.
- Key decisions: Kept controls strictly binary (tap left/right zones) for comfortable one-thumb mobile play.
- What changed after playtesting: Added green tire streak trails and a speed multiplier when staying in the green bike lane.
- Where things stand / Next: Street traversal complete. Next: Intercom buzzer puzzle.

## Session 3: Altbau Intercom Buzzer Puzzle & Audio Pipeline
- Tool(s): Kokoro TTS (Python pipeline), Audacity, Cursor
- What was built: Interactive brass apartment buzzer UI with authentic German nameplates and floor abbreviations (EG, 1. OG, 2. OG, Hinterhaus). Integrated Kokoro German audio sprites.
- Key decisions: Voice lines pre-baked into a single compressed OGG file (48kbps) with start/duration timestamps.
- What changed after playtesting: Added instant audio buzzer feedback ("BZZZT" error vs. pleasant chime unlock).
- Where things stand / Next: All 3 gameplay phases functional. Next: Economy, upgrade shop, and 3-shift progression loop.

## Session 4: Upgrade Shop, Economy Balancing & End-Game Win State
- Tool(s): Cursor, Claude 3.5 Sonnet
- What was built: Intermission shop menu with 3 equipment upgrades (City Bicycle, Thermal Bag, German Vocab Guide). Shift summary screens and 250€ Semesterbeitrag win screen.
- Key decisions: Balanced wages and tips so that flawless Shift 1 & 2 play allows bike and thermal bag purchases, leading to a tense final Shift 3 hospital delivery.
- Where things stand / Next: Full core loop playable end-to-end. Next: Final bundle assembly, offline audit, and packaging.
```
