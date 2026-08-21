# Far From Home: Kruma Express (Arbeit & Sprache)
## VISUAL CONCEPT PACKAGE, ART BIBLE & SHADER SPECIFICATION
**Art Direction:** Warm European Low-Poly Diorama with Graphic Inking  
**Target Viewport:** Fixed Portrait 9:16 (390 x 844 px Mobile-Native Aspect Ratio)  
**Asset Sourcing:** Free CC0 / Open Repositories (Quaternius, Poly Pizza, Kay Lousberg, Poly Haven)  
**Lineage:** Aesthetic evolution of the award-winning *Kruma* prototype.

---

## 1. VISUAL PILLARS & AESTHETIC SUMMARY

### Visual Pillars:
1. **Cozy European Low-Poly Diorama:** Isometric and top-down miniature perspectives with clean bevels, soft ambient occlusion, and warm sunlit architectural facades.
2. **Tactile Pastel ASMR:** High-saturation, appetizing pastel tones with bouncy squash-and-stretch particle physics for interactive items.
3. **High-Contrast Mobile Readability:** Strong silhouette definition and clean typographic hierarchy optimized for one-thumb readability on small mobile screens.

### Bookend Scaling:
- **Smallest Interactive Prop:** Single Bio-Egg (*das Ei*) — 0.08m width.
- **Hero Unit:** Orange Courier Bicycle with Kruma Thermal Backpack — 1.75m length.
- **Largest Architectural Asset:** 4-Story Altbau Residential Facade with Hinterhaus Archway — 12.5m height.

---

## 2. COLOR PALETTE & MOOD REFERENCES

### 2.1 Grammatical Gender Operational Palette
Every grocery item and UI manifest entry uses intentional, color-blind accessible dual-signaling:

| Role / Category | Color Name | Hex Code | Purpose & Game Assets |
| :--- | :--- | :--- | :--- |
| **Maskulin (*der*)** | Cobalt Blue | `#3A86FF` | *der Apfel* 🍎, *der Käse* 🧀, *der Kaffee* ☕, *der Tee* 🍵 |
| **Feminin (*die*)** | Coral Red | `#FF006E` | *die Milch* 🥛, *die Tomate* 🍅, *die Banane* 🍌, *die Butter* 🧈 |
| **Neutrum (*das*)** | Warm Purple | `#8338EC` | *das Brot* 🍞, *das Ei* 🥚, *das Wasser* 💧, *das Müsli* 🥣 |
| **Brand Hero** | Kruma Orange | `#FF6B35` | Courier bike frame, thermal backpack, active order badges, CTA buttons |
| **Bike Lane Bonus** | Emerald Mint | `#06D6A0` | *Fahrradweg* asphalt marking, tire streak trails, perfect pick sparkles |
| **Urban Slate** | Asphalt Black | `#2D3142` | Road tiles, cobblestone textures, Altbau slate roofs, primary typography |
| **Background Warmth** | Warm Cream | `#F7F4EA` | Warehouse shelf backing, paper delivery bag, UI cards |

---

## 3. THREE SIGNATURE SHADER OPTIONS (FOR REFERENCE & IMPLEMENTATION)

### 3.1 SHADER OPTION A: "Berlin Graphic Novel" (Risograph Halftone + Sobel Ink) [HERO CHOICE]
- **The Look:** Inspired by European indie graphic novels and *Into the Spider-Verse*. Vibrant pastel fills overlaid with a dark slate outline (`#2D3142`) and subtle shadow halftone stippling.
- **Why It Works:** Unifies disparate free assets (Quaternius + Poly Pizza) under a single hand-inked aesthetic while costing zero external texture bandwidth.
- **GLSL Implementation:**
```glsl
// Custom Three.js Cel + Halftone Fragment Shader
uniform vec3 uColor;
uniform vec3 uLightDir;
uniform vec2 uResolution;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDir);
    float nDotL = max(dot(normal, lightDir), 0.0);
    
    // 3-Step Quantized Cel Bands
    float cel = smoothstep(0.0, 0.05, nDotL) * 0.4 + 
                smoothstep(0.4, 0.45, nDotL) * 0.35 + 
                smoothstep(0.8, 0.85, nDotL) * 0.25;
                
    // Procedural Screen-Space Halftone in deep shadows
    vec2 screenCoord = gl_FragCoord.xy;
    float pattern = sin(screenCoord.x * 0.7) * cos(screenCoord.y * 0.7);
    float shadowMask = step(nDotL, 0.25) * step(0.0, pattern) * 0.15;
    
    vec3 finalColor = uColor * (cel + 0.25 - shadowMask);
    gl_FragColor = vec4(finalColor, 1.0);
}
```

### 3.2 SHADER OPTION B: "Tilt-Shift Wet Diorama" (Rain Specular & Depth Blur)
- **The Look:** Handcrafted miniature diorama with soft vertical portrait depth-of-field blur and dynamic street puddle reflections for rainy evening shifts.
- **Why It Works:** Sets an atmospheric, cinematic mood for Shift 3 (Night Hospital Delivery) and makes the mobile viewport feel like an interactive toybox.
- **GLSL Implementation:**
```glsl
// Tilt-Shift Depth Blur Vertex/Fragment Snippet
uniform float uFocusY;    // 0.5 (Screen Center)
uniform float uBlurAmount; // 0.004
varying vec2 vUv;

void main() {
    float dist = abs(vUv.y - uFocusY);
    float blur = smoothstep(0.15, 0.5, dist) * uBlurAmount;
    // Box-filter blur sampling along screen vertical axis
    vec4 col = vec4(0.0);
    col += texture2D(tDiffuse, vUv + vec2(0.0, blur * 2.0)) * 0.15;
    col += texture2D(tDiffuse, vUv + vec2(0.0, blur)) * 0.35;
    col += texture2D(tDiffuse, vUv) * 0.5;
    gl_FragColor = col;
}
```

### 3.3 SHADER OPTION C: "Bauhaus Quantized Duotone" (Architectural Geometry)
- **The Look:** High-contrast graphic poster aesthetic honoring 1920s Weimar Bauhaus posters. Luminance is mapped into fixed 4-color block palettes.
- **Why It Works:** Perfect outdoor mobile visibility with zero visual clutter and instant silhouette readability.
- **GLSL Implementation:**
```glsl
// Bauhaus 4-Tone Luminance Mapping Fragment Shader
uniform vec3 cCream;  // #F7F4EA
uniform vec3 cSlate;  // #2D3142
uniform vec3 cOrange; // #FF6B35
uniform vec3 cMint;   // #06D6A0

void main() {
    float lum = dot(texture2D(tDiffuse, vUv).rgb, vec3(0.299, 0.587, 0.114));
    vec3 finalColor = cSlate;
    if (lum > 0.75) finalColor = cCream;
    else if (lum > 0.5) finalColor = cOrange;
    else if (lum > 0.25) finalColor = cMint;
    gl_FragColor = vec4(finalColor, 1.0);
}
```

---

## 4. GAMEPLAY SCREEN MOCKUPS & UI WIREFRAMES

### 4.1 Screen Mockup 1: Dark-Store Picking Station (Phase 1)
```text
+-----------------------------------+ [390 x 844 px]
| [ Tuition: 165€ / 250€ ] [Shift 2]| <-- Top HUD: Tuition Goal & Shift
| [ Time: 0:42 ] [ Freshness: 100% ]| <-- Decaying Shift Gauges
+-----------------------------------+
|  ORDER #104 (BESTELLUNG)          |
|  [■] 1x Apple (der Apfel) 🍎      | <-- Maskulin Tag (#3A86FF)
|  [ ] 1x Oat Milk (die Hafermilch) | <-- Feminin Tag (#FF006E)
|  [ ] 1x Bread (das Vollkornbrot)  | <-- Neutrum Tag (#8338EC)
+-----------------------------------+
|           3D WAREHOUSE            |
|            ISOMETRIC              |
|        [Shelf Tier 3: Bread]      |
|        [Shelf Tier 2: Dairy]      |
|        [Shelf Tier 1: Produce]    |
|                                   |
|       [ 📦 PAPER BAG (DROP) ]     | <-- Tap items to drop & pack
+-----------------------------------+
|  🔊 "Die Hafermilch!"             | <-- Native Spoken Audio Trigger
+-----------------------------------+
```

### 4.2 Screen Mockup 2: Top-Down Street Traversal (Phase 2)
```text
+-----------------------------------+
| [ TARGET: Goethestraße 14 (120m) ]| <-- Target Nav Header
| [ Freshness: ████████░░ 78% ]     | <-- Decaying Temperature Bar
+-----------------------------------+
|  |       |       |  [FAHRRADWEG]  |
|  | [CAR] |       |   (GREEN LANE) | <-- +30% Speed Bonus Lane
|  |   ↓   |       |       ↑        |
|  |       | [POT] |   [COURIER 🚲] | <-- Left/Right Binary Touch Zones
|  |       |       |       ↑        |
|  | [SIGN: Hauptstraße ➡️]         | <-- German Road Navigation Sign
+-----------------------------------+
|  [ ◀ LEFT ]       [ RIGHT ▶ ]     | <-- Bottom One-Thumb Controls
+-----------------------------------+
```

### 4.3 Screen Mockup 3: Altbau Intercom Buzzer Puzzle (Phase 3)
```text
+-----------------------------------+
| TICKET: Müller - HH 2. OG R       | <-- Delivery Ticket Prompt
| (Back Courtyard, 2nd Floor, Right)|
+-----------------------------------+
|      AUTHENTIC BRASS INTERCOM     |
|  +-----------------------------+  |
|  | [ Weber - EG ]  [ Koch - EG ] |  |
|  | [ Schmidt 1.OG] [ Schulz 1.OG]|  |
|  | [ Müller 2.OG ]*[ Klein 2.OG]|  | <-- Tap correct buzzer button
|  | [ Bauer HH 3.OG][ Braun HH 3] |  |
|  +-----------------------------+  |
|                                   |
|  DOORSTEP ETIQUETTE CHOICE:       |
|  [A: "Schönen Feierabend!" (Sie)] | <-- Formal (VIP Tip: +20€)
|  [B: "Hier dein Zeug!" (Du)]      | <-- Informal (Base Tip: +2€)
+-----------------------------------+
```
