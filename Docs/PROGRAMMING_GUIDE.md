# Far From Home — Programming Guide

This document defines the core logic, standardized UI sequences, and technical vocabulary established for the game. All agents and future development must adhere to these established patterns to ensure a consistent player experience.

## 1. The Boot & Seamless Glide Sequence
The game must transition perfectly from the "Title Screen" to the "Game World" without any visual jumps, popping, or teleportation.

- **Title Screen Orbit:** The title screen camera does not look at a generic center. It precisely orbits the **exact player spawn coordinates** (e.g., `(x: 10.4, z: 5.2)` for the Train Station / ZOB).
- **Match Zoom:** The title screen camera uses `zoom: 0.52` so it matches the beginning of the transition zoom.
- **Dynamic Angle Capture:** When "New Game" is clicked, `hud.js` calculates the title camera's exact rotational angle relative to the player spawn using `Math.atan2(dx, dz)`. It uses this dynamic angle as the starting point for the camera swoop.
- **The Swoop:** The camera transitions over 3000ms from `zoom: 0.52` to `zoom: 1.25` using an `easeInOutCubic` curve, ending in a behind-the-back 3rd-person isometric view.
- **Scene Triggering:** `storyRunner.startScene('act_one')` is called at the *end* of the camera glide.
- **Location Locking:** The location defined in the starting scene (e.g., `B_ZOB`) must exactly match the player's spawn coordinates to prevent the player from teleporting the moment the scene starts.

## 2. First-Touch Objective Reveal Sequence
The game relies on a tactile, "wake-up" approach to UI tutorialization.
When the game starts, all HUD elements and navigation compasses are strictly hidden.

- **First Touch Consumption:** The very first time the player touches/clicks the screen to move, `cityExplorationPhase.js` intercepts and **consumes** the input. The player does not walk yet.
- **playObjectiveRevealSequence(true):** The first touch triggers this reusable function in `hud.js`.
  1. **Slide Down:** The top `#city-header-bar` slides down from `translateY(-20px)`.
  2. **Typing Effect:** The `city-quest-text` types out character-by-character with a subtle `click` sound.
  3. **Pulse & Chime:** Upon finishing typing, the objective tracker scales up to `1.02`, glows with a teal `box-shadow`, and plays a `bell` chime.
  4. **Compass Reveal:** The 3D navigation ribbon and glowing ground marker fade in, pointing the player to their objective.
  5. **Sequential Fade-in:** The Day, Docs, Stats, Wallet, and Profile badges fade in one after the other with a 250ms staggered delay.

## 3. Objective Assignment & Updating
The `playObjectiveRevealSequence(isBootSequence)` function is the global standard for capturing the player's attention.

- **Updating Objectives:** Whenever `storyRunner.js` sets a new `activeObjective`, it must call `playObjectiveRevealSequence(false)`.
- **Gameplay Updates:** Passing `false` bypasses the sliding UI and sequential fades, keeping the HUD strictly focused on dynamically typing the new text, pulsing the box, and re-orienting the compass.
- **Save Games:** When implementing the "Continue" save system, `playObjectiveRevealSequence(true)` will be called to replay the cinematic UI startup using the loaded stats.

## 4. UI Layout & Constraints
Mobile viewports (390x844 portrait) are highly constrained. The UI must never overflow, squish, or wrap unexpectedly.

- **No Flex Wrapping:** Key data rows (like `Row 1` in the HUD) use `flex-wrap: nowrap` and internal `white-space: nowrap` to forcefully keep data on a single line.
- **Strict Margins/Padding:** Container paddings are minimized (e.g., `4px 6px`) to maximize breathing room for dynamic text (like `100 | ❤️50`).
- **Nomenclature:** 
  - **Stats:** Always labeled clearly with emojis (`⚡` for Body, `❤️` for Heart, `💶` for Wallet).
  - **Upgrades Menu:** The button that opens the character progression/skill tree is called **👤 PROFILE** (formerly EXPAT) to ensure immediate player comprehension.

## 5. Camera Idle System
If the player stops moving and interacting for **60 seconds**, the game shifts from a 3rd-person view into a diorama screensaver mode.

- **Zoom Out:** The camera smoothly zooms out to `0.52`.
- **Slow Drift:** The camera slowly orbits the character.
- **Wake Up:** The instant the player taps to move, the camera immediately snaps back to `zoom: 1.15` and movement resumes.
