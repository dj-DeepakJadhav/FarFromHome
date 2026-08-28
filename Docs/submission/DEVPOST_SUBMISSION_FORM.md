# Devpost Official Submission Form Answers

> **Project Name**: Far From Home: Kruma Express  
> **Track**: Simulation & Management  
> **Special Award Nominations**: Most Innovative ($15K), Most Satisfying Progression ($15K)  
> **Repository / Zip**: `far-from-home-release.zip` (≤ 35 MB)

---

## 1. Elevator Pitch (Short Description)
*An atmospheric, 100% offline narrative management simulation where an international student in Lübeck pays off a €250 tuition deadline by working courier shifts—discovering that German grammar (`der/die/das`) is the spatial search filter that doubles picking speed and profits.*

---

## 2. Inspiration
Moving to a new country is a whirlwind of bureaucracy, language barriers, and financial pressure. We wanted to capture the authentic emotional journey of an international student arriving in Germany (inspired by DW's *Nicos Weg*) combined with the cozy character interactions of *Coffee Talk* and the tactile courier deliveries of *Messenger of Abeto*. 

Most educational games fail because they feel like tests. We wanted to make German language acquisition the player's greatest economic superpower.

---

## 3. What It Does & Core Gameplay
1. **Student Life Hub**: Manage your funds (€20 starting wallet) and work toward the €250 university matriculation fee.
2. **Lübeck 3D Island Exploration**: Discover stepped-gable Altbau landmarks, chat with university registrars, pizzeria owners, and bakers directly on the continuous isometric map.
3. **Audio Warehouse Picking**: Orders are called out in spoken German (*"die Milch!"*, *"der Apfel!"*). Shelves are partitioned into three color-coded gender tiers (Bottom Blue = *der* ▲, Middle Pink = *die* ●, Top Purple = *das* ■), collapsing search time by 66%.
4. **In-City Courier Navigation**: Ride your bicycle across cobblestones with the packed order, balancing travel time against cargo freshness to reach the customer's house pin.
5. **Doorstep Cultural Etiquette**: Engage in authentic, voiced German dialogue choices (*Du* vs. *Sie*, quiet hours) for customer tip bonuses.
6. **Bike Shop Management Engine**: Reinvest earnings into visible E-Bikes, Thermal Bags, Shelf Labels, and Vocab Notebooks to optimize future shifts.

---

## 4. How We Built It (Tech Stack & Architecture)
- **Engine**: Three.js r128 (Vendored, zero CDNs, 100% airgapped offline compliance).
- **Packaging**: Single unminified `index.html` release build bundled via custom build pipeline.
- **Rendering**: Parametric procedural city generator, stepped-gable Altbau meshes, front-facing 2.5D picking shelves & customer entrance dioramas, custom cel-shading light ramps, and a normal+depth Sobel edge ink outline shader.
- **Micro-NLP & Audio**: Authored symbolic German morphology engine (`grammarEngine.js`) guaranteeing 100% grammatically correct orders, coupled with lightweight studio-recorded character voice clips and interactive audio previews.

---

## 5. Challenges We Ran Into
- **Strict 35 MB Airgap Budget**: Stripping heavy textures and bloated neural models, replacing them with procedural shaders, parametric geometry, and symbolic grammar logic to achieve a lightweight ~5.7 MB uncompressed footprint (~1.8 MB zipped).
- **The 90-Second Pedagogical Rule**: Tuning the teach ➔ anticipate ➔ test audio delay curves so judges experience the "I understood German!" breakthrough within their first 90 seconds of play.

---

## 6. Accomplishments That We're Proud Of
- A truly original mechanic where language learning is not bolted on, but is the literal spatial search filter driving economic simulation efficiency.
- Flawless single-thumb mobile portrait ergonomics (390×844) running at 60 FPS fully offline.
- A heartfelt, culturally rich story of student resilience in Germany.
