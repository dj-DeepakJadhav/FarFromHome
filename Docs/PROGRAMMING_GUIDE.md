# Far From Home: Architecture & Story Authoring Guide for Unity Developers

If you are coming from **Unity (C#)**, this document maps the entire codebase to Unity design patterns, lifecycle methods, and engine concepts. It serves as the authoritative guide for adding, modifying, and expanding content from **Act 1 through Act 5**.

The project uses vanilla ES6 JavaScript and Three.js (r128) packaged into an offline WebGL bundle, structured around standard Unity-style patterns: **GameManager Singleton**, **Scene / Phase State Machine**, **MonoBehaviour-style update loops**, **ScriptableObject / Ink-style story JSON**, and **Raycast / BVH physics**.

---

## 1. Rosetta Stone: Unity vs. Far From Home

| Unity Concept (C#) | Far From Home Equivalent (JS / Three.js) | File Location |
| :--- | :--- | :--- |
| `GameManager` (DontDestroyOnLoad) | `window.FFH.game` | `src/main.js` |
| `SceneManager.LoadScene()` | `game.transitionTo(phaseName, config)` | `src/main.js` |
| `MonoBehaviour.Update()` | `phase.update(delta, timeSec)` via `requestAnimationFrame` | `src/phases/*.js` |
| `ScriptableObject` / `Data Tables` | Frozen JS Objects / JSON (`story.json`, `items.js`, `shifts.js`) | `assets/narrative/story.json`, `src/data/*.js` |
| `Ink` / `Yarn Spinner` Dialogue | `StoryRunner` node interpreter | `src/core/storyRunner.js` |
| `Canvas` / `uGUI` / `UI Toolkit` | HTML5 DOM Overlay (`#ui-container`, CSS absolute positioning) | `src/ui/hud.js`, `src/ui/screens/*.js` |
| `Transform` & `GameObject` | `THREE.Object3D`, `THREE.Group`, `THREE.Mesh` | `src/render/*.js` |
| `CharacterController` / `NavMesh` | `CityInput` + `pathfinding.js` + `three-mesh-bvh` collision | `src/phases/city/cityInput.js`, `src/core/pathfinding.js` |
| `CinemachineVirtualCamera` | `CityCamera` with zoom interpolation & damping lerp | `src/phases/city/cityCamera.js` |
| `AudioSource` / `AudioClip` | Web Audio API synthesizers — procedural oscillators (zero audio files) | `src/audio/sfx.js`, `src/audio/speech.js` |
| `PlayerPrefs` / Save Game System | `SaveSystem` (`localStorage` JSON serialization) | `src/core/economy.js` |

---

## 2. Global Architecture & Executive Lifecycle

```text
GameManager (window.FFH.game)
  |
  +-- State / BlackBoard (game.state)
  |     Stores wallet (€20 to €250), day (1 to 28), activeObjective, questStep,
  |     npcRelationships, and strike counters.
  |
  +-- PhaseManager (game.phases)
  |     Additive SceneManager loading/unloading game phases (CITY, PICK, INTERIOR, DIALOGUE, SHOP).
  |
  +-- StoryRunner (src/core/storyRunner.js)
  |     Interprets assets/narrative/story.json (inlined into window.FFH.storyData).
  |
  +-- RenderPipeline (src/render/)
  |     Three.js WebGLRenderer, Cel-shading + Ink Outlines.
  |
  +-- AudioManager (src/audio/)
        Fully procedural Web Audio API. SFX & pitched character blips (Animal Crossing style).
```

---

## 3. Modular Story Authoring: Writing Acts 1 to 5

Any developer (including non-programmers or Unity quest designers) can author new story beats, quests, dialogue branches, and economic payouts purely by editing `assets/narrative/story.json`.

### 3.1 Anatomy of a Scene Object (`story.json`)
```jsonc
{
  "id": "pizzeria_job_offer",       // Unique scene address
  "act": "II",                      // Act I through V
  "stage": {
    "loc": "B_PIZZA",               // Location ID from City Grid (e.g. B_PIZZA, B_WG, B_DARKSTORE)
    "time": "14:00",                // Display time
    "light": "afternoon_clear"      // Environment lighting preset
  },
  "cast": ["NPC_PIZZERIA_OWNER"],   // NPC spawned in the 3D diorama
  "prose": [
    "The pizza oven radiates intense heat.",
    "Owner: We need someone fast on the e-bike. You ready?"
  ],
  "choices": [
    {
      "text": "Accept shift for €30",
      "to": "pizzeria_shift_start",
      "effects": [{ "var": "wallet", "expr": "wallet + 30" }]
    },
    {
      "text": "Decline politely",
      "to": "city_exploration_hub"
    }
  ],
  "unlocks": {
    "phase": "PICK",               // Trigger minigame phase or shift
    "shift_id": "shift_2_rush"
  }
}
```

### 3.2 Automated Story Validation Gate
Before committing story changes, run the validator script:
```bash
node build/check-story.js
```
This script checks for:
- Dead-end scenes or dangling target IDs (`to`).
- Unreachable scenes across Acts 1–5.
- Banned claims (no recorded audio, pedagogical teaching claims, or hardcoded currency).

---

## 4. Systems Status: What Exists vs. What Needs Building

### ✅ Systems Fully Implemented & Ready for Content
1. **Story Engine & Branching (`StoryRunner`)**: Complete JSON state machine supporting variable updates, conditional choices, POI travel triggers, and scene branching loading from `assets/narrative/story.json`.
2. **City Overworld & Navigation (`CITY_EXPLORATION`)**: 3D Altstadt layout with BVH collision, camera follow, doorway interaction zones, and objective waypoint compass. Reuses 3D models and textures directly from `assets/` (`assets/Characters/`, `assets/Buildings/`, `assets/UI/`).
3. **Warehouse Picking Minigame (`PICK`)**: 3-tier gender shelf (`der` Blue ▲, `die` Pink ●, `das` Purple ■) with pulsing rail cues and 2.0× Early Pick scoring.
4. **Procedural Audio & Talk Engine (`sfx.js` / `speech.js`)**: Runtime Web Audio synth emitting UI clicks, cash register chimes, bike bells, ambient background soundscapes (city wind/night soundscape), and character talk blips.
5. **Economy & Save State (`SaveSystem`)**: Automated saving at stage transitions, tuition goal tracking (€20 ➔ €250), strike counts, and local storage persistence.
6. **Shop & Upgrades (`shopPhase.js`)**: 5 functional shop upgrades (E-Bike, Thermal Bag, Shelf Labels, Pocket Notepad, Shift Rota Cards).

### 🚧 Content & Detailed Implementation Plan for Acts 2 through 5

Developers can construct Acts 2 through 5 by authoring scene sequences in `assets/narrative/story.json` following this detailed Roadmap:

#### Act 2: The Kaution Deposit Fork & Kruma Debt (`scenes: act2_*`)
- **Core Dilemma**: The landlord Herr Mathias demands a €100 security deposit (*Kaution*).
- **Branch A (The Loan)**: Accept a high-interest cash advance from Kruma manager Herr Otto (`NPC_OTTO`). Increases daily debt deduction but keeps immediate runway for e-bike upgrade.
- **Branch B (The Pinch)**: Pay Kaution directly, leaving player with €10. Forces player to complete 3 emergency delivery shifts without failing items.
- **Target Location**: `B_WG` (Dorm Room) $\rightarrow$ `B_DARKSTORE` (Kruma Hub).

#### Act 3: The Darkstore Crunch & Bürgeramt Maze (`scenes: act3_*`)
- **Core Dilemma**: Balancing delivery speed vs. mandatory city registration (*Anmeldung*).
- **Shift Mechanics**: Unlocks Shift 4 and Shift 5 with faster item reveal intervals (1.5s down to 0.8s) and higher item counts (8 items per shift).
- **Civic Questline**: Player must navigate to `B_RATHAUS` / `B_AUSLAENDER` before 12:00 PM game-time or receive a bureaucracy penalty fine (€15).
- **Side Hustle**: Unlocks Pfand bottle recycling with Nico (`NPC_NICO`) at `B_BAKERY` to recover cash.

#### Act 4: Mastery & Financial Untangling (`scenes: act4_*`)
- **Core Dilemma**: Pay off Kruma debt or buy top-tier E-Bike upgrade to finish express shifts under 45 seconds.
- **High-Speed Shifts**: Weather modifiers (rain/night ambient soundscape) applied in `PICK` minigame phase.
- **Customer Rapport**: Handoff choices at `B_UNI` and `B_PIZZA` reward €15-€25 tips based on formal vs. informal etiquette choices ("Sie" vs "Du").

#### Act 5: The Final Bureaucracy Desk & Win/Loss Climax (`scenes: act5_*`)
- **Final Target**: University Admissions Desk at `B_UNI`.
- **Winning Condition**: €250 tuition goal reached before Day 28 + zero eviction strikes.
- **3 Dynamic Endings**:
  1. *Magna Cum Laude*: €250 saved + debt free $\rightarrow$ Full matriculation, bicycle returned.
  2. *The Darkstore Grind*: €250 saved + Kruma debt active $\rightarrow$ Enrolled, but working night shifts.
  3. *Ruhezeit (Game Over)*: Wallet < €0 or Day 28 reached without tuition $\rightarrow$ Ticket back home.

---

## 5. UI, HUD, Audio & Effects Feedback Loops

When designing or modifying gameplay phases, always hook into the built-in feedback system to keep interactions punchy:

### 5.1 HUD Toasts & Objectives
```javascript
// Display objective toast on player UI
window.FFH.game.ui.setObjective("🏠 Find Room 4 — Student WG");

// Trigger a floating notification toast
window.FFH.game.ui.showToast("Got €20 Tip from Customer!", "success");
```

### 5.2 Audio & Background Sound Feedback Triggering
```javascript
// Play procedural UI or Minigame SFX
window.FFH.sfx.play('coin');          // Payout sound
window.FFH.sfx.play('pick_correct');  // Shelf pick success
window.FFH.sfx.play('error');         // Invalid pick / strike

// Play character talk blip in dialogue
window.FFH.SpeechEngine.playTalkBlip('NPC_NICO');

// Control Ambient Background Soundscape / Music (Day vs Night)
window.FFH.sfx.playBgm('day');        // Start day-time city ambient soundscape
window.FFH.sfx.playBgm('night');      // Start night-time lowpass ambient soundscape
window.FFH.sfx.stopAmbience();        // Mute ambient soundscape
```

### 5.3 Render & Visual Effects
- **Asset Loading**: 3D character and building assets are loaded directly from `assets/Characters/` and `assets/Buildings/` via Three.js loader hooks.
- **Sobel Ink Outline & Cel Shading**: Render pipeline in `src/render/` automatically applies comic-book outlines to all 3D meshes.
- **Gender Rail Pulse**: In `PickPhase`, call `pulseRailForGender(tierIndex)` to flash the visual cue ahead of icon resolution.

---

## 6. Build, Assembly & Size Verification Pipeline

1. **Assemble Single-File Release**:
   ```bash
   node build/assemble.js
   ```
   Inlines all modular source code in `src/` and `assets/narrative/story.json` into a zero-dependency root `index.html`.

2. **Verify Submission Size Limit (≤ 35 MB)**:
   ```bash
   node build/check-size.js
   ```
   Ensures the entire game bundle stays strictly under the 35 MB competition rule (currently ~11 MB).



