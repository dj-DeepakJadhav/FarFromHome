# Devpost Official Submission Form Answers

> **Project Name**: Far From Home: Kruma Express  
> **Track**: Simulation & Management  
> **Special Award Nominations**: Most Innovative ($15K) — grammatical gender as a spatial search filter · Most Satisfying Progression ($15K) — €20 ➔ €250 across five visible upgrades  
> **Repository / Zip**: `far-from-home-release.zip` (≤ 35 MB)

---

## 1. Elevator Pitch (Short Description)
*A narrative management sim where an international student in Lübeck has 28 days, €20 and no paperwork. Work fast courier shifts to beat the German Bureaucracy Gauntlet — Matriculation, Lease, Anmeldung, Sperrkonto — in a warehouse filed by grammatical gender, because of course it is. British deadpan meets German municipal precision. 100% English-first.*

---

## 2. Inspiration
Moving to a foreign country alone is a whirlwind of paperwork, closed counters and financial pressure — and it is, in hindsight, extremely funny. We drew on real international-student experience, British deadpan comedy (*Peep Show*, *The Inbetweeners*), the cozy character depth of *Coffee Talk*, and the tactile courier deliveries of *Messenger by Abeto*.

We wanted one joke to carry the whole design: German nouns have arbitrary grammatical genders, so a German warehouse would naturally file its stock by them. Useless to a courier. Immovable. And, once you stop fighting it, a genuinely fast way to find things.

Grounded in narrative design principles from industry leaders (Jamie Antonisse, Andrew Walsh, Molly Maloney & Eric Stirpe), we transformed bureaucratic milestones into an emotionally resonant "Mountain on the Horizon" progression loop where every shift worked, every upgrade bought, and every neighbor befriended brings you one step closer to earning your permanent home.

---

## 3. What It Does & Core Gameplay
1. **The 4-Document Dossier Gauntlet**: Manage your 28-day visa countdown with persistent visual goals as you unlock the 4 essential legal milestones: `[📜 1. Uni Matriculation (€250)]`, `[📄 2. Landlord Confirmation (Hans Lokker)]`, `[📑 3. Rathaus Registration (Herr Vogel)]`, and `[💳 4. Sparkasse Blocked Account (Frau Weber)]`, culminating in permanent residency approval from Dr. Lindemann!
2. **Lübeck 3D Island Exploration**: Explore stepped-gable Altbau landmarks in a seamless fixed isometric diorama, interacting with a rich cast of residents who offer deep emotional backstories and life advice.
3. **The Absurd Filing System**: Pick grocery orders against the clock from a warehouse sorted by grammatical gender — Bottom Blue = der ▲, Middle Pink = die ●, Top Purple = das ■. Items are labelled English-first (`Milk (die Milch)`), so you never need a word of German: you read the item, you read the colour, you commit. Before each icon resolves the **gender rail pulses**; tapping that tier early pays a **2.0× Early Pick** bonus. It cuts the shelf you have to scan by two thirds — the gag is also the skill ceiling.
4. **In-City Courier Navigation**: Ride your bicycle across medieval cobblestones, dodging pedestrians and construction to deliver hot groceries while managing cargo freshness.
5. **Doorstep Etiquette**: Delivery hand-offs where formal (*Sie*) vs. informal (*Du*) and quiet hours (*Ruhezeit*) either land or misfire, moving your tip either way.
6. **Student Room & Bike Upgrades**: Reinvest earnings into five upgrades — E-Bike, Thermal Bag, Shelf Labels, Pocket Notepad, Shift Rota Cards — each of which changes a number *and* something you can see.

> **What this game is not**: it is not a language-learning game, and it makes no educational claim. Nothing asks you to recall, produce or translate German.

---

## 4. How We Built It (Tech Stack & Architecture)
- **Engine**: Three.js r128 (Vendored, zero external CDNs, 100% airgapped offline compliance).
- **Packaging**: Single `index.html` release build bundled via a custom build pipeline (11.1 MB uncompressed, limit 35 MB). Game source ships unminified and readable; vendored Three.js ships minified as distributed upstream.
- **Rendering**: Parametric procedural city generator, stepped-gable Altbau meshes, front-facing 2.5D picking shelves & diorama rooms, custom cel-shading light ramps, and a normal+depth Sobel edge ink outline shader.
- **Audio**: 100% procedural. No recorded assets ship at all — every sound is synthesised at runtime from oscillators, including per-character pitched talk-blips (*Animal Crossing* / *Celeste* style). The pick loop's anticipation cue is deliberately **visual**, so the core mechanic is fully playable muted in a noisy judging room.
- **Narrative Architecture**: English-first typewriter dialogue engine, multi-branching conversation trees, NPC memory that carries across shifts, and a deterministic offline German morphology engine (`grammarEngine.js`) so in-world signage and officialese read as real German rather than placeholder.

---

## 5. Challenges We Ran Into
- **Cutting the thing we were proud of**: this started life with a vocabulary system — spaced repetition, a dictionary, a quiz. It tested badly. It added cognitive load, it wasn't the fun part, and it meant we were pitching two games at once. We cut all of it, along with every audio claim we couldn't actually ship, and let the gender-filing shelf stand as a joke rather than a lesson. The build got smaller and the pitch got sharper.
- **Balancing Depth vs. Accessibility**: Ensuring judges can jump in and have fun within the first 15 seconds with zero language barrier, while keeping the German cultural flavour that makes the comedy land.
- **Strict 35 MB Airgap Budget**: Fitting rich 3D environments, procedural cel-shading and deep dialogue trees into a self-contained ~11 MB single-file build with zero external network calls. Even the Kenney colour atlas is inlined as a `data:` URI so the running game issues exactly one request: the document itself.

---

## 6. Accomplishments That We're Proud Of
- A genuinely satisfying progression loop: the €20 ➔ €250 tuition meter filling alongside your 4-document dossier stamps.
- A mechanic that is simultaneously the joke, the theme and the skill ceiling — arbitrary bureaucratic filing that turns out to be a search accelerator once you stop resisting it.
- Character writing that finds the comedy in the immigrant paperwork grind without losing the warmth underneath it.
- Single-thumb portrait ergonomics (390×844) at 60 FPS, fully offline, in a single ~11 MB `index.html` with zero network requests and zero recorded assets.
