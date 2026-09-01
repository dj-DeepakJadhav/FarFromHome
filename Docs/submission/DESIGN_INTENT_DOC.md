# Far From Home: Kruma Express — Design Intent Document
*Word Count: 428 words (Strict Limit: ≤ 500 words)*

## 1. Game Title and Genre
**Far From Home: Kruma Express** — Narrative Life & Courier Management Simulation (Fixed Portrait Mobile WebGL, 390×844).

## 2. Target Player and Pitch
Built for mobile and browser players who love tactile management simulations (*Good Pizza Great Pizza*, *Coffee Talk*) and atmospheric narrative games (*Messenger by Abeto*, DW's *Nicos Weg*). 

You play an international student newly arrived in the historic island city of Lübeck, Germany, on a 1-month entry visa with only **€20 in your pocket**. To secure your permanent residence permit (*Aufenthaltstitel*), you must conquer the authentic German Bureaucracy Gauntlet within 28 days: earn courier wages at Kruma Express, pay your **€250 Semesterbeitrag** (Tuition), save **€300 Kaution** for an apartment lease, complete your **Anmeldung** at the Rathaus, unlock your **Sperrkonto** (Bank Account), and present your completed dossier to the immigration office.

The game is **100% English-first for instant, frictionless playability**, enriched with authentic German studio voice acting and cultural charm that brings the world alive without educational friction.

## 3. How to Play & Core Controls
Designed for **single-thumb mobile portrait** touch and pointer play:
- **City Exploration**: Cycle smoothly through the 3D diorama of Lübeck. Visit the University, Rathaus, Sparkasse, and residential apartments to advance your bureaucratic paperwork checklist.
- **Warehouse Packing**: Fast-paced arcade grocery packing. Items display English names first with subtle German subtitles (`Milk (die Milch)`). 
- **Spatial Color Tiers**: Shelves feature high-contrast color categories: Bottom = Blue (*Chilled/Drinks* ▲), Middle = Pink (*Fresh/Produce* ●), Top = Purple (*Bakery/Dry* ■). Rhythmic audio callouts guide player focus.
- **Doorway Dialogue**: Engage in witty, characterful English dialogue with voiced German greetings (*"Guten Tag!"*) and cultural etiquette choices to secure generous customer tips.
- **Bike Shop Upgrades**: Reinvest wages into visible E-Bikes, Thermal Bags, and Speed Tunings to optimize future courier routes.

## 4. Core Progression & Economic Engine
Two growth engines drive the experience:
1. **The Management Engine (Invest ➔ Harvest ➔ Upgrade)**: Fast packing shifts generate base wages and combo streaks; city bike navigation and doorway tips boost earnings to fund vital upgrades and clear tuition milestones.
2. **The Bureaucratic Quest Chain**: Your wallet systematically ticks off essential survival documents (Matriculation ➔ Lease ➔ Anmeldung ➔ Sperrkonto ➔ Residence Permit).

## 5. Prototype Scope & Technical Feasibility
- 100% offline, zero-network runtime packaged as a single self-contained `index.html` (under 10MB uncompressed, ~2MB zipped).
- Rich 3D parametric city generation with stepped-gable Altbau architecture, custom normal+depth Sobel ink outlines, and seamless street-level dialogue framing.
