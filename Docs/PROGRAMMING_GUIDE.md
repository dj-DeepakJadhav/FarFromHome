# Far From Home: Architecture Guide for Unity Developers

If you are coming from **Unity (C#)**, this document maps the entire codebase to Unity design patterns, lifecycle methods, and engine concepts. 

The project uses vanilla ES6 JavaScript and Three.js (r128) packaged into an offline WebGL bundle, structured around standard Unity-style patterns: **GameManager Singleton**, **Scene / Phase State Machine**, **MonoBehaviour-style update loops**, **ScriptableObject-style static data tables**, and **Raycast / BVH physics**.

---

## 1. Rosetta Stone: Unity vs. Far From Home

| Unity Concept (C#) | Far From Home Equivalent (JavaScript / Three.js) | File Location |
| :--- | :--- | :--- |
| `GameManager` (DontDestroyOnLoad) | `window.FFH.game` | `src/main.js` |
| `SceneManager.LoadScene()` | `game.transitionTo(phaseName, config)` | `src/main.js` (`transitionTo`) |
| `MonoBehaviour.Update()` | `phase.update(delta, timeSec)` via `requestAnimationFrame` | `src/phases/*.js` |
| `ScriptableObject` (Data Tables) | Frozen JS Objects / Modules (`NPC_DATABASE`, `items`, `shifts`) | `src/data/*.js` |
| `Canvas` / `uGUI` / `UI Toolkit` | HTML5 DOM Overlay (`#ui-container`, CSS absolute positioning) | `src/ui/hud.js`, `src/ui/screens/*.js` |
| `EditorWindow`-style modals | Screen modules mixed into `window.FFH.UI.prototype` via `Object.assign` (e.g. `hudModals.js`, `hudDictionary.js` — which now defines only `showSkillTreeModal`) | `src/ui/screens/*.js` |
| `Transform` & `GameObject` | `THREE.Object3D`, `THREE.Group`, `THREE.Mesh` | `src/render/*.js` |
| `CharacterController` / `NavMesh` | `CityInput` + `pathfinding.js` + `three-mesh-bvh` collision | `src/phases/city/cityInput.js`, `src/core/pathfinding.js` |
| `CinemachineVirtualCamera` | `CityCamera` with zoom interpolation & damping lerp | `src/phases/city/cityCamera.js` |
| `AudioSource` / `AudioClip` | Web Audio API oscillators — every sound is synthesised at runtime; there are **no** recorded audio assets | `src/audio/sfx.js` (SFX), `src/audio/speech.js` (`SpeechEngine.playTalkBlip` / `playOptionChime`) |
| `PlayerPrefs` / Save Game | `localStorage` JSON serialization (`window.FFH.saveGame`) | `src/main.js` |

---

## 2. Global Architecture: The "GameManager" Hierarchy

Just like in a Unity project with a persistent `GameManager`, execution begins in `src/main.js` which spins up `window.FFH.game`.

```text
GameManager (window.FFH.game)
  |
  +-- State / BlackBoard (game.state)
  |     Equivalent to a persistent ScriptableObject storing runtime state:
  |     wallet (€20 to €250), day (1 to 28), activeObjective, questStep,
  |     npcRelationships, and strike counters (0/3).
  |
  +-- PhaseManager (game.phases)
  |     Equivalent to Unity additive SceneManager loading/unloading views.
  |
  +-- StoryRunner (src/core/storyRunner.js)
  |     Node-based dialogue/quest interpreter (Ink / Yarn Spinner equivalent)
  |     reading window.FFH.storyData (inlined story.json).
  |
  +-- RenderPipeline (src/render/)
  |     Three.js WebGLRenderer, Scene, PerspectiveCamera, Custom ShaderPass
  |     (Cel-shading + Sobel Edge Ink Outlines).
  |
  +-- AudioManager (src/audio/)
        Fully procedural. sfx.js synthesises UI/world SFX; speech.js emits
        per-character pitched talk-blips (Animal Crossing style) from
        oscillator profiles. Zero bytes of recorded audio ship in the bundle.
```

---

## 3. Scenes as Lifecycle Phases (`MonoBehaviour` Equivalent)

Instead of switching Unity `.unity` scenes, Far From Home uses **Phase Controllers**. Each phase behaves like a root `MonoBehaviour` attached to a scene root GameObject:

```csharp
// Unity Conceptual Equivalent:
public interface IGamePhase {
    void Enter(object config);
    void Update(float delta, float timeSec);
    void Exit();
}
```

### The 5 Core Game Phases:

1. **`CITY_EXPLORATION` (`src/phases/cityExplorationPhase.js`)**:
   - **Unity Equivalent**: Overworld 3D Scene with Character Controller.
   - Handles continuous city bike riding, player input, doorway triggers, and compass waypoints.
   - Decomposed into modular sub-controllers: `cityCamera.js`, `cityInput.js`, `cityEnvironment.js`, `cityDoorway.js`, `cityCollectibles.js`.

2. **`PICK` (`src/phases/pickPhase.js`)**:
   - **Unity Equivalent**: Warehouse Minigame Scene.
   - 2.5D fixed perspective. Generates the 3-tier warehouse shelf (`der` = Blue ▲, `die` = Pink ●, `das` = Purple ■). Items are labelled English-first; the tier is read by colour and symbol.
   - The **gender rail pulses before the item icon resolves** (`pulseRailForGender`). Icon delay ramps 0.0s / 1.5s / 2.5s via `window.FFH.iconRevealDelay` in `src/data/shifts.js`.
   - Evaluates player pick accuracy, the 2.0x Early Pick bonus for tapping inside the pulse window, and combo streaks.

3. **`INTERIOR` (`src/phases/interiorPhase.js`)**:
   - **Unity Equivalent**: Split-Screen Narrative Cutscene / Dialogue Stage.
   - Upper 50% viewport: 3D diorama room (`roomDorm.js`, `roomShops.js`, `roomCivic.js`) with animated NPC mesh.
   - Lower 50% viewport: UI interaction drawer and choice buttons.

4. **`DIALOGUE` (`src/phases/dialoguePhase.js`)**:
   - **Unity Equivalent**: Fullscreen Visual Novel / Conversation Mode.
   - Drives character conversations, portrait display, and typewriter text reveal with procedural per-character talk-blips.

5. **`SHOP` (`src/phases/shopPhase.js`)**:
   - **Unity Equivalent**: Upgrade / Inventory Shop Screen.
   - Displays the 5 upgrades defined in `src/data/shop.js` (E-Bike €45, Thermal Bag €50, Shelf Labels €25, Pocket Notepad €20, Shift Rota Cards €35 — id `vocabCards`) and modifies global economy tunables.

To switch phases anywhere in code:
```javascript
// Similar to SceneManager.LoadScene("INTERIOR", LoadSceneMode.Single);
game.transitionTo('INTERIOR', {
  roomType: 'WG_ROOM',
  npcKey: 'NPC_NICO'
});
```

---

## 4. Coordinate Space & NavMesh / Colliders

The 3D city is constructed on a grid where `TILE_SCALE = 2.6`:
- **X Axis** = East (+) / West (-)
- **Y Axis** = Up (+) (Ground level is `y = 0.05`, raised room floor is `y = 0.38`)
- **Z Axis** = South (+) / North (-)

### Physics & Collision:
- **No PhysX engine overhead**: Instead of heavy Rigidbody physics, the game uses **`three-mesh-bvh`** (Bounding Volume Hierarchy).
- Similar to a **Unity NavMesh Raycast / Capsule Sweep**, player movement raycasts against static building meshes and clamps the courier position smoothly along wall normals.

### Building Waypoint Coordinates (`Transform.position`):
- `B_ZOB` (Train Station / Spawn): `(5.2, 0.05, 1.2)`
- `B_WG` (Student Dorm Room 4): `(6.6, 0.05, 23.4)`
- `B_UNI` (University Admissions): `(26.0, 0.05, 16.8)`
- `B_PIZZA` (Pizzeria Bella): `(28.6, 0.05, 22.2)`
- `B_BAKERY` (Bakery Hansa): `(6.6, 0.05, 15.6)`
- `B_DARKSTORE` (Kruma Dispatch Hub): `(6.6, 0.05, 44.2)`
- `B_RATHAUS` (City Hall Bürgeramt): `(24.8, 0.05, 20.8)`
- `B_BANK` (Sparkasse Bank): `(41.6, 0.05, 4.0)`
- `B_AUSLAENDER` (Immigration Office): `(37.8, 0.05, 23.4)`

---

## 5. Camera System (Cinemachine Equivalent)

Implemented in `src/phases/city/cityCamera.js`:
- **Isometric Framing**: Orthographic feel achieved using perspective camera with locked 390x844 mobile portrait aspect ratio.
- **Cinematic Glide (Boot Transition)**:
  - Equivalent to blending from a Cinemachine Orbit Camera (`zoom = 0.52`) to a Follow Camera (`zoom = 1.25`) over 3000ms using `Math.easeInOutCubic`.
- **Idle ScreenSaver**:
  - After 60 seconds without input, transitions to an orbital fly-around mode.
  - Wakes up immediately upon any touch or key press.

---

## 6. NPC Data & Memory ("ScriptableObjects")

NPCs and items are defined as static data structures, matching Unity ScriptableObjects:

```javascript
// src/data/dialogue/dialogueTown.js
window.FFH.NPC_DATABASE['NPC_MATHIAS'] = {
  id: 'NPC_MATHIAS',
  name: 'Herr Mathias Becker',
  building: 'B_PIZZA',
  personality: { ... },
  dialogue: (state) => { ... }
};
```

### NPC Emotional Memory (Blackboard Pattern):
Tracked dynamically across sessions via `window.FFH.npcMemory`:
```javascript
// Checking memory (like Blackboard.GetBool):
const memories = state.npcMemory['NPC_NICO'] || [];
if (memories.includes('recycled_pfand')) {
  // Trigger custom greeting reaction
}

// Storing memory:
window.FFH.NPCMemoryManager.recordEncounter('NPC_NICO', 'recycled_pfand', +15, state);
```

---

## 7. The 60-Second Core Loop & Pacing Curve

```text
1. EXPLORE & DISPATCH (City Navigation)
   Ride bike through 3D Altstadt to Kruma Express.
   
2. WAREHOUSE PICKING (Spatial Match)
   A dispatch blip fires and the gender rail PULSES; the item icon
   resolves a beat later. Tap the pulsing tier early for a 2.0x bonus.
   Three colour-coded shelves (English-first labels):
   - der (Blue ▲)
   - die (Pink ●)
   - das (Purple ■)
   
3. COURIER RUN (Tactile Map Delivery)
   Courier rides across cobblestones to customer beacon.
   
4. DOORWAY HANDOFF (Cultural Dialogue)
   Front-facing diorama. Formal "Sie" vs informal "Du" choices.
   Customer tip awarded.
   
5. DEBRIEF & UPGRADE (Progression)
   Shift receipt payout -> Bike shop upgrades (E-Bike, Thermal Bag).
   Fund €250 tuition goal to win before Day 28!
```

---

## 8. Build & Assembly Pipeline

In Unity you press **Build and Run**. Here, everything is assembled via Node.js:
- **Build Command**: `node build/assemble.js`
  - Inlines all scripts from `src/` into a single, clean `index.html`.
  - Automatically inlines `assets/narrative/story.json` into `window.FFH.storyData` for **100% offline airgap compliance**.
- **Size Audit**: `node build/check-size.js`
  - Ensures the uncompressed output is strictly `<= 35 MB` (currently ~11.13 MB).


