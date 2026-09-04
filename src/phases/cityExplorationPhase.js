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
    // Dedicated Station Spawn: Cobblestone road right outside ZOB & Hauptbahnhof on North Mainland (x: 4, z: 2)
    this.playerPos = new THREE.Vector3(10.4, 0.05, 5.2);
    this.targetMovePos = null;
    this.hasFirstInteracted = false;
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
    
    // Dynamic Camera Zoom & Atmosphere state (Messenger-style follow to diorama overview)
    this.camZoom = 0.85;
    this.targetCamZoom = 0.85;
    this.minCamZoom = 0.50; // Balanced bird's-eye isometric view of the city diorama
    this.maxCamZoom = 1.35; // Intimate Messenger ground follow
    this.initialCamZoom = 0.85;
    this.initialPinchDist = null;
    this.cameraPanOffset = new THREE.Vector3(0, 0, 0);
    this.isPanningCamera = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.initialPanOffset = new THREE.Vector3(0, 0, 0);
    this.debugZoomBar = null;
    
    // Idle & Narrative Thought state
    this.idleTimer = 0;
    this.idleDriftAngle = 0;
    this.lastThoughtTime = 0;
    this.visitedThoughtZones = new Set();
    
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

  enter(data) {
    // Clear previous scene objects
    while (this.game.scene.children.length > 0) {
      const obj = this.game.scene.children[this.game.scene.children.length - 1];
      this.game.scene.remove(obj);
    }

    // Setup Atmosphere & Dynamic Day-Night Lights
    this.setupAtmosphere();
    if (data && data.timeOfDay !== undefined) {
      this.updateAtmosphericTime(data.timeOfDay);
    }
    if (data && data.spawnPos) {
      this.playerPos.set(data.spawnPos.x, data.spawnPos.y !== undefined ? data.spawnPos.y : 0.05, data.spawnPos.z);
    }

    // Build city world with scaled proportions
    const { worldGroup, interactiveMeshes, waterMat, clouds, butterflies, birds } = window.FFH.buildLubeckCityWorld();
    this.worldGroup = worldGroup;
    this.interactiveMeshes = interactiveMeshes;
    this.waterMat = waterMat;
    this.clouds = clouds;
    this.butterflies = butterflies || [];
    this.birds = birds || [];
    this.game.scene.add(this.worldGroup);

    // 3.2 Initialize unified building box colliders (guarantees zero clipping through buildings)
    this.buildingColliders = (window.FFH.buildingColliders && window.FFH.buildingColliders.length > 0)
      ? window.FFH.buildingColliders
      : (window.FFH.initBuildingColliders ? window.FFH.initBuildingColliders() : []);

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
      if (child.isMesh && child.position.y < 0.1 && !child.userData.isOuterScenery) {
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
    
    // Initialize Minimap Data
    this.setupMinimap();

    // Initialize 3D Pfand Bottle Collectibles (€0.25 each)
    this.setupPfandCollectibles();

    // Step 1: Station Arrival Auto-Trigger for British Comedy Storyline
    if (!this.game.state.hasShownStationArrivalThought && (!data || !data.fromBuildingExit)) {
      this.game.state.hasShownStationArrivalThought = true;
      setTimeout(() => {
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought(
            "So this is Germany. Clean. Tidy. And possessing a bus shelter roughly the size of a toaster. If I try to stand in there, my knees will be in Austria."
          );
        }
        // Then 3.5s later, trigger the initial objective reveal and compass pointing South to WG
        setTimeout(() => {
          if (!this.game.state.firstObjectiveRevealed && this.game.ui && this.game.ui.triggerFirstObjectiveReveal) {
            this.game.ui.triggerFirstObjectiveReveal();
          } else {
            this.revealCompass();
          }
        }, 3600);
      }, 2500);
    }

    if (data && data.fromBuildingExit) {
      this.startBuildingExit();
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
        if (type === 'W') color = '#0096C7'; // Vibrant stylized river water
        else if (type === 'BR') color = '#D4A373'; // Arched stone bridges
        else if (type === 'R_C' || type === 'R_B') color = '#5C677D'; // Car & Radweg roads
        else if (type === 'R_R') color = '#E9D8A6'; // Roundabouts
        else if (type === 'T') color = '#2D6A4F'; // Trees
        else if (type.startsWith('B_')) color = '#F4A261'; // Landmarks & POIs
        else if (type.startsWith('A')) color = '#E76F51'; // Residential quarters

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

  // --- COLLECTIBLE PFAND BOTTLES SYSTEM (€0.25 each, €1.25 max) ---
  setupPfandCollectibles() {
    this.pfandCollectibles = [];
    if (!this.game.state.collectedPfandIds) {
      this.game.state.collectedPfandIds = [];
    }

    // 5 strategically placed bottles along sidewalks/roads across the town
    // Total: 5 x €0.25 = €1.25 (player discovers them accidentally while walking)
    const bottleSpawns = [
      { id: 'pfand_station', x: 12.0, z: 8.5 },      // Just south of ZOB on the walking path
      { id: 'pfand_bridge', x: 14.5, z: 18.0 },       // Near bridge approach
      { id: 'pfand_wg_bench', x: 9.2, z: 24.5 },      // Outside near WG dorm
      { id: 'pfand_market', x: 21.0, z: 24.0 },        // Corner of Rathaus / Market
      { id: 'pfand_bakery', x: 6.5, z: 19.5 }         // Near Bakery Hansa entrance
    ];

    const bottleGroup = new THREE.Group();
    bottleGroup.name = 'pfand_collectibles_group';

    // Materials: Dark green glass with subtle shine, yellow metal cap, golden glowing ground ring
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x2D6A4F, transparent: true, opacity: 0.88 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0xFFD166 });
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xFFD166, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.65,
      depthWrite: false 
    });

    const bodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 10);
    const neckGeo = new THREE.CylinderGeometry(0.035, 0.06, 0.12, 8);
    const capGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8);
    const ringGeo = new THREE.RingGeometry(0.22, 0.40, 16);

    bottleSpawns.forEach(spawn => {
      // Skip if already collected on this save
      if (this.game.state.collectedPfandIds.includes(spawn.id)) return;

      const itemContainer = new THREE.Group();
      itemContainer.position.set(spawn.x, 0.06, spawn.z);

      // 1. Ground Pulsing Ring
      const groundRing = new THREE.Mesh(ringGeo, ringMat.clone());
      groundRing.rotation.x = -Math.PI / 2;
      groundRing.position.y = 0.01;
      itemContainer.add(groundRing);

      // 2. Floating Bottle Mesh
      const bottleMesh = new THREE.Group();
      const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
      bodyMesh.position.y = 0.14;
      const neckMesh = new THREE.Mesh(neckGeo, glassMat);
      neckMesh.position.y = 0.32;
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = 0.39;
      
      bottleMesh.add(bodyMesh, neckMesh, capMesh);
      bottleMesh.position.y = 0.12;
      itemContainer.add(bottleMesh);

      bottleGroup.add(itemContainer);

      this.pfandCollectibles.push({
        id: spawn.id,
        x: spawn.x,
        z: spawn.z,
        container: itemContainer,
        bottleMesh: bottleMesh,
        groundRing: groundRing,
        collected: false
      });
    });

    this.game.scene.add(bottleGroup);
    this.pfandGroup = bottleGroup;
  }

  updatePfandCollectibles(delta, timeSec) {
    if (!this.pfandCollectibles || this.pfandCollectibles.length === 0) return;

    const px = this.playerPos.x;
    const pz = this.playerPos.z;
    const PICKUP_RADIUS = 1.35; // Player touches / walks near it accidentally

    for (let i = this.pfandCollectibles.length - 1; i >= 0; i--) {
      const item = this.pfandCollectibles[i];
      if (item.collected) continue;

      // Animate rotation & bobbing
      item.bottleMesh.rotation.y += delta * 2.2;
      item.bottleMesh.position.y = 0.14 + Math.sin(timeSec * 4 + i) * 0.04;
      
      // Animate ground ring pulse
      const ringScale = 1.0 + Math.sin(timeSec * 5 + i) * 0.18;
      item.groundRing.scale.set(ringScale, ringScale, ringScale);
      item.groundRing.material.opacity = 0.45 + Math.sin(timeSec * 5 + i) * 0.25;

      // Proximity check
      const dist = Math.hypot(px - item.x, pz - item.z);
      if (dist < PICKUP_RADIUS) {
        // Collect!
        item.collected = true;
        this.game.state.collectedPfandIds.push(item.id);
        
        // Canonical Economy: +€0.25
        this.game.state.wallet = window.FFH.round2((this.game.state.wallet || 20) + 0.25);
        if (this.game.ui && this.game.ui.refreshStats) {
          this.game.ui.refreshStats(this.game.state);
        }
        if (this.game.ui && this.game.ui.updatePersistentHUD) {
          this.game.ui.updatePersistentHUD(this.game.state);
        }

        // SFX feedback
        if (this.game.sfx && this.game.sfx.playSfx) {
          this.game.sfx.playSfx('register');
        }

        // Visual floating text feedback
        if (this.game.ui && this.game.ui.spawnFloatingText) {
          this.game.ui.spawnFloatingText('+0.25€ Pfand Deposit! 🍾', window.innerWidth / 2, window.innerHeight * 0.45, '#4CAF50');
        }

        // British Comedy discovery thoughts
        const pfandThoughts = [
          "Wait... there's 25 cents on this empty bottle? In London this is rubbish. Here I'm practically an investment banker.",
          "Another Pfand bottle! That's 25 cents closer to paying university tuition.",
          "Picking up beer bottles on the street... my parents would be so proud of my academic progress."
        ];
        const randomThought = pfandThoughts[Math.floor(Math.random() * pfandThoughts.length)];
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought(randomThought);
        }

        // Quick shrink animation before removing from scene
        let shrinkTimer = 0.25;
        const shrinkInterval = setInterval(() => {
          shrinkTimer -= 0.05;
          if (shrinkTimer <= 0) {
            clearInterval(shrinkInterval);
            if (item.container.parent) {
              item.container.parent.remove(item.container);
            }
          } else {
            const s = shrinkTimer / 0.25;
            item.container.scale.set(s, s, s);
          }
        }, 30);
      }
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
    if (this.inputDisabled) return;
    if (e.target.closest('#title-bar') || e.target.closest('#city-poi-card') || e.target.closest('#tab-home') || e.target.closest('#tab-work') || e.target.closest('#tab-shop')) return;
    
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
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      return;
    }

    if (!this.isPointerDown) return;
    const dragDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
    
    if (dragDist > 8) {
      this.isDraggingCamera = true;
      const dx = e.clientX - this.lastPointerX;
      if (this.manualCameraAngle === undefined) {
        this.manualCameraAngle = this.camCurrentAngle !== undefined ? this.camCurrentAngle : (Math.PI / 4 + Math.PI);
      }
      // Drag horizontally to rotate the camera around the player
      this.manualCameraAngle -= dx * 0.01;
      
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
      this.handleSingleOrDoubleTap(e);
    }
  }

  revealCompass() {
    this.compassRevealed = true;
  }

  handleSingleOrDoubleTap(e) {
    if (!this.hasFirstInteracted) {
      this.hasFirstInteracted = true;
      if (!this.game.state.firstObjectiveRevealed) {
        if (this.game.ui && this.game.ui.triggerFirstObjectiveReveal) {
          this.game.ui.triggerFirstObjectiveReveal();
        }
        return; // Consume the very first tap of a new game to introduce the HUD
      } else {
        this.revealCompass();
      }
    }

    const now = Date.now();
    const isDoubleTap = (now - this.lastTapTime < 350);
    this.lastTapTime = now;

    // --- Dismiss POI card on any canvas tap ---
    // The card is a DOM overlay; once the tap lands on the canvas we
    // always hide it so it never traps the player's movement.
    const poiCard = document.getElementById('city-poi-card');
    if (poiCard && poiCard.style.display !== 'none') {
      poiCard.style.display = 'none';
      if (this.game.ui) this.game.ui.currentActivePOI = null;
      // Don't return — still process the tap as click-to-move below.
    }

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
        const INTERACT_RADIUS = 4 * (window.FFH.TILE_SCALE || 2.6); // 4 tiles
        const dist = Math.hypot(root.position.x - this.playerPos.x, root.position.z - this.playerPos.z);
        
        if (dist > INTERACT_RADIUS) {
          if (this.game.ui && this.game.ui.spawnFloatingText) {
            this.game.ui.spawnFloatingText('Walk closer to interact', e.clientX, e.clientY, '#E76F51');
          }
          return;
        }

        // We are close! Start building entry sequence
        this.startBuildingEntry(root.userData.type, root.position);
        return;
      }
    }

    // 2. Click-to-Move on ground/street
    const groundHits = this.raycaster.intersectObjects(this.groundMeshes, true);
    if (groundHits.length > 0) {
      const hitPoint = groundHits[0].point;
      this.setMoveTarget(hitPoint.x, hitPoint.z);
      this.intendedInteractionPoi = null; // Changed mind, cancel building interaction
    }
  }

  setMoveTarget(targetX, targetZ) {
    const path = (window.FFH.findPath)
      ? window.FFH.findPath(this.playerPos.x, this.playerPos.z, targetX, targetZ)
      : [{ x: targetX, z: targetZ }];

    if (path && path.length > 0) {
      this.playerPath = path;
      const finalTgt = path[path.length - 1];
      this.targetMovePos = new THREE.Vector3(finalTgt.x, 0.05, finalTgt.z);
      if (this.targetMarker) {
        this.targetMarker.position.set(finalTgt.x, 0.06, finalTgt.z);
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
    if (this.targetCamZoom < 0.7) {
      // Return to ground Messenger follow view
      this.setZoom(1.15);
    } else {
      // Zoom out to bird's-eye isometric diorama view
      this.setZoom(0.50);
    }
  }

  onKeyDown(e) {
    if (e.key === '+' || e.key === '=') {
      this.setZoom(this.targetCamZoom * 1.25);
    } else if (e.key === '-' || e.key === '_') {
      this.setZoom(this.targetCamZoom * 0.8);
    } else if (e.key === '0') {
      this.setZoom(1.0);
    } else if (e.key === 'o' || e.key === 'O' || e.key === 'm' || e.key === 'M') {
      this.toggleOverview();
    } else if (e.key === 't' || e.key === 'T') {
      this.cycleTestNPC();
    }
  }

  cycleTestNPC() {
    if (!this.testNpcKeys) {
      this.testNpcKeys = Object.keys(window.FFH.GLB_CHARACTERS_BASE64 || {});
      this.testNpcIndex = 0;
    }
    if (this.testNpcKeys.length === 0) return;

    this.testNpcIndex = (this.testNpcIndex + 1) % this.testNpcKeys.length;
    const testKey = this.testNpcKeys[this.testNpcIndex];
    
    const oldMesh = this.courier;
    const newMesh = window.FFH.createNPCMesh(testKey);
    
    if (newMesh) {
      newMesh.position.copy(oldMesh.position);
      newMesh.rotation.copy(oldMesh.rotation);
      
      this.game.scene.remove(oldMesh);
      this.game.scene.add(newMesh);
      this.courier = newMesh;
      
      if (this.game.ui && this.game.ui.spawnFloatingText) {
        this.game.ui.spawnFloatingText(`🧪 Testing Model: ${testKey}`, window.innerWidth / 2, window.innerHeight * 0.7, '#FF00FF');
      }
      console.log(`[TEST] Swapped player model to: ${testKey}`);
    }
  }

  setupDebugZoomUI() {}
  updateZoomUI() {}
  removeDebugZoomUI() {}

  getDoorPosition(poiType, fallbackPos) {
    const locPositions = {
      'B_ZOB':        { x: 10.4, z:  5.2 },
      'B_BANK':       { x: 41.6, z:  5.2 },
      'B_UNI':        { x: 20.8, z: 15.6 },
      'B_BAKERY':     { x:  7.8, z: 18.2 },
      'B_BURGTOR':    { x: 36.4, z: 18.2 },
      'B_RATHAUS':    { x: 23.4, z: 23.4 },
      'B_PIZZA':      { x: 28.6, z: 23.4 },
      'B_WG':         { x:  7.8, z: 26.0 },
      'B_AUSLAENDER': { x: 36.4, z: 26.0 },
      'B_BIKESHOP':   { x:  7.8, z: 31.2 },
      'B_KINO':       { x: 26.0, z: 31.2 },
      'B_HOLSTEN':    { x: 18.2, z: 33.8 },
      'B_MARIEN':     { x: 57.2, z: 33.8 },
      'B_DOM':        { x: 26.0, z: 44.2 },
      'B_DARKSTORE':  { x:  7.8, z: 46.8 }
    };
    if (locPositions[poiType]) {
      return new THREE.Vector3(locPositions[poiType].x, 0, locPositions[poiType].z);
    }
    // Fallback: estimate door by pulling slightly toward street
    return new THREE.Vector3(fallbackPos.x, 0, fallbackPos.z + 2.6);
  }

  startBuildingEntry(poiType, buildingPos) {
    if (this.isEnteringBuilding) return;
    this.isEnteringBuilding = true;
    this.enteringPoiType = poiType;
    
    // The door is on the street. The building center is inside.
    this.enteringDoorPos = this.getDoorPosition(poiType, buildingPos);
    this.enteringBuildingPos = new THREE.Vector3(buildingPos.x, 0, buildingPos.z);
    
    // We start the entry animation from the door (snap to door to guarantee correct alignment)
    this.playerPos.copy(this.enteringDoorPos);
    this.enteringStartPos = this.enteringDoorPos.clone();
    
    this.enteringTimer = 0;
    this.inputDisabled = true;
    this.targetMovePos = null;
    this.playerPath = [];
    if (this.targetMarker) this.targetMarker.visible = false;
    
    const dx = this.enteringBuildingPos.x - this.enteringDoorPos.x;
    const dz = this.enteringBuildingPos.z - this.enteringDoorPos.z;
    const heading = Math.atan2(dx, dz);
    // Camera behind the player looking at the building
    this.manualCameraAngle = heading + Math.PI;
    this.targetCamZoom = 1.35;
    
    if (this.courier && this.courier.userData && this.courier.userData.playAction) {
       this.courier.rotation.y = heading;
       this.courier.userData.playAction('walk');
    }
  }

  triggerBuildingInteraction(poiType) {
    const sr = this.game.storyRunner;
    const s = this.game.state;
    console.log(`[TBI] poi=${poiType} | buzzed=${s.hasBuzzedWG} | mull=${s.hasDoneMuelltrennung} | uni=${s.hasVisitedLockedUni} | pending=${sr && sr.pendingStoryTarget ? sr.pendingStoryTarget.poi : 'none'}`);

    // Check if it's the pending story target
    if (sr && sr.pendingStoryTarget && poiType === sr.pendingStoryTarget.poi) {
      const nextSceneId = sr.resolveSceneId ? sr.resolveSceneId(sr.pendingStoryTarget.sceneId) : sr.pendingStoryTarget.sceneId;
      sr.pendingStoryTarget = null;
      if (this.game.ui && this.game.ui.hideCompassUI) {
        this.game.ui.hideCompassUI();
      }
      this.game.state.activeObjective = null;
      const qt = document.getElementById('city-quest-tracker');
      if (qt) qt.style.opacity = '0';
      console.log(`CityExploration: Player tapped ${poiType}. Launching scene "${nextSceneId}".`);
      sr.startScene(nextSceneId);
      return;
    }

    let targetNpc = null;
    let storyScene = null;

    // Clean display name mapping for any technical poi names
    const friendlyPoiNames = {
      'B_ZOB': 'Train Station (ZOB)',
      'B_WG': 'Student WG (Apartment)',
      'B_UNI': 'University Campus',
      'B_PIZZA': 'Pizzeria Bella',
      'B_BAKERY': 'Bakery Hansa',
      'B_DARKSTORE': 'Kruma Express Hub',
      'B_RATHAUS': 'Rathaus (City Hall)',
      'B_AUSLAENDER': 'Ausländerbehörde',
      'B_SUPERMARKET': 'Supermarket',
      'LM_MARKTPLATZ': 'Marktplatz'
    };
    const cleanPoiName = friendlyPoiNames[poiType] || poiType.replace(/^B_/, '').replace(/_/g, ' ');

    if (poiType.includes('Universität') || poiType.includes('University') || poiType === 'B_UNI') {
      // University is only relevant once player has finished WG arrival and discovered tuition
      if (this.game.state.hasDoneMuelltrennung && !this.game.state.hasVisitedLockedUni && this.game.ui && this.game.ui.showLockedUniModal) {
        this.game.ui.showLockedUniModal(() => {
          this.game.state.hasVisitedLockedUni = true;
          this.game.state.questStep = 2; // Advance to finding work
          this.game.state.activeObjective = '🍕 Try Pizzeria Bella for work — ask about a job';
          if (this.game.storyRunner) {
            this.game.storyRunner.pendingStoryTarget = { sceneId: 'pizzeria_job', poi: 'B_PIZZA' };
          }
          if (this.game.ui && this.game.ui.updateQuestTracker) {
            this.game.ui.updateQuestTracker();
          }

          // Step 9: Smoothly transition atmosphere to Night Mode (19:00, progress 0.85)!
          let currentProgress = this.timeOfDay || 0.70;
          const targetProgress = 0.88; // Deep Baltic night
          const stepNight = () => {
            if (currentProgress < targetProgress) {
              currentProgress = Math.min(targetProgress, currentProgress + 0.03);
              this.updateAtmosphericTime(currentProgress);
              requestAnimationFrame(stepNight);
            }
          };
          stepNight();

          // British thought on freezing cold night and hunger
          if (this.game.ui && this.game.ui.spawnWandererThought) {
            setTimeout(() => {
              this.game.ui.spawnWandererThought(
                "Great. It's pitch black, freezing cold, and I still don't have a job. Check the lamp posts for flyers."
              );
            }, 1200);
          }

          this.isEnteringBuilding = false;
          this.inputDisabled = false;
          if (window.FFH && window.FFH.saveGame) {
            window.FFH.saveGame(this.game);
          }
          this.startBuildingExit();
        });
        return;
      } else if (!this.game.state.hasDoneMuelltrennung) {
        // Player tried to enter university before dropping luggage at WG
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought("I should drop off my luggage at the student WG first before heading to campus.");
        }
        if (this.game.sfx && this.game.sfx.playSfx) this.game.sfx.playSfx('click');
        this.isEnteringBuilding = false;
        this.inputDisabled = false;
        this.startBuildingExit();
        return;
      }
      targetNpc = 'NPC_RITA';
      storyScene = 'rita_first';
    } else if (poiType.includes('Pizzeria') || poiType.includes('Pizza') || poiType === 'B_PIZZA') {
      if (this.game.state.hasVisitedLockedUni && !this.game.state.hasVisitedPizzeriaJob) {
        if (this.game.ui && this.game.ui.showPizzeriaJobModal) {
          this.game.ui.showPizzeriaJobModal(() => {
            this.game.state.hasVisitedPizzeriaJob = true;
            this.game.state.questStep = 3;
            this.game.state.activeObjective = '🥐 Rejected at Pizzeria! Try Bakery Hansa for work.';
            if (this.game.storyRunner) {
              this.game.storyRunner.pendingStoryTarget = { sceneId: 'bakery_job', poi: 'B_BAKERY' };
            }
            if (this.game.ui && this.game.ui.updateQuestTracker) this.game.ui.updateQuestTracker();
            this.isEnteringBuilding = false;
            this.inputDisabled = false;
            if (window.FFH && window.FFH.saveGame) {
              window.FFH.saveGame(this.game);
            }
            this.startBuildingExit();
          });
        }
        return;
      } else if (!this.game.state.hasVisitedLockedUni) {
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought("The smells of fresh garlic and oregano are intoxicating, but I have places to be right now.");
        }
        if (this.game.sfx && this.game.sfx.playSfx) this.game.sfx.playSfx('click');
        this.isEnteringBuilding = false;
        this.inputDisabled = false;
        this.startBuildingExit();
        return;
      }
      targetNpc = 'NPC_MATHIAS';
      storyScene = 'mathias_loan';
    } else if (poiType.includes('Bakery') || poiType.includes('Bäcker') || poiType === 'B_BAKERY') {
      if (this.game.state.hasVisitedPizzeriaJob && !this.game.state.hasVisitedBakeryJob) {
        if (this.game.ui && this.game.ui.showBakeryJobModal) {
          this.game.ui.showBakeryJobModal(() => {
            this.game.state.hasVisitedBakeryJob = true;
            this.game.state.questStep = 4;
            this.game.state.activeObjective = '🏠 Rejected at Bakery! Head back to WG to sleep.';
            if (this.game.storyRunner) {
              this.game.storyRunner.pendingStoryTarget = { sceneId: 'day1_sleep', poi: 'B_WG' };
            }
            if (this.game.ui && this.game.ui.updateQuestTracker) this.game.ui.updateQuestTracker();
            this.isEnteringBuilding = false;
            this.inputDisabled = false;
            if (window.FFH && window.FFH.saveGame) {
              window.FFH.saveGame(this.game);
            }
            this.startBuildingExit();
          });
        }
        return;
      } else if (!this.game.state.hasVisitedPizzeriaJob) {
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought("Warm crusty rye bread in the window. No time to browse pastries just yet.");
        }
        if (this.game.sfx && this.game.sfx.playSfx) this.game.sfx.playSfx('click');
        this.isEnteringBuilding = false;
        this.inputDisabled = false;
        this.startBuildingExit();
        return;
      }
      targetNpc = 'NPC_MARTHA';
      storyScene = 'martha';
    } else if (poiType.includes('Dark Store') || poiType.includes('Kruma') || poiType === 'B_DARKSTORE') {
      if (this.game.state.day >= 2 || this.game.state.hasSleptDay1) {
        targetNpc = 'NPC_NINA';
        storyScene = 'knot_money';
      } else {
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought("Kruma Express warehouse. Shutter doors are down for the night. Opens tomorrow at 07:00.");
        }
        if (this.game.sfx && this.game.sfx.playSfx) this.game.sfx.playSfx('click');
        this.isEnteringBuilding = false;
        this.inputDisabled = false;
        this.startBuildingExit();
        return;
      }
    } else if (poiType !== 'B_WG_ENTERED' && (poiType.includes('Student Sublet') || poiType.includes('Apartment') || poiType.includes('WG') || poiType === 'B_WG')) {
      if (!this.game.state.hasBuzzedWG && this.game.ui && this.game.ui.showWGBuzzerModal) {
        this.game.ui.showWGBuzzerModal(() => {
          this.game.state.hasBuzzedWG = true;
          if (window.FFH && window.FFH.saveGame) {
            window.FFH.saveGame(this.game);
          }
          this.triggerBuildingInteraction('B_WG_ENTERED');
        });
        return;
      }
      // Buzzed but haven't done Mülltrennung yet — Nico is waiting inside!
      if (this.game.state.hasBuzzedWG && !this.game.state.hasDoneMuelltrennung) {
        this.triggerBuildingInteraction('B_WG_ENTERED');
        return;
      }
      // If returning to WG at night after job hunting, trigger Day 1 sleep cycle!
      if (this.game.state.hasVisitedLockedUni && !this.game.state.hasSleptDay1 && this.game.ui && this.game.ui.showDayRecapModal) {
        this.game.ui.showDayRecapModal(() => {
          this.game.state.hasSleptDay1 = true;
          this.game.state.day = 2;
          this.game.state.questStep = 4;
          this.game.state.activeObjective = 'Tag 2 (07:00): Head to Kruma Express Dark Store for Shift 1!';
          if (this.game.ui && this.game.ui.updateQuestTracker) this.game.ui.updateQuestTracker();
          if (this.game.ui && this.game.ui.refreshStats) this.game.ui.refreshStats(this.game.state);

          // Transition lighting to Day 2 morning dawn (progress 0.30)!
          let currentProgress = this.timeOfDay || 0.88;
          const targetProgress = 0.30;
          this.updateAtmosphericTime(targetProgress);

          if (this.game.ui && this.game.ui.spawnWandererThought) {
            this.game.ui.spawnWandererThought(
              "Day 2. Sun is up, tea is drunk, and my landlord is still threatening eviction. Time to tackle Kruma Express."
            );
          }

          this.isEnteringBuilding = false;
          this.inputDisabled = false;
          if (window.FFH && window.FFH.saveGame) {
            window.FFH.saveGame(this.game);
          }
          this.startBuildingExit();
        });
        return;
      }
      targetNpc = 'NPC_LOKKER';
      storyScene = 'lokker_kaution';
    } else if (poiType === 'B_WG_ENTERED') {
      if (!this.game.state.hasDoneMuelltrennung && this.game.ui && this.game.ui.showMuelltrennungModal) {
        this.game.ui.showMuelltrennungModal((isCorrect) => {
          this.game.state.hasDoneMuelltrennung = true;
          // Trigger the Tuition Notice letter on the desk right after!
          if (this.game.ui && this.game.ui.showTuitionLetterModal) {
            this.game.ui.showTuitionLetterModal(() => {
              this.game.state.questStep = 1; // Direct player to Chapter 2: University
              this.game.state.activeObjective = '🎓 Sprint to University Campus before 17:00!';
              if (this.game.storyRunner) {
                this.game.storyRunner.pendingStoryTarget = { sceneId: 'uni_closed', poi: 'B_UNI' };
              }
              if (this.game.ui && this.game.ui.updateQuestTracker) {
                this.game.ui.updateQuestTracker();
              }
              // Smoothly transition city lighting to warm Golden Hour (16:45)!
              let currentProgress = this.timeOfDay || 0.35;
              const targetProgress = 0.70; // Golden hour amber sunset
              const stepTime = () => {
                if (currentProgress < targetProgress) {
                  currentProgress = Math.min(targetProgress, currentProgress + 0.035);
                  this.updateAtmosphericTime(currentProgress);
                  requestAnimationFrame(stepTime);
                }
              };
              stepTime();

              // British thought bubble on golden hour beauty
              if (this.game.ui && this.game.ui.spawnWandererThought) {
                setTimeout(() => {
                  this.game.ui.spawnWandererThought(
                    "The sun is going down. The city actually looks dead pretty in this golden light. Still completely broke, of course, but the scenery is lovely."
                  );
                }, 1200);
              }

              // Bounce back out to city so player walks to University
              this.isEnteringBuilding = false;
              this.inputDisabled = false;
              if (window.FFH && window.FFH.saveGame) {
                window.FFH.saveGame(this.game);
              }
              this.startBuildingExit();
            });
          } else {
            this.triggerBuildingInteraction('B_WG_ENTERED');
          }
        });
        return;
      }
      targetNpc = 'NPC_LOKKER';
      storyScene = 'lokker_kaution';
    } else if (poiType.includes('Hostel') || poiType.includes('Dorm')) {
      targetNpc = 'NPC_WEBER';
      storyScene = 'the_circle_2';
    } else if (poiType.includes('Ausländer') || poiType.includes('Office') || poiType.includes('Dom') || poiType === 'B_AUSLAENDER') {
      targetNpc = 'NPC_LINDEMANN';
      storyScene = 'act_five';
    }

    if (poiType === 'B_ZOB' || poiType.includes('ZOB') || poiType.includes('Station')) {
      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought(
          "Bus Timetable: 'No buses inside town center. Walk.' Brilliant. Welcome to Germany, mate. Drag your 25kg suitcase across the cobblestones."
        );
      }
      if (this.game.sfx && this.game.sfx.playSfx) {
        this.game.sfx.playSfx('click');
      }
      this.isEnteringBuilding = false;
      this.inputDisabled = false;
      this.startBuildingExit();
      return;
    }

    if (sr && storyScene && (sr.scenesById ? sr.scenesById[storyScene] : sr.scenes[storyScene])) {
      sr.startScene(storyScene);
    } else if (targetNpc) {
      this.game.transitionTo('DIALOGUE', { npcKey: targetNpc });
    } else {
      this.game.ui.spawnFloatingText(`Visited: ${cleanPoiName}`, window.innerWidth / 2, window.innerHeight / 2, '#2EC4B6');
      if (this.game.sfx && this.game.sfx.playSfx) {
        this.game.sfx.playSfx('success');
      }
      // Since there's no scene transition, immediately bounce back out
      this.isEnteringBuilding = false;
      this.inputDisabled = false;
      this.startBuildingExit();
    }
  }

  handlePOIAction(action, poiData) {
    if (!poiData) return;
    
    const INTERACT_RADIUS = 4 * (window.FFH.TILE_SCALE || 2.6); // 4 tiles
    const buildingPos = poiData.mesh ? poiData.mesh.position : (poiData.worldPos || { x: (poiData.gridX || 0) * 2.6, z: (poiData.gridZ || 0) * 2.6 });
    const dist = Math.sqrt(
      Math.pow(this.playerPos.x - buildingPos.x, 2) + 
      Math.pow(this.playerPos.z - buildingPos.z, 2)
    );
    
    if (dist > INTERACT_RADIUS) {
      this.targetMovePos = { x: buildingPos.x, z: buildingPos.z };
      return;
    }

    this.startBuildingEntry(poiData.type || poiData.name, buildingPos);
  }

  checkBuildingCollision(posX, posZ) {
    if (window.FFH.checkBuildingCollision) {
      return window.FFH.checkBuildingCollision(posX, posZ, this.playerRadius);
    }
    const r = this.playerRadius;
    for (const b of (this.buildingColliders || [])) {
      if (posX + r > b.minX && posX - r < b.maxX &&
          posZ + r > b.minZ && posZ - r < b.maxZ) {
        return true;
      }
    }
    return false;
  }

  startBuildingExit() {
    this.isExitingBuilding = true;
    this.enteringTimer = 0;
    this.inputDisabled = true;
    
    if (this.enteringPoiType && this.enteringBuildingPos) {
      // We know exactly where the door is!
      this.exitingStartPos = this.enteringBuildingPos.clone();
      this.exitingTargetPos = this.enteringDoorPos.clone();
      this.playerPos.copy(this.exitingStartPos);
      
      const dx = this.exitingTargetPos.x - this.exitingStartPos.x;
      const dz = this.exitingTargetPos.z - this.exitingStartPos.z;
      const heading = Math.atan2(dx, dz);
      
      if (this.courier) {
        this.courier.scale.setScalar(0.01);
        this.courier.rotation.y = heading;
      }
      this.manualCameraAngle = heading; // Camera looking back at player
    } else {
      // Fallback if enteringPoiType is lost (shouldn't happen)
      if (this.courier) {
        this.courier.scale.setScalar(0.01);
        this.courier.rotation.y += Math.PI; 
        this.exitingStartPos = this.playerPos.clone();
        const exitDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.courier.rotation.y);
        this.exitingTargetPos = this.playerPos.clone().add(exitDir.multiplyScalar(2.5));
        this.manualCameraAngle = this.courier.rotation.y;
      }
    }
    
    this.targetCamZoom = 1.25;
    this.updateCamera(true); // Snap immediately
  }

  update(delta) {
    if (this.isEnteringBuilding) {
      this.enteringTimer += delta;
      const progress = Math.min(this.enteringTimer / 1.5, 1.0);
      
      this.playerPos.lerpVectors(this.enteringStartPos, this.enteringBuildingPos, progress);
      if (this.courier) {
        this.courier.position.copy(this.playerPos);
        const dx = this.enteringBuildingPos.x - this.playerPos.x;
        const dz = this.enteringBuildingPos.z - this.playerPos.z;
        if (Math.hypot(dx, dz) > 0.1) {
           this.courier.rotation.y = Math.atan2(dx, dz);
        }
        this.courier.scale.setScalar(1.0 - progress);
      }
      
      if (progress >= 1.0) {
         this.isEnteringBuilding = false;
         this.inputDisabled = false;
         if (this.courier) this.courier.scale.setScalar(1.0);
         this.triggerBuildingInteraction(this.enteringPoiType);
      }
      this.updateCamera(false);
      return;
    }

    if (this.isExitingBuilding) {
      this.enteringTimer += delta;
      const progress = Math.min(this.enteringTimer / 1.5, 1.0);
      
      this.playerPos.lerpVectors(this.exitingStartPos, this.exitingTargetPos, progress);
      if (this.courier) {
        this.courier.position.copy(this.playerPos);
        this.courier.scale.setScalar(progress);
        if (this.courier.userData && this.courier.userData.playAction) {
           this.courier.userData.playAction('walk');
        }
      }
      
      if (progress >= 1.0) {
         this.isExitingBuilding = false;
         this.inputDisabled = false;
         if (this.courier) {
            this.courier.scale.setScalar(1.0);
            if (this.courier.userData && this.courier.userData.playAction) {
               this.courier.userData.playAction('idle');
            }
         }
         this.manualCameraAngle = undefined; // Return camera to normal isometric follow
         this.targetCamZoom = 1.15;
      }
      this.updateCamera(false);
      return;
    }

    const timeSec = this.game.clock.getElapsedTime();

    // 1. Water waves & Cel Shading
    if (this.waterMat && this.waterMat.uniforms) {
      if (this.waterMat.uniforms.uTime) {
        this.waterMat.uniforms.uTime.value = timeSec;
      }
      if (this.waterMat.uniforms.uCamXZ) {
        this.waterMat.uniforms.uCamXZ.value.set(this.playerPos.x, this.playerPos.z);
      }
    }

    // Time of day is now strictly event-driven (controlled by storyRunner and shifts)
    // this.updateAtmosphericTime((this.timeOfDay + delta * 0.008) % 1.0);

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

    // Animate Birds soaring dynamically between outer forest and historic city landmarks
    if (this.birds) {
      this.birds.forEach(bird => {
        const loop = bird.userData.loop;
        if (!loop || loop.length === 0) return;

        const target = loop[bird.userData.currentWp];
        const dx = target.x - bird.position.x;
        const dy = target.y - bird.position.y;
        const dz = target.z - bird.position.z;
        const dist = Math.hypot(dx, dy, dz);

        if (dist < 2.5) {
          bird.userData.currentWp = (bird.userData.currentWp + 1) % loop.length;
        } else {
          const dirX = dx / dist;
          const dirY = dy / dist;
          const dirZ = dz / dist;
          const step = (bird.userData.speed || 5.0) * delta;

          bird.position.x += dirX * step;
          bird.position.y += dirY * step;
          bird.position.z += dirZ * step;

          // Smoothly rotate to face flight heading
          const targetAngle = Math.atan2(dirX, dirZ);
          bird.rotation.y = THREE.MathUtils.lerp(bird.rotation.y, targetAngle, delta * 3.5);

          // Bank into turns
          const angleDiff = THREE.MathUtils.euclideanModulo(targetAngle - bird.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
          bird.rotation.z = THREE.MathUtils.lerp(bird.rotation.z, -angleDiff * 1.6, delta * 4);

          // Subtle pitch based on climb or descent
          bird.rotation.x = THREE.MathUtils.lerp(bird.rotation.x, -dirY * 0.7, delta * 4);

          // Dynamic wing flapping: energetic climb vs peaceful gliding
          const leftWing = bird.getObjectByName('leftWing');
          const rightWing = bird.getObjectByName('rightWing');
          if (leftWing && rightWing) {
            if (dirY > 0.04) {
              const flap = Math.sin(timeSec * 11 + bird.userData.seed) * 0.65;
              leftWing.rotation.z = flap;
              rightWing.rotation.z = -flap;
            } else {
              const glide = Math.sin(timeSec * 3 + bird.userData.seed) * 0.14;
              leftWing.rotation.z = glide;
              rightWing.rotation.z = -glide;
            }
          }
        }
      });
    }

    // Tick Roaming Citizens using Behavior Tree & update animation mixers
    if (this.roamingCitizens && this.citizenBehaviorTree) {
      this.roamingCitizens.forEach(citizen => {
        this.citizenBehaviorTree.tick(citizen, delta, this.game);
        if (citizen.mesh && window.FFH.updateNPCAnimation) {
          window.FFH.updateNPCAnimation(citizen.mesh, delta);
        }
      });
    }

    // 4. Click-to-Move A* Pathing & Collision Handling
    if (this.playerPath && this.playerPath.length > 0) {
      const currentTgt = this.playerPath[0];
      const dx = currentTgt.x - this.playerPos.x;
      const dz = currentTgt.z - this.playerPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.25) {
        this.playerPath.shift();
        if (this.playerPath.length === 0) {
          this.targetMovePos = null;
          if (this.targetMarker) this.targetMarker.visible = false;
          if (window.FFH.updateCourierWalk && this.courier) {
            window.FFH.updateCourierWalk(this.courier, delta, 0);
          }
          if (this.game.state.upgrades?.ebike) this.game.sfx.setMotorIntensity(0);
        }
      } else {
        const speed = (this.game.state.upgrades?.ebike ? 7.2 : 4.2);
        const step = Math.min(dist, speed * delta);
        const dirX = dx / dist;
        const dirZ = dz / dist;

        const nextX = this.playerPos.x + dirX * step;
        const nextZ = this.playerPos.z + dirZ * step;

        const radius = this.playerRadius || 0.4;
        const resolved = window.FFH.resolveSlidingMovement
          ? window.FFH.resolveSlidingMovement(this.playerPos.x, this.playerPos.z, nextX, nextZ, radius)
          : { x: nextX, z: nextZ };

        this.playerPos.x = resolved.x;
        this.playerPos.z = resolved.z;

        if (this.courier) {
          this.courier.position.x = this.playerPos.x;
          this.courier.position.z = this.playerPos.z;
          const moveAngle = Math.atan2(dirX, dirZ);
          this.courier.rotation.y = THREE.MathUtils.lerp(this.courier.rotation.y, moveAngle, delta * 14);
        }

        if (this.courier && this.courier.userData && this.courier.userData.mixer) {
          window.FFH.updateNPCAnimation(this.courier, delta);
          if (this.courier.userData.playAction && this.courier.userData.currentAction !== this.courier.userData.actions['walk']) {
            this.courier.userData.playAction('walk');
          }
        } else if (window.FFH.updateCourierWalk && this.courier) {
          window.FFH.updateCourierWalk(this.courier, delta, 1.0);
        }

        if (this.game.state.upgrades?.ebike) this.game.sfx.setMotorIntensity(1.0);

        this.idleTimer = 0;
        this.idleDriftAngle = THREE.MathUtils.lerp(this.idleDriftAngle, 0, delta * 5);
      }
    } else {
      if (this.courier && this.courier.userData && this.courier.userData.mixer) {
        window.FFH.updateNPCAnimation(this.courier, delta);
        if (this.courier.userData.playAction) {
          const idleStr = this.courier.userData.actions['idle'] ? 'idle' : 'static';
          if (this.courier.userData.currentAction !== this.courier.userData.actions[idleStr]) {
            this.courier.userData.playAction(idleStr);
          }
        }
      } else if (window.FFH.updateCourierWalk && this.courier) {
        window.FFH.updateCourierWalk(this.courier, delta, 0);
      }
      if (this.game.state.upgrades?.ebike) this.game.sfx.setMotorIntensity(0);
      
      // Accumulate idle time for camera drift
      this.idleTimer += delta;
      if (this.idleTimer > 60.0) {
        this.idleDriftAngle += delta * 0.12;
      }
    }

    // Check contextual location triggers for Wanderer's Thoughts
    this.updateWandererThoughts(delta);

    // Update 3D Pfand Bottle Collectibles (Rotation, Bobbing, and Proximity Pickup)
    this.updatePfandCollectibles(delta, timeSec);

    // Pulse target marker ring
    if (this.targetMarker && this.targetMarker.visible) {
      const scale = 1.0 + Math.sin(timeSec * 8) * 0.15;
      this.targetMarker.scale.set(scale, scale, scale);
    }
    
    // Quest/Delivery Hint Marker Update
    let targetMesh = null;
    const TUITION_GOAL = window.FFH.ECONOMY?.TUITION_GOAL || 250;

    // --- Highest priority: story is waiting for player to travel to a new location ---
    // --- Target navigation marker is exclusively active when pendingStoryTarget or activeDelivery is set ---
    const sr = this.game.storyRunner;
    if (sr && sr.pendingStoryTarget) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === sr.pendingStoryTarget.poi);
    } else if (this.game.state.wallet >= TUITION_GOAL) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === 'B_UNI');
    } else if (this.game.state.activeDelivery && this.game.state.deliveryTarget) {
      const tgt = this.game.state.deliveryTarget;
      targetMesh = this.interactiveMeshes.find(m => m.userData.gridX === tgt.gridX && m.userData.gridZ === tgt.gridZ);
    }

    if (targetMesh && this.questHintMarker && (this.compassRevealed || this.game.state.firstObjectiveRevealed)) {
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

        // Build true A* waypoints on the street grid
        const aStarPath = window.FFH.findPath
          ? window.FFH.findPath(this.playerPos.x, this.playerPos.z, targetMesh.position.x, targetMesh.position.z)
          : [];

        const waypoints = aStarPath.map(p => new THREE.Vector3(p.x, 0.28, p.z));
        if (waypoints.length === 0) {
          waypoints.push(new THREE.Vector3(this.playerPos.x, 0.28, this.playerPos.z));
          waypoints.push(new THREE.Vector3(targetMesh.position.x, 0.28, targetMesh.position.z));
        }

        // Hide full-screen ground ribbon mesh to eliminate screen clutter
        if (this.navRibbonMesh) this.navRibbonMesh.visible = false;

        // Place and animate short 3-4 directional guide chevrons right ahead of courier
        const totalDist = waypoints.reduce((acc, p, idx) => {
          if (idx === 0) return 0;
          return acc + p.distanceTo(waypoints[idx - 1]);
        }, 0);

        const maxVisibleDist = 4.8; // Limit trail to 4.8 meters ahead of player
        const maxChevrons = 4;
        const chevronSpacing = 1.2;
        const speed = 2.2; // speed of moving markers along trail
        const offset = (timeSec * speed) % chevronSpacing;
        let poolIdx = 0;

        let curDist = offset;
        while (curDist < Math.min(totalDist, maxVisibleDist) && poolIdx < maxChevrons && poolIdx < this.navChevronPool.length) {
          let remaining = curDist;

          for (let i = 0; i < waypoints.length - 1; i++) {
            const p1 = waypoints[i];
            const p2 = waypoints[i + 1];
            const segLen = p1.distanceTo(p2);

            if (remaining <= segLen) {
              const t = remaining / segLen;
              const pos = new THREE.Vector3().lerpVectors(p1, p2, t);
              pos.y = 0.16; // float neatly right above street surface
              const dir = new THREE.Vector3().subVectors(p2, p1).normalize();

              const chevron = this.navChevronPool[poolIdx];
              chevron.position.copy(pos);
              chevron.rotation.y = Math.atan2(-dir.z, dir.x) - Math.PI / 2;
              chevron.material.color.setHex(chevronColor);

              // Smooth fade out as distance from player increases
              const fade = Math.max(0, 1.0 - (curDist / maxVisibleDist));
              chevron.material.opacity = fade * 0.9;
              chevron.visible = (fade > 0.05);

              poolIdx++;
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
    const isDelivery = !!this.game.state.activeDelivery;
    const hasStoryTarget = !!(sr && sr.pendingStoryTarget);
    if ((isDelivery || hasStoryTarget) && targetMesh) {
      const dx = targetMesh.position.x - this.playerPos.x;
      const dz = targetMesh.position.z - this.playerPos.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      // Determine angle to point the arrow
      const angle = Math.atan2(dx, dz);
      if (this.game.ui.updateCityExplorerHUD) {
        this.game.ui.updateCityExplorerHUD(dist, angle, true);
      }
      
      if (isDelivery) {
        // Decay freshness
        const decayRate = this.game.state.upgrades?.thermalBag ? 1.0 : 2.0;
        this.game.state.freshness = Math.max(0, this.game.state.freshness - (delta * decayRate));
        
        // Doorway Dialogue Handoff (auto transition when near)
        if (dist < 2.0) {
          // We've stepped up to the customer's doorway!
          this.game.transitionTo('DIALOGUE', { isDelivery: true });
        }
      }
    } else {
      if (this.game.ui.updateCityExplorerHUD) {
        this.game.ui.updateCityExplorerHUD(0, 0, false);
      }
    }

    // 8. Update Collectible Pfand Bottles (€0.25 pickups)
    this.updatePfandCollectibles(delta, timeSec);

    // 9. Update Location-based Ambient Thoughts
    this.updateWandererThoughts(delta);
  }

  updateWandererThoughts(delta) {
    const timeSec = this.game.clock ? this.game.clock.getElapsedTime() : 0;
    if (timeSec - (this.lastThoughtTime || 0) < 18.0) return; // 18s cooldown between thoughts

    const px = this.playerPos.x;
    const pz = this.playerPos.z;

    const thoughts = [
      {
        id: 'canal_bridge',
        condition: () => (pz > 10 && pz < 13) || (pz > 47 && pz < 50),
        text: "Look at this river. So flat it looks like someone ironed it with heavy starch. I bet even the fish swim in strict single file."
      },
      {
        id: 'blocky_crowd',
        condition: () => Math.hypot(px - 16.0, pz - 20.0) < 5.5,
        text: "Everyone here walks in exact right angles like toy soldiers. Don't look suspicious, mate. Look like you pay taxes."
      },
      {
        id: 'holstentor',
        condition: () => Math.hypot(px - 18.2, pz - 33.8) < 6.0,
        text: "Holstentor... built in 1464. Looks like two giant brick salt shakers guarding the road."
      },
      {
        id: 'forest_edge',
        condition: () => px < 8 || px > 54 || pz < 8 || pz > 54,
        text: "The local trees are so square and disciplined, they probably file quarterly foliage reports."
      },
      {
        id: 'bakery',
        condition: () => Math.hypot(px - 5.2, pz - 18.2) < 5.0,
        text: "Smells like warm cinnamon and sugar... though Oma Martha's rolling pin looks like a lethal weapon."
      },
      {
        id: 'uni',
        condition: () => Math.hypot(px - 54.6, pz - 33.8) < 5.0,
        text: "Universität Lübeck. €250 tuition fee. If I don't pay by Friday, my student life ends before it even begins."
      },
      {
        id: 'darkstore',
        condition: () => Math.hypot(px - 5.2, pz - 46.8) < 5.0,
        text: "Kruma Express. Where German nouns have genders and couriers sprint for rent money."
      }
    ];

    for (const t of thoughts) {
      if (!this.visitedThoughtZones.has(t.id) && t.condition()) {
        this.visitedThoughtZones.add(t.id);
        this.lastThoughtTime = timeSec;
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought(t.text);
        }
        break;
      }
    }
  }

  updateCamera(snap = false) {
    const cam = this.game.currentCamera;
    if (!cam) return;

    // Default closer 3rd-person ground zoom level
    if (!this.camZoom) this.camZoom = 1.15;
    if (!this.targetCamZoom) this.targetCamZoom = 1.15;

    // Smoothly interpolate zoom on OrthographicCamera
    this.camZoom = THREE.MathUtils.lerp(this.camZoom, this.targetCamZoom, 0.15);
    if (Math.abs(cam.zoom - this.camZoom) > 0.001) {
      cam.zoom = this.camZoom;
      cam.updateProjectionMatrix();
    }

    const zoomFactor = THREE.MathUtils.clamp((this.camZoom - 0.50) / (1.35 - 0.50), 0, 1);

    // Intimate 3rd-person distances
    const baseDistance = THREE.MathUtils.lerp(12.0, 4.5, zoomFactor);
    const baseHeight = THREE.MathUtils.lerp(14.0, 4.2, zoomFactor);

    // Determine target camera angle:
    // If cameraHoldTimer is active, hold the angle.
    // Otherwise, rotate camera smoothly behind the player's movement heading.
    if (this.cameraHoldTimer > 0) {
      this.cameraHoldTimer -= 0.016;
    }

    const isMoving = this.targetMovePos !== null;
    let targetAngle = (this.playerHeading !== undefined ? this.playerHeading : Math.PI / 4) + Math.PI;

    // Use manual rotation if the user has dragged the camera
    if (this.manualCameraAngle !== undefined) {
      targetAngle = this.manualCameraAngle;
    }

    // Idle camera mode: After 60 seconds of no interaction, zoom out and spin
    if (this.idleTimer > 60.0) {
      targetAngle += this.idleDriftAngle;
      this.targetCamZoom = 0.52; // Diorama overview zoom
    } else {
      // Ensure we stay closely zoomed in (unless player manually toggled overview)
      if (this.targetCamZoom < 0.7 && this.idleTimer < 0.5 && isMoving) {
          // If we were in idle overview and started moving, snap back to intimate view
          this.targetCamZoom = 1.15;
      }
    }
    
    if (isMoving) {
      this.cameraHoldTimer = 0; // Cancel hold if player starts walking
    }

    // Smoothly rotate camera angle
    if (!this.camCurrentAngle) this.camCurrentAngle = targetAngle;
    this.camCurrentAngle = THREE.MathUtils.lerp(this.camCurrentAngle, targetAngle, snap ? 1.0 : 0.06);

    const offsetX = Math.sin(this.camCurrentAngle) * baseDistance;
    const offsetZ = Math.cos(this.camCurrentAngle) * baseDistance;
    const offsetY = baseHeight;

    const lookTargetX = this.playerPos.x + (this.cameraPanOffset ? this.cameraPanOffset.x : 0);
    // Shift lookTarget Y down by 2.2 units so the player appears higher up (top 50% of screen)
    // to prevent UI overlay overlapping the 3D character in portrait view.
    const lookTargetY = this.playerPos.y - 2.2;
    const lookTargetZ = this.playerPos.z + (this.cameraPanOffset ? this.cameraPanOffset.z : 0);

    const camX = lookTargetX + offsetX;
    const camY = lookTargetY + offsetY;
    const camZ = lookTargetZ + offsetZ;

    if (snap) {
      cam.position.set(camX, camY, camZ);
    } else {
      const lerpSpeed = 0.12;
      cam.position.x = THREE.MathUtils.lerp(cam.position.x, camX, lerpSpeed);
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, camY, lerpSpeed);
      cam.position.z = THREE.MathUtils.lerp(cam.position.z, camZ, lerpSpeed);
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
