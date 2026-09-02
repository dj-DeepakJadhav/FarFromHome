# Far From Home: Kruma Express — Design Intent Document
*Word Count: 446 words (Strict Limit: ≤ 500 words) — recount with `sed '1,3d' DESIGN_INTENT_DOC.md | wc -w`*

## 1. Game Title and Genre
**Far From Home: Kruma Express** — Narrative Life & Courier Management Simulation (Fixed Portrait Mobile WebGL, 390×844).

## 2. Target Player and Pitch
Built for mobile and browser players who love tactile management simulations (*Startup Panic*, *Coffee Talk*) and heartfelt narrative games (*Messenger by Abeto*, DW's *Nicos Weg*). 

You play an international student newly arrived in historic Lübeck, Germany, on a 28-day visa with only **€20 in your pocket**. To secure your permanent residence permit (*Aufenthaltstitel*), you must conquer the 4-document German Bureaucracy Gauntlet: earn courier wages at Kruma Express, pay your **€250 Semesterbeitrag** (Tuition), sign your **Rental Lease** with Hans Lokker, complete your **Anmeldung** at the Bürgeramt with Herr Vogel, and unlock your **Sperrkonto** at Sparkasse Bank with Frau Weber.

The game is **100% English-first for instant playability**, enriched with authentic German studio voice acting and cultural charm that brings the world alive without educational friction.

## 3. How to Play & Core Controls
Designed for **single-thumb mobile portrait** touch and pointer play:
- **City Exploration**: Cycle through the 3D diorama of Lübeck. Visit the University, Bürgeramt, Bank, and local shops to advance your persistent paperwork checklist.
- **Warehouse Packing**: Fast-paced grocery packing with dynamic shift modes (Standard vs. High-Stakes VIP Rush). Items display English names with subtle German subtitles (`Milk (die Milch)`).
- **Spatial Color Tiers**: Shelves feature high-contrast color categories: Bottom = Blue (*Chilled* ▲), Middle = Pink (*Produce* ●), Top = Purple (*Bakery* ■). Rhythmic audio callouts guide player focus.
- **Doorstep Etiquette**: Engage in rich English dialogue with voiced German greetings (*"Guten Tag!"*) and cultural etiquette choices to secure generous customer tips.
- **Dorm Room Upgrades**: Reinvest wages into tangible 3D room upgrades (E-Bike motor, Thermal Bag, Study Corkboard) that visibly furnish your student dorm and accelerate future shifts.

## 4. Core Progression & Economic Engine
Three intertwined progression engines drive the experience:
1. **The Management Engine (Invest ➔ Harvest ➔ Upgrade ➔ Observe Growth)**: Courier packing shifts generate wages and tip multipliers; dorm workbench upgrades visibly transform your room.
2. **The 3-Branch Expat Skill Tree**: Level up your character across *The Hustler* (bike speed & rush tips), *The Bureaucrat* (tax exemptions & legal aid with AStA's Dr. Schmidt), and *The Diplomat* (thrift, *Pfand* bonuses, and *Stoßlüften* stamina recovery).
3. **The 4-Document Dossier Gauntlet**: Your persistent HUD systematically ticks off essential legal milestones (Matriculation ➔ Lease ➔ Anmeldung ➔ Sperrkonto ➔ Residence Permit).

## 5. Prototype Scope & Technical Feasibility
- 100% offline, airgapped runtime packaged as a single self-contained `index.html` (3.6MB uncompressed, limit 35MB).
- Rich 3D parametric city generation with stepped-gable Altbau architecture, custom normal+depth Sobel ink outlines, and interactive diorama rooms.
