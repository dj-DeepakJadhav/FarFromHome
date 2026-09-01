# Far From Home: Kruma Express — Design Intent Document
*Word Count: 433 words (Strict Limit: ≤ 500 words)*

## 1. Game Title and Genre
**Far From Home: Kruma Express** — Narrative Life & Courier Management Simulation (Fixed Portrait Mobile WebGL, 390×844).

## 2. Target Player and Pitch
Built for mobile and browser players who love tactile management simulations (*Good Pizza Great Pizza*, *Coffee Talk*) and atmospheric narrative games (*Messenger by Abeto*, DW's *Nicos Weg*). 

You play an international student newly arrived in Lübeck, Germany, on a 1-month entry visa with only **€20 in your pocket**. To secure your permanent residence permit (*Aufenthaltstitel*), you must conquer the authentic German Bureaucracy Gauntlet (*Bürokratie-Spießrutenlauf*) within 28 days: earn wages working for Kruma Express, pay your **€250 Semesterbeitrag**, save **€300 Kaution** for an apartment lease, complete your **Anmeldung** at the Rathaus, unlock your **Sperrkonto** (Blocked Account), and present your stamped dossier to the Ausländerbehörde.

The signature breakthrough: **learning German grammar (*der/die/das*) is your core spatial search filter**, turning language acquisition into your greatest economic superpower.

## 3. How to Play & Core Controls
Designed for **single-thumb mobile portrait** touch and pointer play:
- **City Exploration**: Cycle smoothly through the 3D diorama of Lübeck. Visit the University, Rathaus, Sparkasse, and residential apartments to advance your bureaucratic paperwork checklist.
- **Warehouse Packing**: Listen to spoken German orders (*"die Milch!"*, *"der Apfel!"*). Tap corresponding shelf items before the timer expires.
- **Spatial Gender Filter**: The warehouse shelf features three tiers color-coded by grammatical gender: Bottom = Blue (*der* ▲), Middle = Pink (*die* ●), Top = Purple (*das* ■). Hearing the article instantly narrows visual search by 66%.
- **Doorway Dialogue**: Engage in culturally authentic German dialogue (*Du* vs. *Sie*, polite greetings) to secure generous customer tips.
- **Bike Shop Upgrades**: Reinvest wages into visible E-Bikes, Thermal Bags, Shelf Labels, and Vocab Notebooks to optimize future shifts.

## 4. Core Progression & Pedagogical Loop
Two growth engines drive the experience:
1. **The Bureaucracy & Economic Engine**: Your wallet climbs as you fund your Kaution and Semesterbeitrag, systematically ticking off documents (Lease -> Anmeldung -> Sperrkonto -> Visa).
2. **Linguistic Competence**: Spoken German noun genders and conversational formulas become second nature. Guessing an item by hearing its article awards a **2.0× Early Pick Multiplier**.

## 5. Prototype Scope & Technical Feasibility
- 100% offline, zero-network runtime packaged as a single self-contained `index.html` (under 10MB uncompressed, ~2MB zipped).
- Rich 3D parametric city generation with stepped-gable Altbau architecture, custom normal+depth Sobel ink outlines, and seamless street-level dialogue framing.
- Built-in generative German morphology and rule engine providing endless, grammatically guaranteed grocery orders and character dialogue.
