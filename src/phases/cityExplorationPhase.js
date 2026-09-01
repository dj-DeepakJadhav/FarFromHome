// City Exploration Phase: Mobile touch-first & mouse click-to-move,
// double-tap/click to interact, 2-finger pinch zoom, single finger hold-drag camera orbit.
// (Zero keyboard dependencies).
window.FFH = window.FFH || {};

window.FFH.CityExplorationPhase = class {
  constructor(game) {
    this.game = game;
    this.worldGroup = null;
    this.interactiveMeshes = [];
    this.groundMeshes = [];
    this.buildingColliders = [];
    this.fadedObjects = new Set();
    this.waterMat = null;
    this.clouds = [];
    this.courier = null;
    
    // Day-Night Cycle Lighting
    this.timeOfDay = 0.35;
    this.ambientLight = null;
    this.sunLight = null;
    
    // Player position & Click-to-Move Target
    // Dedicated Road Spawn: Main road right beside your Student WG Room (x: 6, z: 10)
    this.playerPos = new THREE.Vector3(15.6, 0.05, 26.0);
    this.targetMovePos = null;
    this.moveSpeed = this.game.state.upgrades?.ebike ? 20.0 : 12.0; // -40% transit time (12 / 0.6)
    this.playerHeading = Math.PI / 4; // Fixed Isometric Heading (45 degrees)
    this.playerRadius = 0.4;      // Collision cylinder radius
    
    // Standard Fixed Isometric Camera parameters
    this.camDistance = 12.0;
    this.camHeight = 12.0;
    this.camTargetPitch = 0.0;
    
    // Touch & Pointer state
    this.isPointerDown = false;
    this.isDraggingCamera = false;
    this.pointerDownX = 0;
    this.pointerDownY = 0;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.pointerDownTime = 0;
    
    // Camera Zoom & Inspection Pan state (for full world inspection & debugging)
    this.camZoom = 1.0;
    this.targetCamZoom = 1.0;
    this.minCamZoom = 0.22; // Full view of entire 24x24 island diorama
    this.maxCamZoom = 2.5;  // Close-up
    this.initialCamZoom = 1.0;
    this.initialPinchDist = null;
    this.cameraPanOffset = new THREE.Vector3(0, 0, 0);
    this.isPanningCamera = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.initialPanOffset = new THREE.Vector3(0, 0, 0);
    this.debugZoomBar = null;
    
    // Double click / double tap detection
    this.lastTapTime = 0;
    this.lastTapTarget = null;
    
    // Click-to-move destination marker (visual pulse ring)
    this.targetMarker = null;
    
    this.raycaster = new THREE.Raycaster();
    this.occlusionRaycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onContextMenu = (e) => e.preventDefault();
  }

  enter() {
    // Clear previous scene objects
    while (this.game.scene.children.length > 0) {
      const obj = this.game.scene.children[this.game.scene.children.length - 1];
      this.game.scene.remove(obj);
    }

    // Setup Atmosphere & Dynamic Day-Night Lights
    this.setupAtmosphere();

    // Build city world with scaled proportions
    const { worldGroup, interactiveMeshes, waterMat, clouds, butterflies, birds } = window.FFH.buildLubeckCityWorld();
    this.worldGroup = worldGroup;
    this.interactiveMeshes = interactiveMeshes;
    this.waterMat = waterMat;
    this.clouds = clouds;
    this.butterflies = butterflies || [];
    this.birds = birds || [];
    this.game.scene.add(this.worldGroup);

    // 3.2 Compute static geometry bounds tree for sliding collision
    if (window.MeshBVH && window.MeshBVH.StaticGeometryGenerator) {
      // Temporarily hide dynamic objects from worldGroup so they aren't merged
      const hidden = [];
      this.worldGroup.traverse((c) => {
        if (c.userData.speed !== undefined || c.userData.baseX !== undefined || c.userData.centerX !== undefined) {
          if (c.visible) {
            c.visible = false;
            hidden.push(c);
          }
        }
      });
      const generator = new window.MeshBVH.StaticGeometryGenerator(this.worldGroup);
      generator.attributes = ['position'];
      const mergedGeometry = generator.generate().geometry;
      mergedGeometry.computeBoundsTree();
      this.colliderMesh = new THREE.Mesh(mergedGeometry);
      
      // Restore dynamic objects
      hidden.forEach(c => c.visible = true);
    }

    // Spawn 10 Roaming Citizens using the Behavior Tree
    this.roamingCitizens = [];
    this.citizenBehaviorTree = window.FFH.createCitizenBehaviorTree();
    const S = window.FFH.TILE_SCALE || 2.0;
    const roadTiles = [];
    for (let z = 1; z < window.FFH.MAP_SIZE - 1; z++) {
      for (let x = 1; x < window.FFH.MAP_SIZE - 1; x++) {
        if (['R_C', 'R_B', 'BR', 'R_R'].includes(window.FFH.LUBECK_CITY_GRID[z][x])) {
          roadTiles.push({ x: x * S, z: z * S });
        }
      }
    }
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
    for (let i = 0; i < 12; i++) {
      if (roadTiles.length === 0) break;
      const spawnTile = roadTiles[Math.floor(Math.random() * roadTiles.length)];
      const homeTile = roadTiles[Math.floor(Math.random() * roadTiles.length)];
      const modelKey = `NPC_CHAR_${letters[i % letters.length]}`;
      const mesh = window.FFH.createNPCMesh(modelKey);
      mesh.position.set(spawnTile.x, 0.05, spawnTile.z);
      this.game.scene.add(mesh);
      
      this.roamingCitizens.push({
        position: new THREE.Vector3(spawnTile.x, 0.05, spawnTile.z),
        homePosition: new THREE.Vector3(homeTile.x, 0.05, homeTile.z),
        targetPos: null,
        speed: 1.8 + Math.random() * 1.0,
        mesh: mesh,
        isAtHome: false,
        isGreeting: false,
        greetTimer: 0,
        greetCooldown: 0,
        greetTarget: null
      });
    }

    // Extract ground meshes for tap-to-move raycasting
    this.groundMeshes = [];
    this.worldGroup.traverse(child => {
      if (child.isMesh && child.position.y < 0.1) {
        this.groundMeshes.push(child);
      }
    });

    // Build building collision bounds & prepare transparency fading
    this.buildCollisionAndFadeStructures();

    // Setup 3D Courier Character & Destination Marker
    this.setupCourier();
    this.setupTargetMarker();

    // Position third person follower camera
    this.updateCamera(true);

    // Show City Explorer HUD
    this.game.ui.showCityExplorerHUD((action, poiData) => {
      this.handlePOIAction(action, poiData);
    });

    // Attach touch & mouse controls (Zero keyboard needed)
    const dom = this.game.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('touchstart', this.onTouchStart, { passive: false });
    dom.addEventListener('touchmove', this.onTouchMove, { passive: false });
    dom.addEventListener('touchend', this.onTouchEnd);
    dom.addEventListener('wheel', this.onWheel, { passive: false });
    dom.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('keydown', this.onKeyDown);
    
    // Initialize Minimap Data & Debug Zoom UI
    this.setupMinimap();
    this.setupDebugZoomUI();

    if (this.game.state.currentShift === 1) {
      if (this.game.state.activeDelivery) {
        setTimeout(() => {
          this.game.ui.showTutorialBanner("Follow the pulsing marker on the minimap to deliver the groceries! Tap anywhere to move.", 6000);
        }, 1000);
      } else if (this.game.state.questStep === 0) {
        setTimeout(() => {
          this.game.ui.showTutorialBanner("Tap the yellow marker to visit Rita Schneider at the University to inspect your enrollment!", 6000);
        }, 1000);
      }
    }
  }

  setupMinimap() {
    this.staticMapCanvas = document.createElement('canvas');
    this.staticMapCanvas.width = 192;
    this.staticMapCanvas.height = 192;
    const ctx = this.staticMapCanvas.getContext('2d');
    const S = 8; // tile size in px (24 * 8 = 192)

    for (let z = 0; z < window.FFH.MAP_SIZE; z++) {
      for (let x = 0; x < window.FFH.MAP_SIZE; x++) {
        const type = window.FFH.LUBECK_CITY_GRID[z][x];
        let color = '#84A98C'; // Grass
        if (type === 'W') color = '#457B9D';
        else if (type === 'R_C' || type === 'R_B' || type === 'BR') color = '#5C677D';
        else if (type === 'R_R') color = '#A8DADC'; // Roundabouts
        else if (type === 'T') color = '#2D6A4F';
        else if (type.startsWith('B_')) color = '#ECC238'; // POIs
        else if (type.startsWith('A')) color = '#E76F51'; // Residential

        ctx.fillStyle = color;
        ctx.fillRect(x * S, z * S, S, S);
      }
    }
  }

  updateMinimap(timeSec) {
    const container = document.getElementById('minimap-container');
    if (!container || container.style.display === 'none') return;

    const canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear and fill background
    ctx.fillStyle = '#5DB7AD';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mapScale = 8 / window.FFH.TILE_SCALE;
    const px = this.playerPos.x * mapScale;
    const pz = this.playerPos.z * mapScale;

    ctx.save();
    
    // Move to center of minimap canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // Rotate map so UP matches camera forward
    ctx.rotate(this.playerHeading);
    // Translate so player is at the center
    ctx.translate(-px, -pz);

    // Draw static background
    ctx.drawImage(this.staticMapCanvas, 0, 0);

    // Draw Quest or Delivery Target (if active)
    if (this.game.state.activeDelivery && this.game.state.deliveryTarget) {
      const tgt = this.game.state.deliveryTarget;
      const tx = tgt.gridX * (window.FFH.TILE_SCALE) * mapScale;
      const tz = tgt.gridZ * (window.FFH.TILE_SCALE) * mapScale;
      ctx.fillStyle = (Math.sin(timeSec * 8) > 0) ? '#2A9D8F' : '#1C6B61'; // Teal for delivery
      ctx.beginPath();
      ctx.arc(tx, tz, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const currentQuest = window.FFH.prologueQuests[this.game.state.questStep];
      if (currentQuest) {
        const targetMesh = this.interactiveMeshes.find(m => m.userData.type === currentQuest.targetPoi);
        if (targetMesh) {
          const tx = targetMesh.position.x * mapScale;
          const tz = targetMesh.position.z * mapScale;
          
          ctx.fillStyle = (Math.sin(timeSec * 8) > 0) ? '#FFD166' : '#997700';
          ctx.beginPath();
          ctx.arc(tx, tz, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw Player Position
    ctx.fillStyle = '#FF006E';
    ctx.beginPath();
    ctx.arc(px, pz, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Since the map is rotated around the player, the player heading triangle must point in the direction the 3D courier is facing relative to the camera
    ctx.save();
    ctx.translate(px, pz);
    const courierRot = this.courier ? this.courier.rotation.y : 0;
    const relativeAngle = -(courierRot - (this.playerHeading + Math.PI));
    ctx.rotate(relativeAngle);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
  }

  setupTargetMarker() {
    const ringGeo = new THREE.RingGeometry(0.2, 0.35, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2EC4B6, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    this.targetMarker = new THREE.Mesh(ringGeo, ringMat);
    this.targetMarker.rotation.x = -Math.PI / 2;
    this.targetMarker.position.set(0, 0.06, 0);
    this.targetMarker.visible = false;
    this.game.scene.add(this.targetMarker);

    // 3D Quest Hint Group (Arrow + Pillar + Circle)
    this.questHintMarker = new THREE.Group();
    
    // 1. Bouncing Arrow
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0);
    arrowShape.lineTo(0.5, 0.5);
    arrowShape.lineTo(0.2, 0.5);
    arrowShape.lineTo(0.2, 1.2);
    arrowShape.lineTo(-0.2, 1.2);
    arrowShape.lineTo(-0.2, 0.5);
    arrowShape.lineTo(-0.5, 0.5);
    arrowShape.lineTo(0, 0);

    const extrudeSettings = { depth: 0.1, bevelEnabled: false };
    const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);
    arrowGeo.center();
    const arrowMat = new THREE.MeshLambertMaterial({ 
      color: 0xFFD166, 
      emissive: 0x997700,
      depthTest: false,
      transparent: true
    });
    this.questHintArrow = new THREE.Mesh(arrowGeo, arrowMat);
    this.questHintArrow.renderOrder = 999;
    this.questHintArrow.rotation.x = 0; // point down towards building
    this.questHintArrow.scale.set(1.5, 1.5, 1.5);
    this.questHintMarker.add(this.questHintArrow);

    // 2. Glowing Pillar - Skipped (looked weird)
    this.questHintPillar = null;

    // 3. Glowing Ground Circle
    const circleGeo = new THREE.RingGeometry(1.0, 1.5, 32);
    const circleMat = new THREE.MeshBasicMaterial({
      color: 0xFFD166,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });
    this.questHintCircle = new THREE.Mesh(circleGeo, circleMat);
    this.questHintCircle.renderOrder = 998;
    this.questHintCircle.rotation.x = -Math.PI / 2;
    this.questHintCircle.position.y = 0.15; // Just above ground to avoid z-fighting
    this.questHintMarker.add(this.questHintCircle);

    this.questHintMarker.visible = false;
    this.game.scene.add(this.questHintMarker);
  }

  buildCollisionAndFadeStructures() {
    this.buildingColliders = [];
    const S = window.FFH.TILE_SCALE || 2.0;

    for (let z = 0; z < window.FFH.MAP_SIZE; z++) {
      for (let x = 0; x < window.FFH.MAP_SIZE; x++) {
        const type = window.FFH.LUBECK_CITY_GRID[z][x];
        const posX = x * S;
        const posZ = z * S;

        // Solid obstacle types: Buildings, landmarks, and trees
        if (type.startsWith('A') || type.startsWith('B_') || type === 'T') {
          const halfSize = (type === 'T') ? 0.35 : 1.2;
          this.buildingColliders.push({
            minX: posX - halfSize,
            maxX: posX + halfSize,
            minZ: posZ - halfSize,
            maxZ: posZ + halfSize,
            centerX: posX,
            centerZ: posZ
          });
        }
      }
    }

    // Enable transparency on building meshes so they fade when blocking camera
    this.interactiveMeshes.forEach(group => {
      group.traverse(child => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map(m => m.clone());
            child.material.forEach(m => { m.transparent = true; m.opacity = 1.0; });
          } else {
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = 1.0;
          }
        }
      });
    });
  }

  setupAtmosphere() {
    this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
    this.sunLight = new THREE.DirectionalLight(0xFFF1D0, 0.95);
    this.sunLight.position.set(24, 35, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.bias = -0.0006;
    this.sunLight.shadow.normalBias = 0.02;

    this.game.scene.add(this.ambientLight, this.sunLight);
    this.updateAtmosphericTime(0.35);
  }

  updateAtmosphericTime(progress) {
    this.timeOfDay = progress % 1.0;
    const isWinter = this.game && this.game.state && this.game.state.semester === 'WINTER';

    let skyColor, fogColor, lightColor, lightIntensity, ambIntensity;

    if (isWinter) {
      // Wintersemester Palette (Crisp Baltic Winter, Cool Sky, Glowing Windows)
      if (this.timeOfDay < 0.25) {
        skyColor = new THREE.Color(0xD0DCE5);
        fogColor = new THREE.Color(0xC4D7ED);
        lightColor = new THREE.Color(0xF4A261);
        lightIntensity = 0.65;
        ambIntensity = 0.50;
      } else if (this.timeOfDay < 0.6) {
        skyColor = new THREE.Color(0xB8D0EB);
        fogColor = new THREE.Color(0xD0E1FD);
        lightColor = new THREE.Color(0xE8F1F5);
        lightIntensity = 0.85;
        ambIntensity = 0.60;
      } else if (this.timeOfDay < 0.8) {
        skyColor = new THREE.Color(0x3D5A80);
        fogColor = new THREE.Color(0x293241);
        lightColor = new THREE.Color(0xEE6C4D);
        lightIntensity = 0.70;
        ambIntensity = 0.40;
      } else {
        skyColor = new THREE.Color(0x0F172A);
        fogColor = new THREE.Color(0x090D16);
        lightColor = new THREE.Color(0x94A3B8);
        lightIntensity = 0.40;
        ambIntensity = 0.30;
      }
      this.game.scene.background = skyColor;
      this.game.scene.fog = new THREE.FogExp2(fogColor, 0.020);
    } else {
      // Sommersemester Palette (Golden Baltic Sunshine & Warm Canals)
      if (this.timeOfDay < 0.25) {
        skyColor = new THREE.Color(0xFDE2E4);
        fogColor = new THREE.Color(0xFDE2E4);
        lightColor = new THREE.Color(0xFFB703);
        lightIntensity = 0.75;
        ambIntensity = 0.55;
      } else if (this.timeOfDay < 0.6) {
        skyColor = new THREE.Color(0x76C8B8);
        fogColor = new THREE.Color(0xD8F3DC);
        lightColor = new THREE.Color(0xFFFAF0);
        lightIntensity = 0.95;
        ambIntensity = 0.65;
      } else if (this.timeOfDay < 0.8) {
        skyColor = new THREE.Color(0xF4A261);
        fogColor = new THREE.Color(0xE76F51);
        lightColor = new THREE.Color(0xF77F00);
        lightIntensity = 0.85;
        ambIntensity = 0.45;
      } else {
        skyColor = new THREE.Color(0x1D2D44);
        fogColor = new THREE.Color(0x0D1B2A);
        lightColor = new THREE.Color(0x76C8B8);
        lightIntensity = 0.45;
        ambIntensity = 0.35;
      }
      this.game.scene.background = skyColor;
      this.game.scene.fog = new THREE.FogExp2(fogColor, 0.015);
    }

    if (this.ambientLight) this.ambientLight.intensity = ambIntensity;
    if (this.sunLight) {
      this.sunLight.color = lightColor;
      this.sunLight.intensity = lightIntensity;
    }
    if (this.game.sfx) {
      this.game.sfx.playBgm(this.timeOfDay > 0.8 || this.timeOfDay < 0.25 ? 'night' : 'day');
    }
  }

  exit() {
    const dom = this.game.renderer.domElement;
    if (dom) {
      dom.removeEventListener('pointerdown', this.onPointerDown);
      dom.removeEventListener('pointermove', this.onPointerMove);
      dom.removeEventListener('pointerup', this.onPointerUp);
      dom.removeEventListener('touchstart', this.onTouchStart);
      dom.removeEventListener('touchmove', this.onTouchMove);
      dom.removeEventListener('touchend', this.onTouchEnd);
      dom.removeEventListener('wheel', this.onWheel);
      dom.removeEventListener('contextmenu', this.onContextMenu);
    }
    window.removeEventListener('keydown', this.onKeyDown);
    this.removeDebugZoomUI();

    // Reset camera zoom to 1.0 upon leaving exploration
    if (this.game.currentCamera) {
      this.game.currentCamera.zoom = 1.0;
      this.game.currentCamera.updateProjectionMatrix();
    }

    if (this.targetMarker) {
      this.game.scene.remove(this.targetMarker);
      this.targetMarker = null;
    }

    if (this.worldGroup) {
      this.game.scene.remove(this.worldGroup);
      this.worldGroup = null;
    }
    if (this.game.ambienceNode) {
      this.game.ambienceNode.stop();
      this.game.ambienceNode = null;
    }
    
    // Stop E-bike motor if playing
    if (this.game.sfx && this.game.sfx.stopMotor) {
      this.game.sfx.stopMotor();
    }

    // Clear HUD UI
    this.game.ui.clear();
  }

  setupCourier() {
    this.courier = window.FFH.createCourierCharacter();
    this.courier.scale.set(0.9, 0.9, 0.9);
    
    // Equip packed grocery bag (thermal or paper)
    const hasThermal = this.game.state.upgrades?.thermalBag;
    // Thermal bag is glowing orange (0xFF8C00 with emissive)
    const bagMat = hasThermal 
      ? new THREE.MeshLambertMaterial({ color: 0xFF8C00, emissive: 0xFF5500, emissiveIntensity: 0.4 }) 
      : window.FFH.createCelMaterial(0xD4A373);
    const bagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.4), bagMat);
    // Situate it on the back of the courier
    bagMesh.position.set(0, 1.11, -0.4);
    
    // Only show bag if active delivery
    if (this.game.state.activeDelivery) {
      this.courier.add(bagMesh);
    }
    
    this.courier.position.copy(this.playerPos);
    this.game.scene.add(this.courier);

    // Nav Path: High-contrast translucent ribbon highlighter & animated pulsing chevrons
    this.navPathGroup = new THREE.Group();
    this.navPathGroup.visible = false;
    this.game.scene.add(this.navPathGroup);

    // 1. Wide Translucent Glow Ribbon (Highlighter effect)
    this.navRibbonMat = new THREE.MeshBasicMaterial({
      color: 0xFFD166,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false
    });
    this.navRibbonGeo = new THREE.BufferGeometry();
    this.navRibbonMesh = new THREE.Mesh(this.navRibbonGeo, this.navRibbonMat);
    this.navRibbonMesh.renderOrder = 997;
    this.navPathGroup.add(this.navRibbonMesh);

    // 2. Animated Chevrons / Waypoint Markers along the path
    this.navChevronPool = [];
    const chevronShape = new THREE.Shape();
    chevronShape.moveTo(-0.35, -0.28);
    chevronShape.lineTo(0, 0.28);
    chevronShape.lineTo(0.35, -0.28);
    chevronShape.lineTo(0.22, -0.38);
    chevronShape.lineTo(0, 0.05);
    chevronShape.lineTo(-0.22, -0.38);
    chevronShape.closePath();

    const chevronGeo = new THREE.ShapeGeometry(chevronShape);
    chevronGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < 20; i++) {
      const cMat = new THREE.MeshBasicMaterial({
        color: 0xFFF3B0,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
      });
      const cMesh = new THREE.Mesh(chevronGeo, cMat);
      cMesh.renderOrder = 998;
      cMesh.visible = false;
      this.navPathGroup.add(cMesh);
      this.navChevronPool.push(cMesh);
    }
  }

  // --- TOUCH & POINTER GESTURE HANDLING ---

  onTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      // 2-finger pinch zoom initiation
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.initialPinchDist = Math.hypot(dx, dy);
      this.initialCamZoom = this.targetCamZoom;
    }
  }

  onTouchMove(e) {
    if (e.touches.length === 2 && this.initialPinchDist) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / this.initialPinchDist;
      this.setZoom(this.initialCamZoom * factor);
    }
  }

  onTouchEnd(e) {
    if (e.touches.length < 2) {
      this.initialPinchDist = null;
    }
  }

  onPointerDown(e) {
    if (e.target.closest('#title-bar') || e.target.closest('#city-poi-card') || e.target.closest('#debug-zoom-bar') || e.target.closest('#tab-home') || e.target.closest('#tab-work') || e.target.closest('#tab-shop')) return;
    
    this.pointerDownX = e.clientX;
    this.pointerDownY = e.clientY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.pointerDownTime = Date.now();

    // Right-click or middle-click or Shift-drag triggers camera panning
    if (e.button === 2 || e.button === 1 || e.shiftKey) {
      this.isPanningCamera = true;
      this.initialPanOffset.copy(this.cameraPanOffset);
      return;
    }

    this.isPointerDown = true;
    this.isDraggingCamera = false;
  }

  onPointerMove(e) {
    if (this.isPanningCamera) {
      const dx = e.clientX - this.pointerDownX;
      const dy = e.clientY - this.pointerDownY;
      const panScale = (1.0 / (this.camZoom || 1.0)) * 0.04;
      const worldDx = (dx - dy) * panScale;
      const worldDz = (-dx - dy) * panScale;
      this.cameraPanOffset.x = this.initialPanOffset.x - worldDx;
      this.cameraPanOffset.z = this.initialPanOffset.z - worldDz;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      return;
    }

    if (!this.isPointerDown) return;
    const dragDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
    
    if (dragDist > 8) {
      this.isDraggingCamera = true;
      // If zoomed out, drag also allows inspection panning across the city
      if (this.targetCamZoom < 0.6) {
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        const panScale = (1.0 / (this.camZoom || 1.0)) * 0.035;
        this.cameraPanOffset.x -= (dx - dy) * panScale;
        this.cameraPanOffset.z -= (-dx - dy) * panScale;
      }
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    }
  }

  onPointerUp(e) {
    if (this.isPanningCamera) {
      this.isPanningCamera = false;
      return;
    }
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    
    const elapsed = Date.now() - this.pointerDownTime;
    const dragDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);

    // Tap / Click handling (not a camera drag)
    if (dragDist < 8 && elapsed < 400) {
      // Re-center camera on courier if user was close-up
      if (this.cameraPanOffset.lengthSq() > 0.01 && this.targetCamZoom >= 0.7) {
        this.cameraPanOffset.set(0, 0, 0);
      }
      this.handleSingleOrDoubleTap(e);
    }
  }

  handleSingleOrDoubleTap(e) {
    const now = Date.now();
    const isDoubleTap = (now - this.lastTapTime < 350);
    this.lastTapTime = now;

    const rect = this.game.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.game.currentCamera);

    // 1. Check if tapped on an interactive POI Building
    const buildingHits = this.raycaster.intersectObjects(this.interactiveMeshes, true);
    if (buildingHits.length > 0) {
      let root = buildingHits[0].object;
      while (root.parent && !this.interactiveMeshes.includes(root)) {
        root = root.parent;
      }
      if (root.userData && root.userData.poi) {
        const poi = root.userData.poi;
        poi.gridX = root.userData.gridX;
        poi.gridZ = root.userData.gridZ;

        if (isDoubleTap) {
          // Double click/tap to directly enter/interact
          this.handlePOIAction(poi.action, poi);
        } else {
          // Single tap shows inspection card and walks toward building entrance
          this.game.ui.showPOICard(poi, root.position);
          this.setMoveTarget(root.position.x, root.position.z);
        }
        return;
      }
    }

    // 2. Click-to-Move on ground/street
    const groundHits = this.raycaster.intersectObjects(this.groundMeshes, true);
    if (groundHits.length > 0) {
      const hitPoint = groundHits[0].point;
      this.setMoveTarget(hitPoint.x, hitPoint.z);
    }
  }

  setMoveTarget(targetX, targetZ) {
    const S = window.FFH.TILE_SCALE || 2.0;
    const gridX = Math.round(targetX / S);
    const gridZ = Math.round(targetZ / S);
    const tile = window.FFH.LUBECK_CITY_GRID[gridZ] ? window.FFH.LUBECK_CITY_GRID[gridZ][gridX] : 'W';

    // Don't walk directly into deep water
    if (tile !== 'W') {
      this.targetMovePos = new THREE.Vector3(targetX, 0.05, targetZ);
      if (this.targetMarker) {
        this.targetMarker.position.set(targetX, 0.06, targetZ);
        this.targetMarker.visible = true;
      }
    }
  }

  onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.16 : 0.86;
    this.setZoom(this.targetCamZoom * factor);
  }

  setZoom(val) {
    this.targetCamZoom = Math.max(this.minCamZoom, Math.min(this.maxCamZoom, val));
    this.updateZoomUI();
  }

  toggleOverview() {
    if (this.targetCamZoom < 0.45) {
      // Return to normal 100% close-up view centered on player
      this.setZoom(1.0);
      this.cameraPanOffset.set(0, 0, 0);
    } else {
      // Zoom out to view entire 24x24 island diorama!
      this.setZoom(0.28);
      // Pan towards island center (12 * 2.6 = 31.2)
      const islandCenterX = 12 * (window.FFH.TILE_SCALE || 2.6);
      const islandCenterZ = 12 * (window.FFH.TILE_SCALE || 2.6);
      this.cameraPanOffset.x = islandCenterX - this.playerPos.x;
      this.cameraPanOffset.z = islandCenterZ - this.playerPos.z;
    }
  }

  onKeyDown(e) {
    if (e.key === '+' || e.key === '=') {
      this.setZoom(this.targetCamZoom * 1.25);
    } else if (e.key === '-' || e.key === '_') {
      this.setZoom(this.targetCamZoom * 0.8);
    } else if (e.key === '0') {
      this.setZoom(1.0);
      this.cameraPanOffset.set(0, 0, 0);
    } else if (e.key === 'o' || e.key === 'O' || e.key === 'm' || e.key === 'M') {
      this.toggleOverview();
    }
  }

  setupDebugZoomUI() {
    this.removeDebugZoomUI();

    const bar = document.createElement('div');
    bar.id = 'debug-zoom-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 84px;
      right: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.94);
      border: 2px solid #264653;
      border-radius: 14px;
      padding: 6px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
      z-index: 999;
      pointer-events: auto;
      user-select: none;
      backdrop-filter: blur(4px);
    `;

    bar.innerHTML = `
      <button id="btn-zoom-in" title="Zoom In (+ or Scroll Up)" style="width:36px;height:36px;border-radius:8px;border:1.5px solid #264653;background:#E9ECEF;font-size:16px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#264653;touch-action:manipulation;">🔍+</button>
      <button id="btn-zoom-reset" title="Reset 100% (0)" style="width:40px;height:24px;border-radius:6px;border:1.5px solid #264653;background:#FFF;font-size:11px;font-weight:700;cursor:pointer;color:#264653;display:flex;align-items:center;justify-content:center;touch-action:manipulation;">100%</button>
      <button id="btn-zoom-out" title="Zoom Out (- or Scroll Down)" style="width:36px;height:36px;border-radius:8px;border:1.5px solid #264653;background:#E9ECEF;font-size:16px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#264653;touch-action:manipulation;">🔍−</button>
      <button id="btn-zoom-world" title="Toggle Full World Overview (O or M)" style="width:36px;height:36px;border-radius:8px;border:1.5px solid #2A9D8F;background:#2A9D8F;color:#FFF;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:manipulation;">🗺️</button>
    `;

    document.body.appendChild(bar);
    this.debugZoomBar = bar;

    const btnIn = bar.querySelector('#btn-zoom-in');
    const btnOut = bar.querySelector('#btn-zoom-out');
    const btnReset = bar.querySelector('#btn-zoom-reset');
    const btnWorld = bar.querySelector('#btn-zoom-world');

    btnIn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setZoom(this.targetCamZoom * 1.3);
    });

    btnOut.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setZoom(this.targetCamZoom * 0.75);
    });

    btnReset.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setZoom(1.0);
      this.cameraPanOffset.set(0, 0, 0);
    });

    btnWorld.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleOverview();
    });
  }

  updateZoomUI() {
    if (!this.debugZoomBar) return;
    const lbl = this.debugZoomBar.querySelector('#btn-zoom-reset');
    if (lbl) {
      const pct = Math.round(this.targetCamZoom * 100);
      lbl.textContent = `${pct}%`;
    }
    const btnWorld = this.debugZoomBar.querySelector('#btn-zoom-world');
    if (btnWorld) {
      if (this.targetCamZoom < 0.45) {
        btnWorld.style.background = '#E76F51';
        btnWorld.title = 'Exit Overview (Focus Courier)';
      } else {
        btnWorld.style.background = '#2A9D8F';
        btnWorld.title = 'Toggle Full World Overview (O)';
      }
    }
  }

  removeDebugZoomUI() {
    if (this.debugZoomBar && this.debugZoomBar.parentNode) {
      this.debugZoomBar.parentNode.removeChild(this.debugZoomBar);
    }
    this.debugZoomBar = null;
  }

  handlePOIAction(action, poiData) {
    if (!poiData) return;

    // Check if this is our active delivery destination!
    if (this.game.state.activeDelivery && this.game.state.deliveryTarget) {
      const tgt = this.game.state.deliveryTarget;
      if (poiData.gridX === tgt.gridX && poiData.gridZ === tgt.gridZ) {
        this.game.transitionTo('DIALOGUE', { isDelivery: true });
        return;
      }
    }

    let targetNpc = null;
    if (poiData.name.includes('Universität') || poiData.name.includes('University')) {
      targetNpc = 'NPC_RITA';
    } else if (poiData.name.includes('Pizzeria') || poiData.name.includes('Pizza')) {
      targetNpc = 'NPC_MATHIAS';
    } else if (poiData.name.includes('Bakery') || poiData.name.includes('Bäcker')) {
      targetNpc = 'NPC_MARTHA';
    } else if (poiData.name.includes('Dark Store') || poiData.name.includes('Kruma')) {
      targetNpc = 'NPC_NINA';
    } else if (poiData.name.includes('Student Sublet') || poiData.name.includes('Apartment') || poiData.name.includes('WG')) {
      targetNpc = 'NPC_LOKKER';
    } else if (poiData.name.includes('Hostel') || poiData.name.includes('Dorm')) {
      targetNpc = 'NPC_NICO';
    } else if (poiData.name.includes('Rathaus') || poiData.name.includes('Bürgeramt') || poiData.name.includes('Hospital')) {
      targetNpc = 'NPC_VOGEL';
    } else if (poiData.name.includes('Bank') || poiData.name.includes('Sparkasse') || poiData.name.includes('Späti')) {
      targetNpc = 'NPC_WEBER';
    } else if (poiData.name.includes('Ausländer') || poiData.name.includes('Office') || poiData.name.includes('Dom')) {
      targetNpc = 'NPC_LINDEMANN';
    }

    if (targetNpc) {
      this.game.transitionTo('DIALOGUE', { npcKey: targetNpc });
    } else {
      this.game.ui.spawnFloatingText(`Visited: ${poiData.name}`, window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
      if (this.game.sfx && this.game.sfx.playSfx) {
        this.game.sfx.playSfx('success');
      }
    }
  }

  checkBuildingCollision(posX, posZ) {
    const r = this.playerRadius;
    for (const b of this.buildingColliders) {
      if (posX + r > b.minX && posX - r < b.maxX &&
          posZ + r > b.minZ && posZ - r < b.maxZ) {
        return true;
      }
    }
    return false;
  }

  update(delta) {
    const timeSec = this.game.clock.getElapsedTime();

    // 1. Water waves
    if (this.waterMat && this.waterMat.uniforms && this.waterMat.uniforms.uTime) {
      this.waterMat.uniforms.uTime.value = timeSec;
    }

    // 2. Day-Night cycle
    this.updateAtmosphericTime((this.timeOfDay + delta * 0.008) % 1.0);

    // 3. Move Floating Clouds
    this.clouds.forEach(cloud => {
      cloud.position.x += (cloud.userData.speed || 0.5) * delta;
      if (cloud.position.x > 40) cloud.position.x = -8;
    });

    // Animate Butterflies
    if (this.butterflies) {
      this.butterflies.forEach(bf => {
        const elapsed = timeSec + bf.userData.seed;
        const leftWing = bf.getObjectByName('leftWing');
        const rightWing = bf.getObjectByName('rightWing');
        if (leftWing && rightWing) {
          leftWing.rotation.y = Math.sin(elapsed * 25) * 0.8;
          rightWing.rotation.y = -Math.sin(elapsed * 25) * 0.8;
        }
        bf.position.y = 0.35 + Math.sin(elapsed * 4) * 0.2;
        bf.position.x = bf.userData.baseX + Math.sin(elapsed * 2) * 0.4;
        bf.position.z = bf.userData.baseZ + Math.cos(elapsed * 2) * 0.4;
      });
    }

    // Animate Birds
    if (this.birds) {
      this.birds.forEach(bird => {
        bird.userData.angle += delta * bird.userData.speed * 0.4;
        const x = bird.userData.centerX + Math.cos(bird.userData.angle) * bird.userData.radius;
        const z = bird.userData.centerZ + Math.sin(bird.userData.angle) * bird.userData.radius;
        bird.position.x = x;
        bird.position.z = z;
        bird.rotation.y = -bird.userData.angle;
        
        const leftWing = bird.getObjectByName('leftWing');
        const rightWing = bird.getObjectByName('rightWing');
        if (leftWing && rightWing) {
          leftWing.rotation.z = Math.sin(timeSec * 14) * 0.5;
          rightWing.rotation.z = -Math.sin(timeSec * 14) * 0.5;
        }
      });
    }

    // Tick Roaming Citizens using Behavior Tree
    if (this.roamingCitizens && this.citizenBehaviorTree) {
      this.roamingCitizens.forEach(citizen => {
        this.citizenBehaviorTree.tick(citizen, delta, this.game);
      });
    }

    // 4. Click-to-Move Pathing & Collision Handling
    if (this.targetMovePos) {
      const dist = Math.hypot(this.targetMovePos.x - this.playerPos.x, this.targetMovePos.z - this.playerPos.z);
      
      if (dist > 0.2) {
        const dirX = ((this.targetMovePos.x - this.playerPos.x) / dist) * this.moveSpeed * delta;
        const dirZ = ((this.targetMovePos.z - this.playerPos.z) / dist) * this.moveSpeed * delta;

        const S = window.FFH.TILE_SCALE || 2.0;
        const maxLimit = (window.FFH.MAP_SIZE - 2) * S;

        const targetX = THREE.MathUtils.clamp(this.playerPos.x + dirX, S, maxLimit);
        const targetZ = THREE.MathUtils.clamp(this.playerPos.z + dirZ, S, maxLimit);

        let nextX = this.playerPos.x;
        let nextZ = this.playerPos.z;

        if (this.colliderMesh) {
          const radius = this.playerRadius || 0.4;
          const playerHeight = radius + 0.1; // Float slightly above floor to ignore flat ground collisions
          
          const targetPos = new THREE.Vector3(targetX, playerHeight, targetZ);
          const tempBox = new THREE.Box3();
          const tempMat = new THREE.Matrix4();
          const tempVec = new THREE.Vector3();

          tempMat.copy(this.colliderMesh.matrixWorld).invert();
          tempVec.copy(targetPos).applyMatrix4(tempMat);

          this.colliderMesh.geometry.boundsTree.shapecast({
            intersectsBounds: box => {
              tempBox.copy(box).expandByScalar(radius);
              return tempBox.containsPoint(tempVec);
            },
            intersectsTriangle: tri => {
              const closestPoint = new THREE.Vector3();
              tri.closestPointToPoint(tempVec, closestPoint);
              const dist = closestPoint.distanceTo(tempVec);
              if (dist < radius) {
                const dir = new THREE.Vector3().subVectors(tempVec, closestPoint).normalize();
                // We only want to push horizontally to avoid climbing walls
                dir.y = 0;
                if (dir.lengthSq() > 0.0001) {
                  dir.normalize();
                  const diff = radius - dist;
                  tempVec.addScaledVector(dir, diff);
                }
              }
            }
          });

          targetPos.copy(tempVec).applyMatrix4(this.colliderMesh.matrixWorld);
          
          // Only update if we didn't get pushed all the way back
          nextX = targetPos.x;
          nextZ = targetPos.z;
        } else {
          // Fallback to old AABB collision
          const gridX = Math.round(targetX / S);
          const curGridZ = Math.round(this.playerPos.z / S);
          const tileX = window.FFH.LUBECK_CITY_GRID[curGridZ] ? window.FFH.LUBECK_CITY_GRID[curGridZ][gridX] : 'W';
          if (tileX !== 'W' && !this.checkBuildingCollision(targetX, this.playerPos.z)) {
            nextX = targetX;
          }

          const curGridX = Math.round(nextX / S);
          const gridZ = Math.round(targetZ / S);
          const tileZ = window.FFH.LUBECK_CITY_GRID[gridZ] ? window.FFH.LUBECK_CITY_GRID[gridZ][curGridX] : 'W';
          if (tileZ !== 'W' && !this.checkBuildingCollision(nextX, targetZ)) {
            nextZ = targetZ;
          }
        }

        // Check if movement is negligible after collision resolution
        const distMoved = Math.hypot(nextX - this.playerPos.x, nextZ - this.playerPos.z);
        if (distMoved < 0.001) {
          this.targetMovePos = null;
          if (this.targetMarker) this.targetMarker.visible = false;
          if (this.game.state.upgrades?.ebike) this.game.sfx.setMotorIntensity(0);
        } else {
          this.playerPos.x = nextX;
          this.playerPos.z = nextZ;

          if (this.courier) {
            this.courier.position.x = this.playerPos.x;
            this.courier.position.z = this.playerPos.z;
            const moveAngle = Math.atan2(dirX, dirZ);
            this.courier.rotation.y = THREE.MathUtils.lerp(this.courier.rotation.y, moveAngle, delta * 14);
          }

          if (window.FFH.updateCourierWalk && this.courier) {
            window.FFH.updateCourierWalk(this.courier, delta, 1.0);
          }
          if (this.game.state.upgrades?.ebike) this.game.sfx.setMotorIntensity(1.0);
        }
      } else {
        // Arrived at destination
        this.targetMovePos = null;
        if (this.targetMarker) this.targetMarker.visible = false;
        if (window.FFH.updateCourierWalk && this.courier) {
          window.FFH.updateCourierWalk(this.courier, delta, 0);
        }
        if (this.game.state.upgrades?.ebike) this.game.sfx.setMotorIntensity(0);
      }
    } else {
      if (window.FFH.updateCourierWalk && this.courier) {
        window.FFH.updateCourierWalk(this.courier, delta, 0);
      }
      if (this.game.state.upgrades?.ebike) this.game.sfx.setMotorIntensity(0);
    }

    // Pulse target marker ring
    if (this.targetMarker && this.targetMarker.visible) {
      const scale = 1.0 + Math.sin(timeSec * 8) * 0.15;
      this.targetMarker.scale.set(scale, scale, scale);
    }
    
    // Quest/Delivery Hint Marker Update
    let targetMesh = null;
    const TUITION_GOAL = window.FFH.ECONOMY?.TUITION_GOAL || 250;

    if (this.game.state.wallet >= TUITION_GOAL) {
      // 4.5 Win Condition: Highlight University Registry when wallet hits €250
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === 'B_UNI');
    } else if (this.game.state.activeDelivery && this.game.state.deliveryTarget) {
      const tgt = this.game.state.deliveryTarget;
      targetMesh = this.interactiveMeshes.find(m => m.userData.gridX === tgt.gridX && m.userData.gridZ === tgt.gridZ);
    } else if (this.game.state.questStep < 4 && this.game.state.currentShift === 1) {
      const currentQuest = window.FFH.prologueQuests[this.game.state.questStep];
      if (currentQuest) {
        targetMesh = this.interactiveMeshes.find(m => m.userData.type === currentQuest.targetPoi);
      }
    }

    if (targetMesh && this.questHintMarker) {
      this.questHintMarker.visible = true;
      this.questHintMarker.position.set(targetMesh.position.x, 0, targetMesh.position.z);
      
      if (this.questHintArrow) {
        let height = 3.0;
        if (targetMesh.userData.type && targetMesh.userData.type.startsWith('A')) {
          height = 4.5;
        } else if (targetMesh.userData.height) {
          height = targetMesh.userData.height;
        }
        this.questHintArrow.position.y = height + 1.2 + Math.sin(timeSec * 4) * 0.3;
        this.questHintArrow.rotation.y += delta * 2.5; 
      }

      if (this.questHintCircle) {
        const circleScale = 1.0 + Math.sin(timeSec * 5) * 0.15;
        this.questHintCircle.scale.set(circleScale, circleScale, circleScale);
      }

      // Navigation Ground Path: Translucent Highlighter Ribbon & Animated Chevrons
      if (this.navPathGroup) {
        this.navPathGroup.visible = true;

        const isDelivery = this.game.state.activeDelivery;
        const mainColor = isDelivery ? 0x2EC4B6 : 0xFFD166;
        const chevronColor = isDelivery ? 0xCBF3F0 : 0xFFF3B0;

        this.navRibbonMat.color.setHex(mainColor);
        this.navRibbonMat.opacity = 0.35 + Math.sin(timeSec * 3) * 0.08; // subtle breathing glow

        // Build 3D Manhattan waypoints on the street grid
        const waypoints = [];
        waypoints.push(new THREE.Vector3(this.playerPos.x, 0.28, this.playerPos.z));

        const midX = (Math.abs(this.playerPos.x - targetMesh.position.x) > Math.abs(this.playerPos.z - targetMesh.position.z))
          ? targetMesh.position.x
          : this.playerPos.x;
        const midZ = (midX === targetMesh.position.x)
          ? this.playerPos.z
          : targetMesh.position.z;

        waypoints.push(new THREE.Vector3(midX, 0.28, midZ));
        waypoints.push(new THREE.Vector3(targetMesh.position.x, 0.28, targetMesh.position.z));

        // Generate wide ribbon mesh along waypoints (width = 0.65 units)
        const ribbonWidth = 0.65;
        const positions = [];
        const indices = [];

        // Build segments
        let vertCount = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
          const p1 = waypoints[i];
          const p2 = waypoints[i + 1];
          const dir = new THREE.Vector3().subVectors(p2, p1);
          const len = dir.length();
          if (len < 0.05) continue;
          dir.normalize();

          // Normal perpendicular on horizontal XZ plane
          const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(ribbonWidth / 2);

          const v0 = new THREE.Vector3().addVectors(p1, perp);
          const v1 = new THREE.Vector3().subVectors(p1, perp);
          const v2 = new THREE.Vector3().addVectors(p2, perp);
          const v3 = new THREE.Vector3().subVectors(p2, perp);

          positions.push(
            v0.x, v0.y, v0.z,
            v1.x, v1.y, v1.z,
            v2.x, v2.y, v2.z,
            v3.x, v3.y, v3.z
          );

          indices.push(
            vertCount, vertCount + 1, vertCount + 2,
            vertCount + 1, vertCount + 3, vertCount + 2
          );
          vertCount += 4;
        }

        if (positions.length > 0) {
          this.navRibbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          this.navRibbonGeo.setIndex(indices);
          this.navRibbonGeo.computeVertexNormals();
        }

        // Place and animate moving chevrons along the path
        const totalDist = waypoints.reduce((acc, p, idx) => {
          if (idx === 0) return 0;
          return acc + p.distanceTo(waypoints[idx - 1]);
        }, 0);

        const chevronSpacing = 1.3;
        const speed = 2.4; // speed of moving markers along trail
        const offset = (timeSec * speed) % chevronSpacing;
        let poolIdx = 0;

        let curDist = offset;
        while (curDist < totalDist && poolIdx < this.navChevronPool.length) {
          // Find position and forward direction at curDist along waypoints
          let remaining = curDist;
          let segmentFound = false;

          for (let i = 0; i < waypoints.length - 1; i++) {
            const p1 = waypoints[i];
            const p2 = waypoints[i + 1];
            const segLen = p1.distanceTo(p2);

            if (remaining <= segLen) {
              const t = remaining / segLen;
              const pos = new THREE.Vector3().lerpVectors(p1, p2, t);
              pos.y = 0.32; // float visibly over ribbon
              const dir = new THREE.Vector3().subVectors(p2, p1).normalize();

              const chevron = this.navChevronPool[poolIdx];
              chevron.position.copy(pos);
              chevron.rotation.y = Math.atan2(-dir.z, dir.x) - Math.PI / 2;
              chevron.material.color.setHex(chevronColor);
              chevron.material.opacity = 0.85 + Math.sin(timeSec * 8 + poolIdx) * 0.15;
              chevron.visible = true;

              poolIdx++;
              segmentFound = true;
              break;
            }
            remaining -= segLen;
          }
          curDist += chevronSpacing;
        }

        // Hide unused chevrons
        for (let i = poolIdx; i < this.navChevronPool.length; i++) {
          this.navChevronPool[i].visible = false;
        }
      }

    } else {
      if (this.questHintMarker) this.questHintMarker.visible = false;
      if (this.navPathGroup) this.navPathGroup.visible = false;
    }

    // 5. Update Follower Camera & Building Transparency Fading
    this.updateCamera(false);
    this.updateBuildingOcclusionFade();

    // 6. Update Minimap
    this.updateMinimap(timeSec);

    // 7. Update Distance Indicator and Freshness Decay
    if (this.game.state.activeDelivery && targetMesh) {
      const dx = targetMesh.position.x - this.playerPos.x;
      const dz = targetMesh.position.z - this.playerPos.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      // Determine angle to point the arrow
      const angle = Math.atan2(dx, dz);
      if (this.game.ui.updateCityExplorerHUD) {
        this.game.ui.updateCityExplorerHUD(dist, angle, true);
      }
      
      // Decay freshness
      const decayRate = this.game.state.upgrades?.thermalBag ? 1.0 : 2.0;
      this.game.state.freshness = Math.max(0, this.game.state.freshness - (delta * decayRate));
      
      // Doorway Dialogue Handoff (auto transition when near)
      if (dist < 2.0) {
        // We've stepped up to the customer's doorway!
        this.game.transitionTo('DIALOGUE', { isDelivery: true });
      }
    } else {
      if (this.game.ui.updateCityExplorerHUD) {
        this.game.ui.updateCityExplorerHUD(0, 0, false);
      }
    }
  }

  updateCamera(snap = false) {
    const cam = this.game.currentCamera;
    if (!cam) return;

    // Smoothly interpolate zoom on the OrthographicCamera
    this.camZoom = THREE.MathUtils.lerp(this.camZoom || 1.0, this.targetCamZoom || 1.0, 0.15);
    if (Math.abs(cam.zoom - this.camZoom) > 0.001) {
      cam.zoom = this.camZoom;
      cam.updateProjectionMatrix();
    }

    // High Isometric Bird's-Eye Offset
    const offsetX = 15;
    const offsetY = 20;
    const offsetZ = 15;

    const lookTargetX = this.playerPos.x + (this.cameraPanOffset ? this.cameraPanOffset.x : 0);
    const lookTargetY = this.playerPos.y;
    const lookTargetZ = this.playerPos.z + (this.cameraPanOffset ? this.cameraPanOffset.z : 0);

    const camX = lookTargetX + offsetX;
    const camY = lookTargetY + offsetY;
    const camZ = lookTargetZ + offsetZ;

    if (snap) {
      cam.position.set(camX, camY, camZ);
    } else {
      cam.position.x = THREE.MathUtils.lerp(cam.position.x, camX, 0.1);
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, camY, 0.1);
      cam.position.z = THREE.MathUtils.lerp(cam.position.z, camZ, 0.1);
    }

    cam.lookAt(lookTargetX, lookTargetY, lookTargetZ);
  }

  updateBuildingOcclusionFade() {
    const cam = this.game.currentCamera;
    if (!cam) return;
    if (this.camZoom < 0.6) return; // Keep all buildings solid in wide overview mode

    const charPos = new THREE.Vector3(this.playerPos.x, this.playerPos.y + 0.8, this.playerPos.z);
    const camPos = cam.position.clone();
    const rayDir = new THREE.Vector3().subVectors(charPos, camPos).normalize();
    const rayDist = camPos.distanceTo(charPos);

    this.occlusionRaycaster.set(camPos, rayDir);
    this.occlusionRaycaster.near = 0.5;
    this.occlusionRaycaster.far = rayDist - 0.2;

    const hits = this.occlusionRaycaster.intersectObjects(this.interactiveMeshes, true);
    const currentlyHitMeshes = new Set();

    hits.forEach(hit => {
      let root = hit.object;
      while (root.parent && !this.interactiveMeshes.includes(root)) {
        root = root.parent;
      }
      currentlyHitMeshes.add(root);
    });

    currentlyHitMeshes.forEach(group => {
      this.fadedObjects.add(group);
      group.traverse(child => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => {
            m.opacity = THREE.MathUtils.lerp(m.opacity, 0.25, 0.2);
          });
        }
      });
    });

    this.fadedObjects.forEach(group => {
      if (!currentlyHitMeshes.has(group)) {
        let allRestored = true;
        group.traverse(child => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
              m.opacity = THREE.MathUtils.lerp(m.opacity, 1.0, 0.15);
              if (m.opacity < 0.98) allRestored = false;
            });
          }
        });
        if (allRestored) {
          this.fadedObjects.delete(group);
        }
      }
    });
  }
};
