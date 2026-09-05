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
  camera: {
    // Default zoom level on scene entry (OrthographicCamera zoom multiplier).
    // Higher = larger/closer character on screen.
    // Range: [minZoom .. maxZoom]  |  Tested sweet-spot: 2.4 – 3.2
    defaultZoom:  2.88,

    // Minimum zoom (pinch-out / scroll-out limit) — wide overview
    minZoom:      1.0,

    // Maximum zoom (pinch-in / scroll-in limit) — very close over-the-shoulder
    maxZoom:      3.84,

    // Initial camera orbit angle when entering the city (degrees, clockwise from north).
    // 0   = camera behind player looking north (player faces away from you)
    // 45  = isometric SW corner (original default → often blocked by buildings)
    // 90  = camera to the left of player looking east
    // 135 = isometric SE corner
    // 180 = camera in front of player looking south (player faces you)
    // 225 = isometric NE corner (current code default = playerHeading + 180°)
    // 270 = camera to the right of player looking west
    // Try 135 or 180 if buildings block the view at spawn.
    startAngleDeg: 135,

    // Camera height above the focal point (world units).
    // Lower = more horizontal angle, shows buildings ahead.
    // Higher = steeper top-down angle.
    // At defaultZoom the camera uses baseHeightFar; zoomed in uses baseHeightClose.
    baseHeightFar:   0.95,   // height at minZoom
    baseHeightClose: 0.45,   // height at maxZoom

    // Camera lateral distance behind the player (world units).
    baseDistanceFar:   1.7,  // distance at minZoom
    baseDistanceClose: 0.80, // distance at maxZoom

    // Where the camera looks relative to the player's feet (Y offset).
    // 0.7 = waist, 1.1 = head/shoulders, 1.5 = above head (more sky/buildings)
    lookTargetYOffset: 1.1,

    // How quickly the camera rotates to track the player's heading (radians/sec damping exponent).
    // Higher = snappier tracking.  6.5 moving, 3.0 idle are good defaults.
    angleDampMoving: 6.5,
    angleDampIdle:   3.0,

    // How quickly camera position lerps to desired position (exponential damp rate).
    // 12.0 = very responsive.  Lower (e.g. 5.0) = smoother but laggy.
    positionDamp: 12.0,

    // Idle drift: after this many seconds of no input the camera starts a slow drift orbit.
    idleDriftDelay:  10.0,
    // Amplitude of idle drift orbit (radians).
    idleDriftAmplitude: 0.25,

    // When the camera looks through a building, it fades out.
    // 0.0 = completely invisible, 1.0 = solid.
    occlusionOpacity: 0.05,

    // --- Damping & Smoothing ---
    // Lower = softer, slower follow. Higher = stiffer, jerkier.
    angleDampMoving:  4.5,   // was 6.5
    angleDampIdle:    2.0,   // was 3.0

    // Lookahead: how far the camera pushes forward in the direction you are facing
    // Reduce these to stop the camera from "pushing through walls" when the player is stuck against one.
    lookaheadFar:   0.15,    // was 0.35
    lookaheadClose: 0.05,    // was 0.12

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

};

// ============================================================
//  DIORAMA / ISOMETRIC ROOM NPC POSITIONS
//  Use this to manually tweak the Y offset of characters if they are sinking into the floor
// ============================================================
window.FFH.ROOM_NPC_PRESETS = {
  // B_PIZZA / PIZZERIA
  'PIZZERIA':     { x: -0.45, y: 0.05, z: -1.10, rotY: 0.85, scale: 2.6 },
  'B_PIZZA':      { x: -0.45, y: 0.3, z: -1.10, rotY: 0.85, scale: 2.6 },
  
  // B_BAKERY / BAKERY
  'BAKERY':       { x: -0.40, y: 0.05, z: -1.10, rotY: 0.85, scale: 2.6 },
  'B_BAKERY':     { x: -0.40, y: 0.05, z: -1.10, rotY: 0.85, scale: 2.6 },

  // B_UNI / UNI / UNI_LOBBY
  'UNI':          { x: -0.20, y: 0.05, z: -1.15, rotY: 0.85, scale: 2.6 },
  'UNI_LOBBY':    { x: -0.20, y: 0.05, z: -1.15, rotY: 0.85, scale: 2.6 },
  'B_UNI':        { x: -0.20, y: 0.05, z: -1.15, rotY: 0.85, scale: 2.6 },

  // B_AUSLAENDER / AUSLAENDER
  'AUSLAENDER':   { x: -0.30, y: 0.05, z: -1.15, rotY: 0.85, scale: 2.6 },
  'B_AUSLAENDER': { x: -0.30, y: 0.05, z: -1.15, rotY: 0.85, scale: 2.6 },

  // B_WG / WG_ROOM / WG_KITCHEN
  'WG_ROOM':      { x:  0.20, y: 0.05, z: -0.30, rotY: 0.85, scale: 2.6 },
  'WG_KITCHEN':   { x:  0.20, y: 0.05, z: -0.30, rotY: 0.85, scale: 2.6 },
  'B_WG':         { x:  0.20, y: 0.05, z: -0.30, rotY: 0.85, scale: 2.6 },

  // OTHERS
  'DARKSTORE':    { x: -0.60, y: 0.05, z: -0.35, rotY: 0.85, scale: 2.6 },
  'RATHAUS':      { x: -0.20, y: 0.05, z: -1.15, rotY: 0.85, scale: 2.6 },
  'BANK':         { x: -0.30, y: 0.05, z: -1.15, rotY: 0.85, scale: 2.6 }
};

