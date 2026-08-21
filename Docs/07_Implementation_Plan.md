# Far From Home: Kruma Express — Systemic Implementation Plan

## Context

This plan supersedes earlier versions to align strictly with `Docs/10_SYSTEMIC_SIMULATION_TASK_LIST.md` and `Docs/00_DESIGN_CONSTITUTION.md`. 
The game is a mobile-web browser game (Three.js, 390×844 portrait, offline, single unminified index.html). The focus is firmly on **Systemic Simulation & Management**.

## Core Phases & Sequence

1. **Engine Foundation & Pick Phase (Warehouse)**: FSM skeleton, 3D item picking, live time limits, and freshness decay.
2. **Tactical Ride Phase**: Dual route choice (*Kurzer Weg* vs *Fahrradweg*) rather than on-rails arcade scrolling. Introduces the cargo fragility matrix (`STURDY`/`FRAGILE`/`PERISHABLE`).
3. **Intercom & Voice Phase**: HTML5 `SpeechRecognition` integration with text fallback, apartment buzzers, and etiquette dialogue.
4. **Debriefing Receipt**: Detailed itemized receipt showing base wage, accuracy bonus, streak multiplier, customer tip, and damage deductions.
5. **Living Student Room (Shop)**: 15-minute visible growth metagame. The room serves as the progress bar, scaling from a bare mattress to a decorated room with Kenney kit furnishings and pets.
6. **Air-Gap Audit**: Final offline validation and bundling into a < 35MB `far-from-home.zip`.

## File Structure

The project relies on a data-driven structure built on a shared `window.FFH` namespace, bundled via `build/assemble.js`:

- `src/core/fsm.js`: State loop orchestration.
- `src/core/economy.js`: Economy engine and ledger accumulator.
- `src/ui/receipt.js`: Debrief receipt UI overlay generator.
- `src/phases/ridePhase.js`: Route selection UI and risk/reward resolution.
- `src/render/dioramaRooms.js`: Room rendering logic reflecting purchased upgrades.
- `src/data/items.js`: Items configuration including fragility and perishability tags.
- `src/data/shop.js`: Tiers of courier gear and room comforts.

## Next Actionable Tasks (Phase E & Phase H)

Following the new systemic mandate, implementation will immediately focus on adding depth to the core loop:
1. **Order Batching and Fragility in PICK**: Players will manage multiple concurrent bags and adhere to safe packing order (heavy items before fragile items).
2. **Post-Shift Receipt**: Build out `src/ui/receipt.js` to render the exact breakdown of how the player earned or lost money based on their transit and packing decisions.
3. **Room Visible Growth**: Connect the shop purchases fully to the 3D room rendering to make progression tangible.
