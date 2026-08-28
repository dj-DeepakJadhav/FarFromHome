# Far From Home: Kruma Express — Design Intent Document
*Word Count: 433 words (Strict Limit: ≤ 500 words)*

## 1. Game Title and Genre
**Far From Home: Kruma Express** — Narrative Life & Courier Management Simulation (Fixed Portrait Mobile WebGL, 390×844).

## 2. Target Player and Pitch
Built for mobile and browser players who love tactile management simulations (*Good Pizza Great Pizza*, *Coffee Talk*) and atmospheric narrative games (*Messenger of Abeto*, DW's *Nicos Weg*). 

You play an international student who just arrived in the historic German city of Lübeck. With only **€20 in your pocket** and an impending **€250 university tuition (*Semesterbeitrag*) deadline**, you take up courier shifts for Kruma Express. As you navigate the 3D town, fulfill spoken German grocery orders, ride across cobblestone streets, and engage in doorstep etiquette, you realize the game's secret: **learning German grammar (*der/die/das*) is your greatest economic advantage to earn more money, upgrade your gear, and matriculate on time.**

## 3. How to Play & Core Controls
Designed for **single-thumb mobile portrait** touch and pointer play:
- **City Exploration & Delivery**: Tap to cycle smoothly through the 3D diorama of Lübeck. When a delivery is active, navigate across cobblestones to the customer's house pin before freshness decays.
- **Warehouse Packing**: Listen to spoken German orders (*"die Milch!"*, *"der Apfel!"*). Tap the corresponding shelf item before the timer expires.
- **Spatial Gender Filter**: The warehouse shelf features three tiers color-coded by grammatical gender: Bottom = Blue (*der* ▲), Middle = Pink (*die* ●), Top = Purple (*das* ■). Hearing the article instantly narrows your visual search by 66%.
- **Doorway Dialogue**: Engage in culturally authentic German dialogue (*Du* vs. *Sie*, polite greetings) to secure generous customer tips.
- **Bike Shop Upgrades**: Reinvest wages into visible E-Bikes, Thermal Bags, Shelf Labels, and Vocab Notebooks to optimize future runs.

## 4. Core Progression & Pedagogical Loop
Two growth curves run simultaneously:
1. **The Economic Curve**: Your wallet climbs from €20 to €250, unlocking visible courier upgrades and securing your university matriculation.
2. **The Linguistic Competence Curve**: Your brain internalizes German noun genders and everyday spoken phrases naturally. Picking an item before its visual icon resolves awards a **2.0× Early Pick Multiplier**.

## 5. Prototype Scope & Technical Feasibility
- 100% offline, zero-network runtime packaged as a single self-contained `index.html` (under 10MB uncompressed, ~2MB zipped).
- Rich 3D parametric city generation with stepped-gable Altbau architecture, custom normal+depth Sobel ink outlines, and hand-crafted diorama interiors.
- Built-in generative German morphology and rule engine providing endless, grammatically guaranteed grocery orders and character dialogue.
