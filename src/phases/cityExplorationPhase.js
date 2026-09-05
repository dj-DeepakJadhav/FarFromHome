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
    this.mouse = new THREE.Vector2();

    // Idle & Narrative Thought state
    this.lastThoughtTime = 0;
    this.visitedThoughtZones = new Set();

    // Sub-Controllers (Component-Based Architecture)
    this.cameraController = new window.FFH.CityCamera(this.game, this);
    this.inputController = new window.FFH.CityInput(this.game, this);
    this.environmentController = new window.FFH.CityEnvironment(this.game, this);
    this.collectiblesController = new window.FFH.CityCollectibles(this.game, this);
    this.doorwayController = new window.FFH.CityDoorway(this.game, this);
  }

  // Compatibility getters & setters for existing references and test inspection
  get doorwayBeacon() { return this.doorwayController ? this.doorwayController.doorwayBeacon : null; }
  set doorwayBeacon(v) { if (this.doorwayController) this.doorwayController.doorwayBeacon = v; }
  get doorwayBeaconRing() { return this.doorwayController ? this.doorwayController.doorwayBeaconRing : null; }
  get doorwayBeaconArrow() { return this.doorwayController ? this.doorwayController.doorwayBeaconArrow : null; }
  get doorwaySpotlight() { return this.doorwayController ? this.doorwayController.doorwaySpotlight : null; }
  get activeDoorPos() { return this.doorwayController ? this.doorwayController.activeDoorPos : null; }
  set activeDoorPos(v) { if (this.doorwayController) this.doorwayController.activeDoorPos = v; }
  get activeDoorPoi() { return this.doorwayController ? this.doorwayController.activeDoorPoi : null; }
  set activeDoorPoi(v) { if (this.doorwayController) this.doorwayController.activeDoorPoi = v; }
  get doorInteractionCooldown() { return this.doorwayController ? this.doorwayController.doorInteractionCooldown : 0; }
  set doorInteractionCooldown(v) { if (this.doorwayController) this.doorwayController.doorInteractionCooldown = v; }

  get camCurrentAngle() { return this.cameraController ? this.cameraController.camCurrentAngle : 0; }
  set camCurrentAngle(v) { if (this.cameraController) this.cameraController.camCurrentAngle = v; }
  get camZoom() { return this.cameraController ? this.cameraController.camZoom : 1.0; }
  set camZoom(v) { if (this.cameraController) this.cameraController.camZoom = v; }
  get targetCamZoom() { return this.cameraController ? this.cameraController.targetCamZoom : 1.0; }
  set targetCamZoom(v) { if (this.cameraController) this.cameraController.targetCamZoom = v; }
  get cameraPanOffset() { return this.cameraController ? this.cameraController.cameraPanOffset : new THREE.Vector3(); }
  set cameraPanOffset(v) { if (this.cameraController) this.cameraController.cameraPanOffset = v; }
  get manualCameraAngle() { return this.cameraController ? this.cameraController.manualCameraAngle : undefined; }
  set manualCameraAngle(v) { if (this.cameraController) this.cameraController.manualCameraAngle = v; }

  get directMoveVector() { return this.inputController ? this.inputController.directMoveVector : { x: 0, z: 0, strength: 0 }; }
  get keysDown() { return this.inputController ? this.inputController.keysDown : {}; }
  get isTouchDragging() { return this.inputController ? this.inputController.isTouchDragging : false; }
  get touchJoystickEl() { return this.inputController ? this.inputController.touchJoystickEl : null; }

  get pfandCollectibles() { return this.collectiblesController ? this.collectiblesController.pfandCollectibles : []; }
  get pfandGroup() { return this.collectiblesController ? this.collectiblesController.pfandGroup : null; }
  set pfandGroup(v) { if (this.collectiblesController) this.collectiblesController.pfandGroup = v; }

  getDoorPosition(poiType, fallbackPos) {
    return this.doorwayController.getDoorPosition(poiType, fallbackPos);
  }

  getExitPosition(poiType, fallbackPos) {
    return this.doorwayController.getExitPosition(poiType, fallbackPos);
  }

  setupDoorwayBeacon() {
    this.doorwayController.setup();
  }

  setupPfandCollectibles() {
    this.collectiblesController.setup();
  }

  updatePfandCollectibles(delta, timeSec) {
    if (this.collectiblesController) {
      this.collectiblesController.update(delta, timeSec);
    }
  }

  setupAtmosphere() {
    this.environmentController.setup({
      clouds: this.clouds,
      butterflies: this.butterflies,
      birds: this.birds
    });
  }

  updateAtmosphericTime(progress) {
    if (this.environmentController) {
      this.environmentController.updateAtmosphericTime(progress);
    }
  }

  setZoom(val) {
    if (this.cameraController) this.cameraController.setZoom(val);
  }

  updateCamera(snap = false, delta = 0.016) {
    if (!this.cameraController) return;
    if (snap) {
      this.cameraController.snapToTarget();
    } else {
      const isMoving = this.targetMovePos !== null || this.directMoveVector.strength > 0.05 ||
        (this.keysDown['w'] || this.keysDown['s'] || this.keysDown['a'] || this.keysDown['d'] ||
         this.keysDown['arrowup'] || this.keysDown['arrowdown'] || this.keysDown['arrowleft'] || this.keysDown['arrowright']);
      const timeSec = this.game.clock ? this.game.clock.getElapsedTime() : 0;
      this.cameraController.update(delta, timeSec, isMoving);
    }
  }

  updateBuildingOcclusionFade() {
    if (this.cameraController) this.cameraController.updateBuildingOcclusionFade();
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

    // Attach touch & mouse controls + Keyboard via input controller
    this.inputController.attach();
    
    // Initialize Minimap Data
    this.setupMinimap();

    // Initialize 3D Pfand Bottle Collectibles (€0.25 each)
    this.setupPfandCollectibles();

    // Initialize Active Street Doorway Beacon
    this.setupDoorwayBeacon();

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
      this.doorInteractionCooldown = 3.0; // 3 seconds grace period after exiting a building
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
    if (this.inputController) {
      this.inputController.detach();
    }
    if (this.cameraController) {
      this.cameraController.dispose();
    }
    if (this.doorwayController) {
      this.doorwayController.dispose();
    }
    if (this.collectiblesController) {
      this.collectiblesController.dispose();
    }
    if (this.environmentController) {
      this.environmentController.dispose();
    }

    if (this.targetMarker) {
      this.game.scene.remove(this.targetMarker);
      this.targetMarker = null;
    }

    if (this.questHintMarker) {
      this.game.scene.remove(this.questHintMarker);
      this.questHintMarker = null;
      this.questHintArrow = null;
      this.questHintCircle = null;
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
  // Managed by this.inputController (CityInput)

  revealCompass() {
    this.compassRevealed = true;
  }

  handleSingleOrDoubleTap(e) {
    if (this.inputDisabled) return; // Prevent movement/interaction if input is locked
    
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
    const poiCard = document.getElementById('city-poi-card');
    if (poiCard && poiCard.style.display !== 'none') {
      poiCard.style.display = 'none';
      if (this.game.ui) this.game.ui.currentActivePOI = null;
    }

    const rect = this.game.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.game.currentCamera);

    // 1. Messenger System: Check if clicked active doorway beacon first
    if (this.doorwayBeacon && this.doorwayBeacon.visible && this.activeDoorPoi) {
      const beaconHits = this.raycaster.intersectObjects([this.doorwayBeacon], true);
      if (beaconHits.length > 0) {
        const dist = Math.hypot(this.doorwayBeacon.position.x - this.playerPos.x, this.doorwayBeacon.position.z - this.playerPos.z);
        if (dist > 3.0) {
          this.setMoveTarget(this.doorwayBeacon.position.x, this.doorwayBeacon.position.z);
        } else {
          this.startBuildingEntry(this.activeDoorPoi, this.doorwayBeacon.position);
        }
        return;
      }
    }

    // 2. Click-to-Move on ground/street only (Buildings are solid obstacles, NOT clicked for movement)
    const groundHits = this.raycaster.intersectObjects(this.groundMeshes, true);
    if (groundHits.length > 0) {
      const hitPoint = groundHits[0].point;
      this.setMoveTarget(hitPoint.x, hitPoint.z);
      this.intendedInteractionPoi = null;
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
      this.setZoom(1.15);
    } else {
      this.setZoom(0.50);
    }
  }

  onKeyDown(e) {
    this.keysDown[e.key.toLowerCase()] = true;
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

  onKeyUp(e) {
    this.keysDown[e.key.toLowerCase()] = false;
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

  setThoughtCamera(active) {
    // Camera is strictly locked behind character per user request
  }





  startBuildingEntry(poiType, buildingPos) {
    if (this.isEnteringBuilding) return;
    this.enteringPoiType = poiType;
    this.enteringDoorPos = this.getDoorPosition(poiType, buildingPos);
    this.enteringBuildingPos = new THREE.Vector3(buildingPos.x, 0.05, buildingPos.z);
    
    // Position player cleanly outside at the door
    this.playerPos.copy(this.enteringDoorPos);
    if (this.courier) {
      this.courier.position.copy(this.playerPos);
      this.courier.scale.setScalar(1.0);
    }
    
    this.targetMovePos = null;
    this.playerPath = [];
    if (this.targetMarker) this.targetMarker.visible = false;
    
    // Trigger building interaction directly
    this.triggerBuildingInteraction(poiType);
  }


  showInteriorModal(roomBuilderFunc, npcModelKey, modalUIRenderer) {
    if (this.game.phases.INTERIOR) {
      let roomType = 'DOORWAY';
      if (roomBuilderFunc === window.FFH.createWGRoom) roomType = 'WG_ROOM';
      else if (roomBuilderFunc === window.FFH.createUniRoom) roomType = 'UNI';
      else if (roomBuilderFunc === window.FFH.createPizzeriaRoom) roomType = 'PIZZERIA';
      else if (roomBuilderFunc === window.FFH.createBakeryRoom) roomType = 'BAKERY';

      this.game.transitionTo('INTERIOR', {
        roomType: roomType,
        npcKey: npcModelKey,
        customWidget: (actionSlot, onComplete, interiorPhase) => {
          modalUIRenderer((onCompleteCallback) => {
            interiorPhase.exitToCity();
            if (onCompleteCallback) onCompleteCallback();
          });
        }
      });
      return;
    }

    const worldGroup = this.worldGroup;
    const courier = this.courier;
    const scene = this.game.scene;
    const cam = this.game.cameras.mainCamera;

    if (worldGroup) worldGroup.visible = false;
    if (courier) courier.visible = false;

    const room = roomBuilderFunc ? roomBuilderFunc(this.game.state) : window.FFH.createRoomShell();
    room.position.set(0, 0, 0);
    scene.add(room);
    
    let npc = null;
    if (npcModelKey && window.FFH.createNPCMesh) {
       npc = window.FFH.createNPCMesh(npcModelKey);
       npc.position.set(-0.45, 0.05, -1.10);
       npc.rotation.y = 0.85;
       npc.scale.multiplyScalar(2.6);
       scene.add(npc);
    }

    const oldPos = cam.position.clone();
    const oldZoom = cam.zoom;
    
    const template = window.FFH.DIORAMA_VIEW_TEMPLATE || { target: new THREE.Vector3(0, -2.4, 0), zoomOffset: new THREE.Vector3(10, 13.5, 10), zoom: 2.1 };
    const endCamTarget = template.target.clone();
    const endCamPos = new THREE.Vector3().copy(endCamTarget).add(template.zoomOffset);
    
    cam.position.copy(endCamPos);
    cam.lookAt(endCamTarget);
    if(cam.isOrthographicCamera) {
        cam.zoom = template.zoom;
        cam.updateProjectionMatrix();
    }

    this.isEnteringBuilding = true;

    modalUIRenderer((onCompleteCallback) => {
       this.isShowingInteriorModal = false;
       scene.remove(room);
       if (npc) scene.remove(npc);
       if (worldGroup) worldGroup.visible = true;
       if (courier) courier.visible = true;
       
       cam.position.copy(oldPos);
       if(cam.isOrthographicCamera) {
         cam.zoom = oldZoom;
         cam.updateProjectionMatrix();
       }
       if (onCompleteCallback) onCompleteCallback();
    });
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

    // ---------------------------------------------------------------------
    // CANONICAL ACT ONE STATE MACHINE (Docs/ACT_ONE_BRITISH_COMEDY.md)
    // ---------------------------------------------------------------------
    const Stages = window.FFH.ACT1_STAGES || {};
    const curStage = s.act1Stage || Stages.ARRIVAL_ZOB;
    console.log(`[Act1FSM] Interacted with ${poiType} during stage ${curStage}`);

    // Helper: Safely exit to city after non-modal or rejected interaction
    const cancelAndExit = () => {
      this.isEnteringBuilding = false;
      this.inputDisabled = false;
      this.startBuildingExit();
    };

    // 1. WG INTERCOM & ROOM 4
    if (poiType === 'B_WG') {
      if (curStage === Stages.ARRIVAL_ZOB || curStage === Stages.TRANSIT_TO_WG || curStage === Stages.WG_DOOR) {
        s.act1Stage = Stages.WG_DOOR;
        this.game.transitionTo('INTERIOR', {
          roomType: 'DOORWAY',
          npcKey: null,
          titleBadge: 'ENTRANCE',
          title: 'Apartment Buzzer',
          text: 'There are three names on the bells. The landlord said my flatmate is named Nico.',
          note: 'Ring the correct bell to enter.',
          choices: [
            {
              label: 'Müller',
              borderLeft: '#718096',
              action: (game) => {
                if (game.sfx) game.sfx.playSfx('error');
                if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('No answer...', window.innerWidth/2, window.innerHeight*0.3, '#718096');
              }
            },
            {
              label: 'Schmidt / Nico',
              borderLeft: '#2EC4B6',
              action: (game) => {
                if (game.sfx) game.sfx.playSfx('success');
                s.act1Stage = Stages.WG_ROOM4;
                if (window.FFH && window.FFH.saveGame) window.FFH.saveGame(game);
                this.triggerBuildingInteraction('B_WG_ENTERED');
              }
            },
            {
              label: 'Hausverwaltung',
              borderLeft: '#718096',
              action: (game) => {
                if (game.sfx) game.sfx.playSfx('error');
                if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('An angry voice yells: "Keine Werbung!"', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
              }
            }
          ]
        });
        return;
      }

      if (curStage === Stages.WG_ROOM4) {
        this.triggerBuildingInteraction('B_WG_ENTERED');
        return;
      }

      if (curStage === Stages.RETURN_TO_WG || curStage === Stages.JOB_HUNT_BAKERY) {
        if (this.game.ui && this.game.ui.showDayRecapModal) {
          this.game.ui.showDayRecapModal(() => {
            s.act1Stage = Stages.DAY1_SLEEP;
            s.day = 2;
            s.questStep = 4;
            s.activeObjective = 'Tag 2 (07:00): Head to Kruma Express Dark Store for Shift 1!';
            if (this.game.ui && this.game.ui.updateQuestTracker) this.game.ui.updateQuestTracker();
            if (this.game.ui && this.game.ui.refreshStats) this.game.ui.refreshStats(this.game.state);

            // Transition lighting to Day 2 morning dawn (0.30)!
            this.updateAtmosphericTime(0.30);

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
      }

      // Default WG interaction if visited out of sequence
      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("My room key is in my pocket, but I need to finish my errands first.");
      }
      cancelAndExit();
      return;
    }

    // 2. INSIDE WG ROOM 4 (Nico & Mülltrennung)
    if (poiType === 'B_WG_ENTERED') {
      this.game.transitionTo('INTERIOR', {
        roomType: 'WG_ROOM',
        npcKey: 'NPC_NICO',
        titleBadge: 'APARTMENT',
        title: 'Mülltrennung (Garbage Sorting)',
        speaker: 'Nico (Flatmate)',
        text: 'Hey! Before you unpack, you must learn the German way. Where does the empty milk carton go?',
        note: 'Sort the trash correctly to pass.',
        choices: [
          {
            label: 'Restmüll (Black Bin)',
            subtext: 'General waste',
            borderLeft: '#111111',
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('error');
              if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('Wrong! Nico sighs loudly.', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
            }
          },
          {
            label: 'Gelber Sack (Yellow Bag)',
            subtext: 'Plastics & Packaging',
            borderLeft: '#F4D03F',
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('success');
              s.act1Stage = Stages.TRANSIT_TO_UNI;
              
              // Transition to Urgent Tuition Letter on desk
              game.transitionTo('INTERIOR', {
                roomType: 'WG_ROOM',
                npcKey: null,
                titleBadge: 'DESK',
                title: 'Urgent Letter',
                text: 'You spot a letter on your desk. It says: "Achtung: Exmatrikulation upon failure to pay €250 semester fee by Friday."',
                note: 'I need to head to the University Campus immediately to sort this out.',
                choices: [
                  {
                    label: 'Leave Apartment',
                    subtext: 'Sprint to University Campus.',
                    borderLeft: '#2EC4B6',
                    action: (game2, interiorPhase2) => {
                      game2.state.questStep = 1;
                      game2.state.activeObjective = '🎓 Sprint to University Campus before 17:00!';
                      if (game2.storyRunner) {
                        game2.storyRunner.pendingStoryTarget = { sceneId: 'uni_closed', poi: 'B_UNI' };
                      }
                      if (game2.ui && game2.ui.updateQuestTracker) {
                        game2.ui.updateQuestTracker();
                      }
                      // Smooth transition to golden hour (16:45)
                      this.updateAtmosphericTime(0.70);

                      if (game2.ui && game2.ui.spawnWandererThought) {
                        setTimeout(() => {
                          game2.ui.spawnWandererThought(
                            "The sun is going down. The city looks dead pretty in this golden light. Still completely broke, of course, but the scenery is lovely."
                          );
                        }, 1200);
                      }

                      this.isEnteringBuilding = false;
                      this.inputDisabled = false;
                      this.isShowingInteriorModal = false;
                      if (window.FFH && window.FFH.saveGame) {
                        window.FFH.saveGame(game2);
                      }
                      interiorPhase2.exitToCity();
                    }
                  }
                ]
              });
            }
          },
          {
            label: 'Papiertonne (Blue Bin)',
            subtext: 'Paper & Cardboard',
            borderLeft: '#3498DB',
            action: (game) => {
              if (game.sfx) game.sfx.playSfx('error');
              if (game.ui && game.ui.spawnFloatingText) game.ui.spawnFloatingText('Wrong! Nico looks disappointed.', window.innerWidth/2, window.innerHeight*0.3, '#E76F51');
            }
          }
        ]
      });
      return;
    }

    // 3. UNIVERSITÄT ZU LÜBECK (Closed Door Notice)
    if (poiType === 'B_UNI' || poiType.includes('Universität') || poiType.includes('University')) {
      if (curStage === Stages.TRANSIT_TO_UNI || curStage === Stages.UNI_LOCKED) {
        this.game.transitionTo('INTERIOR', {
          roomType: 'UNI',
          npcKey: null,
          titleBadge: 'UNIVERSITÄT',
          title: 'Campus Admissions',
          text: 'The financial office is closed. A heavy wooden door blocks the way. A notice on the wall reads: "Payment deadline: Friday. Failure to pay will result in Exmatrikulation."',
          note: 'I need to find a job immediately. Pizzeria Bella might be hiring.',
          choices: [
            {
              label: 'Leave Campus',
              subtext: 'Search for work in town.',
              borderLeft: '#E76F51',
              action: (game, interiorPhase) => {
                s.act1Stage = Stages.JOB_HUNT_PIZZA;
                game.state.questStep = 2;
                game.state.activeObjective = '🍕 Try Pizzeria Bella for work — ask about a job';
                if (game.storyRunner) {
                  game.storyRunner.pendingStoryTarget = { sceneId: 'pizzeria_job', poi: 'B_PIZZA' };
                }
                if (game.ui && game.ui.updateQuestTracker) {
                  game.ui.updateQuestTracker();
                }

                // Transition atmosphere to Baltic night (19:00, progress 0.88)
                this.updateAtmosphericTime(0.88);

                if (game.ui && game.ui.spawnWandererThought) {
                  setTimeout(() => {
                    game.ui.spawnWandererThought(
                      "Great. It's pitch black, freezing cold, and I still don't have a job. Check the pizzeria for flyers."
                    );
                  }, 1200);
                }

                this.isEnteringBuilding = false;
                this.inputDisabled = false;
                this.isShowingInteriorModal = false;
                if (window.FFH && window.FFH.saveGame) {
                  window.FFH.saveGame(game);
                }
                interiorPhase.exitToCity();
              }
            }
          ]
        });
        return;
      }

      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("I should drop my luggage at the student WG first before wandering onto campus.");
      }
      cancelAndExit();
      return;
    }

    // 4. PIZZERIA BELLA (Mathias Job Rejection)
    if (poiType === 'B_PIZZA' || poiType.includes('Pizza')) {
      if (curStage === Stages.JOB_HUNT_PIZZA) {
        if (this.game.ui && this.game.ui.showPizzeriaJobModal) {
          this.showInteriorModal(window.FFH.createPizzeriaRoom, 'NPC_MATHIAS', (cleanup) => {
            this.game.ui.showPizzeriaJobModal(() => {
              cleanup();
              s.act1Stage = Stages.JOB_HUNT_BAKERY;
              s.questStep = 3;
              s.activeObjective = '🥐 Rejected at Pizzeria! Try Bakery Hansa for work.';
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
          });
          return;
        }
      }

      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("Smells of fresh garlic and oregano, but I have places to be right now.");
      }
      cancelAndExit();
      return;
    }

    // 5. BÄCKEREI HANSA (Oma Martha Rejection & Kruma Reveal)
    if (poiType === 'B_BAKERY' || poiType.includes('Bakery') || poiType.includes('Bäcker')) {
      if (curStage === Stages.JOB_HUNT_BAKERY) {
        if (this.game.ui && this.game.ui.showBakeryJobModal) {
          this.showInteriorModal(window.FFH.createBakeryRoom, 'NPC_MARTHA', (cleanup) => {
            this.game.ui.showBakeryJobModal(() => {
              cleanup();
              s.act1Stage = Stages.RETURN_TO_WG;
              s.questStep = 4;
              s.activeObjective = '🏠 Rejected at Bakery! Head back to WG to sleep.';
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
          });
          return;
        }
      }

      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("Warm crusty rye bread in the window. No time to browse pastries just yet.");
      }
      cancelAndExit();
      return;
    }

    // 6. KRUMA EXPRESS DARK STORE
    if (poiType === 'B_DARKSTORE' || poiType.includes('Kruma') || poiType.includes('Dark Store')) {
      if (s.day >= 2 || curStage === Stages.DAY1_SLEEP) {
        targetNpc = 'NPC_NINA';
        storyScene = 'knot_money';
      } else {
        if (this.game.ui && this.game.ui.spawnWandererThought) {
          this.game.ui.spawnWandererThought("Kruma Express warehouse. Shutter doors are down for the night. Opens tomorrow at 07:00.");
        }
        cancelAndExit();
        return;
      }
    }

    // 7. ZOB & TRANSIT HUB
    if (poiType === 'B_ZOB' || poiType.includes('ZOB') || poiType.includes('Station')) {
      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought(
          "Bus Timetable: 'No buses inside town center. Walk.' Brilliant. Welcome to Germany, mate. Drag your 25kg suitcase across the cobblestones."
        );
      }
      cancelAndExit();
      return;
    }

    // 8. OTHER STORY & CIVIC BUILDINGS
    if (poiType.includes('Hostel') || poiType.includes('Dorm')) {
      targetNpc = 'NPC_WEBER';
      storyScene = 'the_circle_2';
    } else if (poiType.includes('Ausländer') || poiType.includes('Office') || poiType.includes('Dom') || poiType === 'B_AUSLAENDER') {
      targetNpc = 'NPC_LINDEMANN';
      storyScene = 'act_five';
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
      cancelAndExit();
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
      this.setMoveTarget(buildingPos.x, buildingPos.z);
      return;
    }

    const poiType = poiData.type || poiData.name || '';
    if (poiType.startsWith('A')) {
      if (this.game.ui && this.game.ui.spawnWandererThought) {
        this.game.ui.spawnWandererThought("Just an ordinary townhouse. Better focus on finding my room.");
      }
      return;
    }

    this.startBuildingEntry(poiType, buildingPos);
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
    this.enteringTimer = 0;
    this.isEnteringBuilding = false;
    this.isExitingBuilding = false;
    this.inputDisabled = false;

    if (this.enteringPoiType) {
      const safeExitPos = this.getExitPosition(this.enteringPoiType, this.enteringDoorPos || this.playerPos);
      this.playerPos.copy(safeExitPos);
    } else if (this.enteringDoorPos) {
      this.playerPos.copy(this.enteringDoorPos);
    }

    if (this.courier) {
      this.courier.position.copy(this.playerPos);
      this.courier.scale.setScalar(1.0);
      if (this.courier.userData && this.courier.userData.playAction) {
        this.courier.userData.playAction('idle');
      }
    }

    this.manualCameraAngle = undefined; // Return camera to normal follow
    this.targetCamZoom = (this.cameraController && this.cameraController.initialCamZoom) ? this.cameraController.initialCamZoom : 2.88;
    this.updateCamera(false);
  }

  update(delta) {
    // Decoupled Central Input Rule: input is enabled unless an active blocking animation is playing
    if (this.inputDisabled && !this.isEnteringBuilding && !this.isExitingBuilding) {
       const titleScreen = document.getElementById('title-screen');
       if (!titleScreen || (titleScreen.style.display === 'none' && this.game.clock.getElapsedTime() > 4.0)) {
           this.inputDisabled = false;
       }
    }

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
      this.updateCamera(false, delta);
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
         this.targetCamZoom = (this.cameraController && this.cameraController.initialCamZoom) ? this.cameraController.initialCamZoom : 2.88;
       }
      this.updateCamera(false, delta);
      return;
    }

    const timeSec = this.game.clock.getElapsedTime();

    // 1. Environment Simulation (Water, Clouds, Butterflies, Birds)
    if (this.environmentController) {
      this.environmentController.update(delta, timeSec);
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

    // 4. Movement Handling (Direct Touch-Drag Joystick / Keyboard WASD + Click-to-Move Pathing)
    const camAngle = this.camCurrentAngle !== undefined ? this.camCurrentAngle : 0;
    const moveIntent = this.inputController 
      ? this.inputController.getMoveIntent(camAngle)
      : { moveDirX: 0, moveDirZ: 0, moveSpeedRatio: 0, isDirect: false };

    let moveDirX = moveIntent.moveDirX;
    let moveDirZ = moveIntent.moveDirZ;
    let moveSpeedRatio = moveIntent.moveSpeedRatio;

    if (moveIntent.isDirect && (this.keysDown['w'] || this.keysDown['s'] || this.keysDown['a'] || this.keysDown['d'] ||
        this.keysDown['arrowup'] || this.keysDown['arrowdown'] || this.keysDown['arrowleft'] || this.keysDown['arrowright'])) {
      // Cancel click-to-move path when keyboard input is detected
      this.playerPath = [];
      this.targetMovePos = null;
      if (this.targetMarker) this.targetMarker.visible = false;
    }

    if (moveSpeedRatio > 0.05) {
      // Direct Movement via sliding collision solver
      const MOV = (window.FFH.CONFIG && window.FFH.CONFIG.movement) || {};
      const walkSpeed  = MOV.walkSpeed  !== undefined ? MOV.walkSpeed  : 4.2;
      const ebikeSpeed = MOV.ebikeSpeed !== undefined ? MOV.ebikeSpeed : 7.2;
      const speed = (this.game.state.upgrades?.ebike ? ebikeSpeed : walkSpeed) * moveSpeedRatio;
      const step = speed * delta;
      const nextX = this.playerPos.x + moveDirX * step;
      const nextZ = this.playerPos.z + moveDirZ * step;

      const radius = this.playerRadius || 0.4;
      const curX = this.playerPos.x;
      const curZ = this.playerPos.z;
      const resolved = window.FFH.resolveSlidingMovement
        ? window.FFH.resolveSlidingMovement(curX, curZ, nextX, nextZ, radius)
        : { x: nextX, z: nextZ };

      this.playerPos.x = resolved.x;
      this.playerPos.z = resolved.z;

      const actualMoveAngle = Math.atan2(moveDirX, moveDirZ);
      this.playerHeading = actualMoveAngle;

      if (this.courier) {
        this.courier.position.x = this.playerPos.x;
        this.courier.position.z = this.playerPos.z;
        let rotDiff = actualMoveAngle - this.courier.rotation.y;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        const rotDamp = 1.0 - Math.exp(-10.0 * (delta || 0.016));
        this.courier.rotation.y += rotDiff * rotDamp;
      }

      if (this.courier && this.courier.userData && this.courier.userData.mixer) {
        window.FFH.updateNPCAnimation(this.courier, delta);
        if (this.courier.userData.playAction && this.courier.userData.currentAction !== this.courier.userData.actions['walk']) {
          this.courier.userData.playAction('walk');
        }
      } else if (window.FFH.updateCourierWalk && this.courier) {
        window.FFH.updateCourierWalk(this.courier, delta, moveSpeedRatio);
      }

      if (this.game.state.upgrades?.ebike) this.game.sfx.setMotorIntensity(moveSpeedRatio);

      this.idleTimer = 0;
      this.idleDriftAngle = THREE.MathUtils.lerp(this.idleDriftAngle, 0, delta * 5);
    } else if (this.playerPath && this.playerPath.length > 0) {
      // C. Click-to-Move A* Pathing & Collision Handling
      const currentTgt = this.playerPath[0];
      const dx = currentTgt.x - this.playerPos.x;
      const dz = currentTgt.z - this.playerPos.z;
      const dist = Math.hypot(dx, dz);

      const waypointReach = (window.FFH.CONFIG?.movement?.waypointReach ?? 0.25);
      if (dist < waypointReach) {
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
        const MOV2 = (window.FFH.CONFIG && window.FFH.CONFIG.movement) || {};
        const pathWalk  = MOV2.pathWalkSpeed  !== undefined ? MOV2.pathWalkSpeed  : 4.2;
        const pathEbike = MOV2.pathEbikeSpeed !== undefined ? MOV2.pathEbikeSpeed : 7.2;
        const speed = (this.game.state.upgrades?.ebike ? pathEbike : pathWalk);
        const step = Math.min(dist, speed * delta);
        const dirX = dx / dist;
        const dirZ = dz / dist;

        const nextX = this.playerPos.x + dirX * step;
        const nextZ = this.playerPos.z + dirZ * step;

        const radius = this.playerRadius || 0.4;
        const curX = this.playerPos.x;
        const curZ = this.playerPos.z;
        const resolved = window.FFH.resolveSlidingMovement
          ? window.FFH.resolveSlidingMovement(curX, curZ, nextX, nextZ, radius)
          : { x: nextX, z: nextZ };

        this.playerPos.x = resolved.x;
        this.playerPos.z = resolved.z;

        const moveAngle = Math.atan2(dirX, dirZ);
        this.playerHeading = moveAngle;

        // If player made zero progress due to wall collision, abort path after short delay
        if (Math.abs(resolved.x - curX) < 0.001 && Math.abs(resolved.z - curZ) < 0.001) {
          this.stuckTimer = (this.stuckTimer || 0) + delta;
          if (this.stuckTimer > 0.3) {
            this.playerPath = [];
            this.targetMovePos = null;
            if (this.targetMarker) this.targetMarker.visible = false;
            this.stuckTimer = 0;
            if (this.courier && this.courier.userData && this.courier.userData.playAction) {
              this.courier.userData.playAction('idle');
            }
          }
        } else {
          this.stuckTimer = 0;
        }

        if (this.courier) {
          this.courier.position.x = this.playerPos.x;
          this.courier.position.z = this.playerPos.z;
          let rotDiff = moveAngle - this.courier.rotation.y;
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
          const rotDamp = 1.0 - Math.exp(-10.0 * (delta || 0.016));
          this.courier.rotation.y += rotDiff * rotDamp;
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
      if (this.idleTimer > 8.0) {
        this.idleDriftAngle += delta * 0.15;
      }
    }

    // Auto doorway proximity check: only trigger if player walks right up to the active story door (< 1.6m) and cooldown is clear
    if (this.doorInteractionCooldown > 0) {
      this.doorInteractionCooldown -= delta;
    } else if (this.activeDoorPos && this.activeDoorPoi && !this.isEnteringBuilding && !this.isExitingBuilding && !this.inputDisabled) {
      const distToDoor = Math.hypot(this.playerPos.x - this.activeDoorPos.x, this.playerPos.z - this.activeDoorPos.z);
      if (distToDoor < 1.6) {
        this.doorInteractionCooldown = 2.5; // Prevent immediate re-triggering upon exit
        console.log(`[Doorway] Walked into active door zone of ${this.activeDoorPoi}! Triggering entry.`);
        this.startBuildingEntry(this.activeDoorPoi, this.activeDoorPos);
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

    // --- Target navigation marker resolves using pendingStoryTarget OR canonical act1Stage ---
    const sr = this.game.storyRunner;
    const Stages = window.FFH.ACT1_STAGES || {};
    const curStage = this.game.state.act1Stage || Stages.ARRIVAL_ZOB;

    if (sr && sr.pendingStoryTarget) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === sr.pendingStoryTarget.poi);
    } else if (curStage === Stages.ARRIVAL_ZOB || curStage === Stages.TRANSIT_TO_WG || curStage === Stages.WG_DOOR) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === 'B_WG');
    } else if (curStage === Stages.TRANSIT_TO_UNI || curStage === Stages.UNI_LOCKED) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === 'B_UNI');
    } else if (curStage === Stages.JOB_HUNT_PIZZA) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === 'B_PIZZA');
    } else if (curStage === Stages.JOB_HUNT_BAKERY) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === 'B_BAKERY');
    } else if (curStage === Stages.RETURN_TO_WG) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === 'B_WG');
    } else if (this.game.state.wallet >= TUITION_GOAL) {
      targetMesh = this.interactiveMeshes.find(m => m.userData.type === 'B_UNI');
    } else if (this.game.state.activeDelivery && this.game.state.deliveryTarget) {
      const tgt = this.game.state.deliveryTarget;
      targetMesh = this.interactiveMeshes.find(m => m.userData.gridX === tgt.gridX && m.userData.gridZ === tgt.gridZ);
    }

    // --- Update Street Doorway Beacon at Active Target Door ---
    let activePoiKey = null;
    if (sr && sr.pendingStoryTarget) {
      activePoiKey = sr.pendingStoryTarget.poi;
    } else if (curStage === Stages.ARRIVAL_ZOB || curStage === Stages.TRANSIT_TO_WG || curStage === Stages.WG_DOOR) {
      activePoiKey = 'B_WG';
    } else if (curStage === Stages.TRANSIT_TO_UNI || curStage === Stages.UNI_LOCKED) {
      activePoiKey = 'B_UNI';
    } else if (curStage === Stages.JOB_HUNT_PIZZA) {
      activePoiKey = 'B_PIZZA';
    } else if (curStage === Stages.JOB_HUNT_BAKERY) {
      activePoiKey = 'B_BAKERY';
    } else if (curStage === Stages.RETURN_TO_WG) {
      activePoiKey = 'B_WG';
    } else if (this.game.state.wallet >= TUITION_GOAL) {
      activePoiKey = 'B_UNI';
    } else if (this.game.state.activeDelivery && targetMesh && targetMesh.userData) {
      activePoiKey = targetMesh.userData.type || 'DELIVERY_TARGET';
    }

    if (this.doorwayController) {
      this.doorwayController.update(delta, timeSec, activePoiKey, targetMesh);
    }

    const UI = (window.FFH.CONFIG && window.FFH.CONFIG.ui) || {};
    const questArrowEnabled   = UI.questArrowEnabled   !== undefined ? UI.questArrowEnabled   : true;
    const questRingEnabled    = UI.questRingEnabled    !== undefined ? UI.questRingEnabled    : true;
    const chevronsEnabled     = UI.groundChevronsEnabled !== undefined ? UI.groundChevronsEnabled : true;
    const anyQuestVisible     = questArrowEnabled || questRingEnabled || chevronsEnabled;

    if (anyQuestVisible && targetMesh && this.questHintMarker && (this.compassRevealed || this.game.state.firstObjectiveRevealed)) {
      this.questHintMarker.visible = true;
      const markerX = (this.doorwayController && this.doorwayController.activeDoorPos) ? this.doorwayController.activeDoorPos.x : targetMesh.position.x;
      const markerZ = (this.doorwayController && this.doorwayController.activeDoorPos) ? this.doorwayController.activeDoorPos.z : targetMesh.position.z;
      this.questHintMarker.position.set(markerX, 0, markerZ);
      
      if (this.questHintArrow) {
        let height = 3.0;
        if (targetMesh.userData.type && targetMesh.userData.type.startsWith('A')) {
          height = 4.5;
        } else if (targetMesh.userData.height) {
          height = targetMesh.userData.height;
        }
        this.questHintArrow.position.y = height + 1.2 + Math.sin(timeSec * 4) * 0.3;
        this.questHintArrow.rotation.y += delta * 2.5;
        // Individual flag + hide when doorway beacon already showing its own arrow
        this.questHintArrow.visible = questArrowEnabled && (!this.doorwayBeacon || !this.doorwayBeacon.visible);
      }

      if (this.questHintCircle) {
        const circleScale = 1.0 + Math.sin(timeSec * 5) * 0.15;
        this.questHintCircle.scale.set(circleScale, circleScale, circleScale);
        // Individual flag + hide when doorway beacon ring is showing
        this.questHintCircle.visible = questRingEnabled && (!this.doorwayBeacon || !this.doorwayBeacon.visible);
      }

      // Navigation Ground Path: Animated Chevrons
      if (this.navPathGroup) {
        if (!chevronsEnabled) {
          // Disabled — hide group and all individual children immediately
          this.navPathGroup.visible = false;
          if (this.navChevronPool) {
            for (let i = 0; i < this.navChevronPool.length; i++) {
              this.navChevronPool[i].visible = false;
            }
          }
          if (this.navRibbonMesh) this.navRibbonMesh.visible = false;
        } else {
          this.navPathGroup.visible = true;

          const isDelivery = this.game.state.activeDelivery;
          const mainColor = isDelivery ? 0x2EC4B6 : 0xFFD166;
          const chevronColor = isDelivery ? 0xCBF3F0 : 0xFFF3B0;

          this.navRibbonMat.color.setHex(mainColor);
          this.navRibbonMat.opacity = 0.35 + Math.sin(timeSec * 3) * 0.08;

          const destX = (this.doorwayController && this.doorwayController.activeDoorPos) ? this.doorwayController.activeDoorPos.x : targetMesh.position.x;
          const destZ = (this.doorwayController && this.doorwayController.activeDoorPos) ? this.doorwayController.activeDoorPos.z : targetMesh.position.z;

          const aStarPath = window.FFH.findPath
            ? window.FFH.findPath(this.playerPos.x, this.playerPos.z, destX, destZ)
            : [];

          const waypoints = aStarPath.map(p => new THREE.Vector3(p.x, 0.28, p.z));
          if (waypoints.length === 0) {
            waypoints.push(new THREE.Vector3(this.playerPos.x, 0.28, this.playerPos.z));
            waypoints.push(new THREE.Vector3(destX, 0.28, destZ));
          }

          if (this.navRibbonMesh) this.navRibbonMesh.visible = false;

          const totalDist = waypoints.reduce((acc, p, idx) => {
            if (idx === 0) return 0;
            return acc + p.distanceTo(waypoints[idx - 1]);
          }, 0);

          const maxVisibleDist = 4.8;
          const maxChevrons = 4;
          const chevronSpacing = 1.2;
          const speed = 2.2;
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
                pos.y = 0.16;
                const dir = new THREE.Vector3().subVectors(p2, p1).normalize();

                const chevron = this.navChevronPool[poolIdx];
                chevron.position.copy(pos);
                chevron.rotation.y = Math.atan2(-dir.z, dir.x) - Math.PI / 2;
                chevron.material.color.setHex(chevronColor);

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
      }

    } else {
      if (this.questHintMarker) this.questHintMarker.visible = false;
      if (this.navPathGroup) this.navPathGroup.visible = false;
    }



    // 5. Update Follower Camera & Building Transparency Fading
    this.updateCamera(false, delta);
    this.updateBuildingOcclusionFade();

    // 6. Update Minimap
    if (window.FFH.CONFIG?.ui?.minimapEnabled !== false) {
      this.updateMinimap(timeSec);
    } else {
      const mc = document.getElementById('minimap-container');
      if (mc) mc.style.display = 'none';
    }

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
        const distEnabled = window.FFH.CONFIG?.ui?.distanceIndicatorEnabled ?? true;
        if (distEnabled) {
          this.game.ui.updateCityExplorerHUD(dist, angle, true);
        } else {
          this.game.ui.updateCityExplorerHUD(0, 0, false);
        }
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

};

