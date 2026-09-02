# Devpost Official Submission Form Answers

> **Project Name**: Far From Home: Kruma Express  
> **Track**: Simulation & Management  
> **Special Award Nominations**: Most Innovative ($15K), Most Satisfying Progression ($15K)  
> **Repository / Zip**: `far-from-home-release.zip` (≤ 35 MB)

---

## 1. Elevator Pitch (Short Description)
*An atmospheric narrative management simulation where an international student in Lübeck conquers the 28-day German Bureaucracy Gauntlet (Uni Matriculation, Landlord Lease, Bürgeramt Registration, Sparkasse Blocked Account) by working fast courier shifts—featuring English-first accessibility, authentic German atmospheric audio, and deep character stories of immigrant solidarity.*

---

## 2. Inspiration
Moving to a foreign country alone is a whirlwind of paperwork, language anxiety, and financial pressure. We drew inspiration from authentic international student experiences (such as DW's *Nicos Weg*), combined with the cozy character depth of *Coffee Talk* and the tactile courier deliveries of *Messenger by Abeto*.

Grounded in narrative design principles from industry leaders (Jamie Antonisse, Andrew Walsh, Molly Maloney & Eric Stirpe), we transformed bureaucratic milestones into an emotionally resonant "Mountain on the Horizon" progression loop where every shift worked, every upgrade bought, and every neighbor befriended brings you one step closer to earning your permanent home.

---

## 3. What It Does & Core Gameplay
1. **The 4-Document Dossier Gauntlet**: Manage your 28-day visa countdown with persistent visual goals as you unlock the 4 essential legal milestones: `[📜 1. Uni Matriculation (€250)]`, `[📄 2. Landlord Confirmation (Hans Lokker)]`, `[📑 3. Rathaus Registration (Herr Vogel)]`, and `[💳 4. Sparkasse Blocked Account (Frau Weber)]`, culminating in permanent residency approval from Dr. Lindemann!
2. **Lübeck 3D Island Exploration**: Explore stepped-gable Altbau landmarks in a seamless fixed isometric diorama, interacting with a rich cast of residents who offer deep emotional backstories and life advice.
3. **English-First Warehouse Picking**: Pick grocery orders fast with crisp English titles, German subtitle lore, and three high-contrast arcade color shelves (Bottom Blue = Chilled, Middle Pink = Fresh, Top Purple = Bakery/Dry) with audio pronunciation cues.
4. **In-City Courier Navigation**: Ride your bicycle across medieval cobblestones, dodging pedestrians and construction to deliver hot groceries while managing cargo freshness.
5. **Doorstep Cultural Etiquette**: Complete contextual delivery hand-offs with local residents, navigating formal (*Sie*) vs. informal (*Du*) greetings and quiet hours (*Ruhezeit*) for generous tip multipliers.
6. **Student Room & Bike Upgrades**: Reinvest shift earnings into visible E-Bikes, Thermal Bags, Shelf Labels, and Vocab Notepads to observe tangible economic growth.

---

## 4. How We Built It (Tech Stack & Architecture)
- **Engine**: Three.js r128 (Vendored, zero external CDNs, 100% airgapped offline compliance).
- **Packaging**: Single `index.html` release build bundled via a custom build pipeline (3.6 MB uncompressed). Game source ships unminified and readable; vendored Three.js ships minified as distributed upstream.
- **Rendering**: Parametric procedural city generator, stepped-gable Altbau meshes, front-facing 2.5D picking shelves & diorama rooms, custom cel-shading light ramps, and a normal+depth Sobel edge ink outline shader.
- **Narrative Architecture**: English-first typewriter dialogue engine, multi-branching emotional conversation trees, character memory systems, and authentic studio voice sprites.

---

## 5. Challenges We Ran Into
- **Balancing Depth vs. Accessibility**: Ensuring judges can jump in and have fun within the first 15 seconds without language barriers, while still preserving rich German cultural flavor and emotional authenticity.
- **Strict 35 MB Airgap Budget**: Implementing rich 3D environments, voiced audio, procedural cel-shading, and deep dialogue trees within a lightweight 3.6 MB single-file build with zero external network calls. Even the Kenney colour atlas is inlined as a `data:` URI so the running game issues exactly one request: the document itself.

---

## 6. Accomplishments That We're Proud Of
- A truly satisfying progression loop: watching your persistent €20 ➔ €250 tuition meter fill up alongside your 4-document dossier stamps.
- Deep, heartfelt character storytelling that captures the real emotions of immigrant resilience and community warmth.
- Flawless single-thumb mobile portrait ergonomics (390×844) running at 60 FPS fully offline.
