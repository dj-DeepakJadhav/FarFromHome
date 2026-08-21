# Far From Home: Kruma Express — Asset Specifications & Procedural Generator Guide

This document lists the exact assets required for the game and outlines the specific procedural workflows and tools available to generate them directly in-engine or offline.

---

## 1. 3D Meshes & Geometry

### Required Assets
*   **Courier Bicycle**: Low-poly orange delivery bike.
*   **Paper Grocery Bag**: Brown kraft paper bag.
*   **Dark Store Shelving**: 3-tier warehouse metal/wood shelf diorama.
*   **Intercom Board**: Brass apartment buzzer panel.
*   **German Townhouses (Background)**: Modular facade pieces (Altbau style).
*   **Potholes & Cobblestones**: Ground obstacle models.
*   **German Road Signs**: Blue street signs ("Hauptstraße", "Einbahnstraße", "Sackgasse").

### Procedural Tooling Strategy
1.  **Three.js CSG (Constructive Solid Geometry)**: We can use `three-bvh-csg` (or write simple subtraction algorithms) to combine primitive shapes (Cubes, Cylinders, Spheres) to build complex objects like the bicycle, shelving, and street signs.
2.  **`ez-tree`**: Use for generating background flora and street vegetation dynamically.
3.  **`three-pinata`**: Reference for creating physics-reactive low-poly models using jointed rigid bodies.
4.  **`img2threejs`**: Exists in `Tools/img2threejs`. We can feed reference images of German townhouses or courier bikes to this tool to output clean, procedural TypeScript classes that compile these models from primitive Three.js geometries.

---

## 2. Dark Store Groceries (8 Items)

### Required Assets
*   🥛 **Milk Carton (die Milch)**: White rectangular box with a red cylinder cap.
*   🍎 **Apple (der Apfel)**: Red sphere with a bent stem.
*   🍞 **Bread (das Brot)**: Rounded loaf box.
*   💧 **Water Bottle (das Wasser)**: Light-blue cylinder with a dark blue cap.
*   🍌 **Banana (die Banane)**: Yellow curved cylinder.
*   🧀 **Cheese Wedge (der Käse)**: Yellow partial-cylinder wedge.
*   🥚 **Egg (das Ei)**: Beige egg-shaped spheroid.
*   🥕 **Carrot (die Karotte)**: Orange cone with green leafy tops.

### Procedural Tooling Strategy
1.  **Parametric Lathe / Extrude Geometries**: We can define 2D spline curves representing cross-sections of fruits/bottles and use `LatheGeometry` or `ExtrudeGeometry` in Three.js to sweep them into smooth, lightweight 3D models.
2.  **Custom Cel-Shaders**: To give these basic models a unified "Berlin Graphic Novel" hand-drawn visual style, we apply a 3-band quantizing Cel Shader.

---

## 3. Audio & Voice acting (de-DE)

### Required Assets
*   German spoken nouns: "die Milch", "der Apfel", "das Brot", "das Wasser", "die Banane", "der Käse", "das Ei", "die Karotte".
*   Resident intercom responses: "Tür ist auf! Bitte kommen Sie hoch." (success), "Falscher Knopf! Wer ist da?" (failure).

### Procedural Tooling Strategy
1.  **Browser Web Speech API (`SpeechSynthesis`)**: Our primary runtime solution. It runs completely offline using native OS voice modules (e.g., Google or Microsoft de-DE voices).
2.  **`audiocraft` (MusicGen/AudioGen)**: Exists in `Tools/audiocraft`. We can run this local Python library to procedurally generate chiptune synth sounds, backing tracks, ambient street hums, and low-frequency intercom telephone buzzes from text descriptions.

---

## 4. Visual Effects (VFX)

### Required Assets
*   `sparkle_burst`: 8-point green star particle bursts on correct pick.
*   `wet_splash`: Water splash particles for wet hazards.
*   `confetti`: Falling rectangle particles for victory.

### Procedural Tooling Strategy
1.  **Custom Three.js Particle Systems**: We use a dynamic array of instanced meshes inside the animation loop (similar to `src/render/particles.js`). We update their positions using basic gravity physics and scale them down over time to ensure they clean themselves up with zero memory leaks.
