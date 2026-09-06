# Far From Home: Kruma Express — Design Intent Document
*Recount with `sed '1,3d' DESIGN_INTENT_DOC.md | wc -w` (strict limit: ≤ 500 words)*

## 1. Game Title and Genre
**Far From Home: Kruma Express** — Narrative Life & Courier Management Simulation (Fixed Portrait Mobile WebGL, 390×844).

## 2. Target Player and Pitch
For players who like tactile management sims (*Good Pizza, Great Pizza*) and character-led narrative games (*Coffee Talk*, *Messenger by Abeto*).

You are an international student who has just landed in Lübeck with **€20, one suitcase, and 28 days** before your visa expires. To stay, you must beat the German bureaucracy gauntlet: earn courier wages at Kruma Express, pay the **€250 Semesterbeitrag**, sign a lease with Hans Lokker, complete your **Anmeldung** with Herr Vogel at the Bürgeramt, and unlock your **Sperrkonto** with Frau Weber — then put the whole stamped dossier in front of Dr. Lindemann.

The tone is the point: **British deadpan comedy colliding with German municipal precision.** Every office is immovable, every rule real, none of it on your side.

**This is not a language-learning game.** It teaches nothing and asks you to recall nothing. Play is 100% English-first. German is scenery — signage, officialese, and the punchline below.

## 3. How to Play & Core Controls
Designed for **single-thumb portrait** touch and pointer play:
- **City Exploration**: Cycle a 3D Lübeck with tap-to-move. Visit the University, Bürgeramt, Bank and shops to advance your paperwork.
- **Warehouse Packing**: Fast grocery picking against a shift clock. Items are labelled English-first, with the German small and grey: `Milk (die Milch)`.
- **The Absurd Filing System**: German nouns have arbitrary genders, so of course the warehouse is filed by them. An apple is a boy. A banana is a girl. Bread is neither. Bottom = **der** (Blue ▲), Middle = **die** (Pink ●), Top = **das** (Purple ■). You needn't understand it — you must obey it, fast. Before each icon resolves, its **gender rail pulses**; commit to that tier early for a **2.0× Early Pick** bonus. The joke is also a search accelerator: it cuts the shelf you scan by two thirds.
- **Doorstep Etiquette**: Hand-offs where *Sie* vs. *Du* and *Ruhezeit* either land or misfire, moving your tip.
- **Room Upgrades**: Reinvest wages into upgrades that visibly furnish your room and change your numbers.

## 4. Core Progression & Economic Engine
1. **The Management Engine (Invest ➔ Harvest ➔ Upgrade ➔ Observe Growth)**: Shifts generate wages, streaks and tips; five shop upgrades (E-Bike, Thermal Bag, Shelf Labels, Pocket Notepad, Shift Rota Cards) each change both a stat and something you can see.
2. **The 4-Document Dossier**: A persistent HUD readout ticking off Matriculation ➔ Lease ➔ Anmeldung ➔ Sperrkonto ➔ Residence Permit — the mountain on the horizon behind every shift.

## 5. Prototype Scope & Technical Feasibility
- 100% offline, airgapped, single self-contained `index.html` (~11 MB; limit 35 MB).
- Parametric 3D city generation, stepped-gable Altbau, Sobel ink outlines, diorama rooms.
- **No audio assets ship.** All sound is synthesised at runtime from oscillators, so the game is fully playable muted.
