// ============================================================
//  FAR FROM HOME — Central Tuning Config
//  Edit values here to adjust feel without touching logic files.
//  All systems read from window.FFH.CONFIG at runtime.
// ============================================================
window.FFH = window.FFH || {};

window.FFH.CONFIG = {

  // ----------------------------------------------------------
  //  CAMERA — follow camera behaviour in city exploration
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  //  ENVIRONMENT ANIMATION SPEEDS
  // ----------------------------------------------------------
  environment: {
    cloudSpeed: 1.0,
    birdSpeed: 1.0,
    butterflySpeed: 1.0,
    waterSpeed: 1.0
  },
  camera: {
    // Default zoom level on scene entry (OrthographicCamera zoom multiplier).
    // Higher = larger/closer character on screen.
    // Range: [minZoom .. maxZoom]  |  Tested sweet-spot: 2.4 – 3.2
    defaultZoom:  2.88,

    // Minimum zoom (pinch-out / scroll-out limit) — wide overview
    minZoom:      1.0,

    // Maximum zoom (pinch-in / scroll-in limit) — very close over-the-shoulder
    maxZoom:      3.84,

    // Fixed Miniature mode: locks camera to a classic tabletop isometric perspective
    // (no disorienting rotation, no lookahead wall-pushing, no idle sway).
    fixedMiniature: true,

    // Initial camera orbit angle when entering the city (degrees, clockwise from north).
    // 135 = classic isometric SE corner (clean diorama street view)
    startAngleDeg: 135,

    // Camera height above the focal point (world units).
    baseHeightFar: 1.15,   // height at minZoom
    baseHeightClose: 0.65,   // height at maxZoom

    // Camera lateral distance behind the player (world units).
    baseDistanceFar: 1.75,  // distance at minZoom
    baseDistanceClose: 0.95, // distance at maxZoom

    // Where the camera looks relative to the player's feet (Y offset).
    lookTargetYOffset: 0.85,

    // Damping speeds
    positionDamp: 10.0,
    focalDampRate: 8.0,

    // Idle drift: 0 for stable tabletop diorama
    idleDriftDelay:  10.0,
    idleDriftAmplitude: 0.0,

    // When the camera looks through a building, it fades out.
    occlusionOpacity: 0.05,

    // Lookahead: set to 0.0 for rock-solid centered miniature framing
    lookaheadFar: 0.0,
    lookaheadClose: 0.0,

    // Mouse wheel zoom sensitivity (zoom units per scroll pixel).
    wheelZoomSensitivity: 0.001,

    // Desktop pointer drag: radians of camera rotation per pixel of drag.
    orbitSensitivity: 0.01,
  },

  // ----------------------------------------------------------
  //  TOUCH / DRAG INPUT — virtual joystick & messenger steering
  // ----------------------------------------------------------
  touch: {
    // True: "Messenger" style — No visible joystick UI. Mouse/Touch drag anywhere steers the character. Camera orbit is disabled.
    // False: Original style — Visible touch joystick on mobile. Mouse drag orbits the camera on desktop.
    messengerStyleInput: true,

    // Dead zone in pixels: thumb must move this far before movement registers.
    // Increase to reduce jitter / false-starts.  Decrease for hair-trigger response.
    deadzone:   18,

    // Outer radius in pixels: thumb at this distance from origin = full speed.
    maxRadius:  75,

    // Response curve exponent (applied to normalised radius → speed).
    // 1.0 = linear.  1.8 = gentle ramp-up, fast only at the rim.  Lower = more sensitive.
    responseCurve: 1.8,

    // Direction smoothing rate (0–1). Lower = smoother but more sluggish.
    // 0.28 = good balance.  0.5 = snappier.  0.15 = very floaty.
    smoothRate: 0.28,

    // Tap detection: max pixels of movement to still count as a tap (not a drag).
    tapMaxDragPx:   16,
    // Tap detection: max milliseconds to count as a tap (not a long-press).
    tapMaxMs:       350,
  },

  // ----------------------------------------------------------
  //  MOVEMENT SPEED — player speed in world units / second
  // ----------------------------------------------------------
  movement: {
    // Joystick / WASD direct-control speed (without e-bike upgrade).
    walkSpeed:  4.2,

    // Joystick / WASD direct-control speed (with e-bike upgrade).
    ebikeSpeed: 7.2,

    // Click-to-move A* pathing speed (without e-bike upgrade).
    pathWalkSpeed:  4.2,

    // Click-to-move A* pathing speed (with e-bike upgrade).
    pathEbikeSpeed: 7.2,

    // Waypoint proximity threshold: how close to a waypoint before it is consumed (world units).
    waypointReach: 0.25,
  },

  // ----------------------------------------------------------
  //  UI / NAVIGATION AIDS — toggle HUD helper features
  // ----------------------------------------------------------
  ui: {
    // ── Navigation Aids (each toggleable independently) ──────
    // 3D rotating arrow above the target building roof.
    questArrowEnabled: true,

    // Pulsing teal ring at the base of the target building.
    questRingEnabled: true,

    // Animated ground-chevron path trail leading to the destination.
    groundChevronsEnabled: false,   // ← OFF: player finds buildings on their own

    // Doorway beam + bouncing arrow + ring at the building entrance.
    doorBeaconEnabled: true,

    // Screen-space distance label + direction arrow indicator.
    distanceIndicatorEnabled: true,

    // Screen minimap toggle (bottom-right overhead mini-view of city).
    minimapEnabled: false,

    // ── Thought Bubble / Inner Monologue Popups ──────────────────────
    thoughtBubble: {
      // true  = characters appear one-by-one (typewriter effect).
      // false = full text appears instantly (default — faster to read).
      typewriterEnabled: false,

      // Characters revealed per second when typewriterEnabled = true.
      // 31  = original "comfortable reading pace"
      // 60  = fast typist feel
      // 120 = nearly instant, but still animated
      typewriterCharsPerSec: 31,

      // Blip sound every N characters while typing (0 = silent).
      // Original value was every 3rd character.
      blipEveryNChars: 3,

      // How long the bubble stays visible AFTER the full text has appeared (ms).
      // Total on-screen time = typewriting time + readingTimeMs.
      readingTimeMs: 2800,

      // Fade-in / fade-out animation duration (ms).
      fadeMs: 400,
    },
  },

  // ----------------------------------------------------------
  //  ENVIRONMENT — sky, clouds, butterflies, and birds tuning
  // ----------------------------------------------------------
  environment: {
    clouds: {
      speedMultiplier: 1.0,  // Global multiplier for cloud drift speed (default: 1.0)
      baseSpeed: 1.2,        // Fallback speed if cloud has no individual speed
      wrapMinX: -15,         // X boundary where clouds reset
      wrapMaxX: 65           // X boundary that triggers reset
    },
    butterflies: {
      wingFlapSpeed: 25.0,   // Wing flapping frequency multiplier (default: 25.0)
      flutterSpeed: 2.0,     // Body hover and orbit oscillation speed (default: 2.0)
      heightBobSpeed: 4.0,   // Up/down bobbing frequency (default: 4.0)
      heightBobAmp: 0.2,     // Height bob amplitude (default: 0.2)
      orbitRadius: 0.4       // Lateral fluttering radius around base (default: 0.4)
    },
    birds: {
      flightSpeedMultiplier: 1.0, // Global multiplier for bird travel speed along loops (default: 1.0)
      baseSpeed: 5.5,             // Default bird cruising speed (default: 5.5)
      wingFlapSpeed: 14.0,        // Wing flapping frequency (default: 14.0)
      wingFlapAmp: 0.45,          // Wing flapping angle amplitude in radians (default: 0.45)
      bankTurnSpeed: 3.0          // Turn rotation smoothing rate (default: 3.0)
    }
  },

};

// ============================================================
//  DIORAMA / ISOMETRIC ROOM NPC POSITIONS
//  Edit these values to tune character placement in any interior:
//  - x: horizontal position (-1.0 to 1.0)
//  - y: floor elevation (0.05 for flat floor/rugs, 0.40 - 0.50 behind counters)
//  - z: depth (-1.2 deep back wall, -0.6 counter line, 0.0 center)
//  - rotY: rotation facing angle (0 = front facing camera, 0.85 = isometric 45 deg)
//  - scale: model scale factor (1.8 - 2.2 fits 2.6m room height nicely)
// ============================================================
window.FFH.ROOM_NPC_PRESETS = {
  // B_PIZZA / PIZZERIA (Mathias Becker behind pizza service counter)
  // Counter is at x: -0.5, y: -0.21, z: -0.6 with height 0.85
  'PIZZERIA': { x: -0.50, y: -0.21, z: -1.05, rotY: 0.15, scale: 2.2 },
  'B_PIZZA': { x: -0.50, y: -0.21, z: -1.05, rotY: 0.15, scale: 2.2 },
  
  // B_BAKERY / BAKERY (Martha Beck behind pastry display showcase)
  // Showcase is at x: -0.4, y: -0.21, z: -0.6 with height 0.85
  'BAKERY': { x: -0.40, y: -0.21, z: -1.05, rotY: 0.15, scale: 2.2 },
  'B_BAKERY': { x: -0.40, y: -0.21, z: -1.05, rotY: 0.15, scale: 2.2 },

  // B_UNI / UNI / UNI_LOBBY (Rita Schneider behind admissions counter)
  'UNI': { x: -0.20, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 },
  'UNI_LOBBY': { x: -0.20, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 },
  'B_UNI': { x: -0.20, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 },

  // B_AUSLAENDER / AUSLAENDER (Dr. Lindemann behind immigration desk)
  'AUSLAENDER': { x: -0.30, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 },
  'B_AUSLAENDER': { x: -0.30, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 },

  // B_WG / WG_ROOM / WG_KITCHEN (Nico standing on the rug in dorm room)
  // No counter in front — stands at floor/rug level (y: -0.21, scale: 1.8 fits room height)
  'WG_ROOM': { x: 0.25, y: -0.18, z: -0.15, rotY: 0.85, scale: 1.8 },
  'WG_KITCHEN': { x: 0.25, y: -0.18, z: -0.15, rotY: 0.85, scale: 1.8 },
  'B_WG': { x: 0.25, y: -0.18, z: -0.15, rotY: 0.85, scale: 1.8 },

  // OTHERS
  'DARKSTORE': { x: -0.50, y: -0.21, z: -0.50, rotY: 0.35, scale: 2.2 },
  'B_DARKSTORE': { x: -0.50, y: -0.21, z: -0.50, rotY: 0.35, scale: 2.2 },
  'RATHAUS': { x: -0.20, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 },
  'B_RATHAUS': { x: -0.20, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 },
  'BANK': { x: -0.30, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 },
  'B_BANK': { x: -0.30, y: -0.21, z: -1.10, rotY: 0.20, scale: 2.2 }
};

