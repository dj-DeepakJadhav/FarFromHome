# Far From Home: Kruma Express — Design Intent Document

## 1. Game Title and Genre
**Far From Home: Kruma Express** — Narrative Life & Courier Management Simulation (Fixed Portrait Mobile WebGL, 390×844).

## 2. Target Player and Pitch
Built for mobile and browser players who love tactile management simulations (*Good Pizza Great Pizza*, *Coffee Talk*) and atmospheric narrative games (*Messenger of Abeto*, DW's *Nicos Weg*). 

You play an international student who just arrived in the historic German city of Lübeck. With only **€20 in your pocket** and an impending **€250 university tuition (*Semesterbeitrag*) deadline**, you take up courier shifts for Kruma Express. As you navigate the 3D town, fulfill spoken German grocery orders, ride across cobblestone streets, and engage in doorstep etiquette, you realize the game's secret: **learning German grammar (*der/die/das*) is your greatest economic advantage to earn more money, upgrade your gear, and matriculate on time.**

## 3. How to Play & Core Controls
Designed for **single-thumb mobile portrait** touch and pointer play:
- **City Exploration**: Tap or hold-drag to cycle through 3D Lübeck. Tap interactive landmarks and NPCs to chat, take on quests, and clock in for shifts.
- **Warehouse Picking**: Listen to spoken German orders (*"die Milch!"*, *"der Apfel!"*). Tap the corresponding shelf item before the timer runs out.
- **Spatial Gender Filter**: The shelf has three tiers color-coded by German grammatical gender: Bottom = Blue (*der* ▲), Middle = Pink (*die* ●), Top = Purple (*das* ■). Hearing the article instantly narrows your search space by 66%.
- **Delivery Transit**: Steer your bicycle across lanes, balancing speed on rough cobblestone against cargo freshness and hazard avoidance in the bike lane.
- **Doorway Dialogue**: Choose appropriate conversational responses (*Du* vs. *Sie*, polite greetings) to secure customer tips.
- **Bike Shop Upgrades**: Invest earnings in E-Bikes, Thermal Bags, Shelf Labels, and Vocab Cards to optimize subsequent shifts.

## 4. Core Progression & Pedagogical Loop
Two growth curves run simultaneously:
1. **The Economic Curve**: Your wallet climbs from €20 to €250, unlocking higher-tier delivery gear and saving you from strikes.
2. **The Linguistic Competence Curve**: Your brain internalizes German noun genders and everyday phrases without flashcard fatigue. Picking an item before its visual icon resolves awards a **2.0× Early Pick Multiplier**.

## 5. Prototype Scope & Technical Feasibility
- 100% offline, zero-network runtime packaged as a single self-contained `index.html` (under 10MB uncompressed, ~2MB zipped).
- Rich 3D parametric city generation with stepped-gable Altbau architecture, custom normal+depth Sobel ink outlines, and hand-crafted diorama interiors.
- Built-in generative German morphology and rule engine providing endless, grammatically guaranteed grocery orders and character dialogue.
