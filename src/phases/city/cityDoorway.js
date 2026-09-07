// CityDoorway: Manages active target doorway beacons, pulse rings, bouncing indicators, and auto-entry transitions.
window.FFH = window.FFH || {};

window.FFH.CityDoorway = class {
  constructor(game, phase) {
    this.game = game;
    this.phase = phase;

    this.doorwayBeacon = null;
    this.doorwayBeaconRing = null;
    this.doorwayBeaconArrow = null;
    this.doorwaySpotlight = null;

    this.activeDoorPos = null;
    this.activeDoorPoi = null;
    this.doorInteractionCooldown = 0;
  }

  setup() {
    this.doorwayBeacon = new THREE.Group();
    this.doorwayBeacon.name = 'doorway_beacon';

    // 1. Pulsing cyan ground ring right outside the door
    const ringGeo = new THREE.RingGeometry(0.4, 0.75, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2EC4B6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.doorwayBeaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.doorwayBeaconRing.rotation.x = -Math.PI / 2;
    this.doorwayBeaconRing.position.y = 0.08;
    this.doorwayBeacon.add(this.doorwayBeaconRing);

    // 2. Floating bouncing arrow pointing down at the entrance
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0);
    arrowShape.lineTo(0.35, 0.45);
    arrowShape.lineTo(0.14, 0.45);
    arrowShape.lineTo(0.14, 0.95);
    arrowShape.lineTo(-0.14, 0.95);
    arrowShape.lineTo(-0.14, 0.45);
    arrowShape.lineTo(-0.35, 0.45);
    arrowShape.closePath();

    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0xFFD166,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
      depthWrite: false
    });
    this.doorwayBeaconArrow = new THREE.Mesh(arrowGeo, arrowMat);
    this.doorwayBeaconArrow.renderOrder = 999;
    this.doorwayBeaconArrow.position.y = 1.4;
    this.doorwayBeacon.add(this.doorwayBeaconArrow);

    // 3. Vertical soft beacon cylinder beam
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.6, 3.5, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x2EC4B6,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.doorwaySpotlight = new THREE.Mesh(beamGeo, beamMat);
    this.doorwaySpotlight.position.y = 1.75;
    this.doorwayBeacon.add(this.doorwaySpotlight);

    this.doorwayBeacon.visible = false;
    this.game.scene.add(this.doorwayBeacon);
  }

  getDoorPosition(poiType, fallbackPos) {
    // Precise doorway portal positions matching 3D building models and orientations
    const locPositions = {
      'B_ZOB':        { x:  5.2, z:  1.2 },  // Front entrance facing North (-Z)
      'B_BANK':       { x: 41.6, z:  4.0 },  // Front entrance facing South (+Z)
      'B_UNI':        { x: 26.0, z: 16.8 },  // University Courtyard front archway facing South (+Z) towards boulevard
      'B_BAKERY':     { x:  6.6, z: 15.6 },  // Front entrance facing East (+X)
      'B_BURGTOR':    { x: 37.8, z: 15.6 },  // Archway gate facing East (+X)
      'B_RATHAUS':    { x: 24.8, z: 20.8 },  // Town Hall front steps facing East (+X)
      'B_PIZZA':      { x: 28.6, z: 22.2 },  // Pizzeria awning & front door facing South (+Z)
      'B_WG':         { x:  6.6, z: 23.4 },  // WG Altbau front porch facing East (+X)
      'B_AUSLAENDER': { x: 37.8, z: 23.4 },  // Civic office front door facing East (+X)
      'B_BIKESHOP':   { x:  5.2, z: 30.0 },  // Bike shop front door facing South (+Z)
      'B_KINO':       { x: 26.0, z: 30.0 },  // Cinema grand marquee entrance facing South (+Z)
      'B_HOLSTEN':    { x: 16.8, z: 31.2 },  // Holstentor gate portal facing West (-X)
      'B_MARIEN':     { x: 53.2, z: 31.2 },  // St. Mary's Cathedral portal facing West (-X)
      'B_DOM':        { x: 26.0, z: 43.0 },  // Dom Cathedral entrance facing South (+Z)
      'B_DARKSTORE':  { x:  6.6, z: 44.2 }   // Kruma Darkstore roll-up dispatch door facing East (+X)
    };

    if (locPositions[poiType]) {
      return new THREE.Vector3(locPositions[poiType].x, 0.05, locPositions[poiType].z);
    }

    // Dynamic procedural calculation if targetMesh is provided (e.g. residential delivery townhouses)
    if (fallbackPos) {
      const S = window.FFH.TILE_SCALE || 2.6;
      const gx = Math.round(fallbackPos.x / S);
      const gz = Math.round(fallbackPos.z / S);
      if (window.FFH.getBuildingRotationTowardsRoad && window.FFH.LUBECK_CITY_GRID) {
        const rot = window.FFH.getBuildingRotationTowardsRoad(window.FFH.LUBECK_CITY_GRID, gx, gz);
        const offsetX = -Math.sin(rot) * 1.4;
        const offsetZ = Math.cos(rot) * 1.4;
        return new THREE.Vector3(fallbackPos.x + offsetX, 0.05, fallbackPos.z + offsetZ);
      }
      return new THREE.Vector3(fallbackPos.x, 0.05, fallbackPos.z + 1.4);
    }

    return new THREE.Vector3(10.4, 0.05, 10.4);
  }

  getExitPosition(poiType, fallbackPos) {
    const doorPos = this.getDoorPosition(poiType, fallbackPos);
    // Step out ~1.2m further into the sidewalk/street from the doorway
    if (poiType === 'B_WG' || poiType === 'B_BAKERY' || poiType === 'B_DARKSTORE' || poiType === 'B_RATHAUS' || poiType === 'B_BURGTOR') {
      return new THREE.Vector3(doorPos.x + 1.2, 0.05, doorPos.z);
    } else if (poiType === 'B_HOLSTEN' || poiType === 'B_MARIEN') {
      return new THREE.Vector3(doorPos.x - 1.2, 0.05, doorPos.z);
    } else if (poiType === 'B_ZOB') {
      return new THREE.Vector3(doorPos.x, 0.05, doorPos.z - 1.2);
    }
    return new THREE.Vector3(doorPos.x, 0.05, doorPos.z + 1.2);
  }

  update(delta, timeSec, activePoiKey, targetMesh) {
    if (this.doorInteractionCooldown > 0) {
      this.doorInteractionCooldown -= delta;
    }

    if (activePoiKey && targetMesh && this.doorwayBeacon) {
      const doorPos = this.getDoorPosition(activePoiKey, targetMesh.position);
      this.activeDoorPos = doorPos;
      this.activeDoorPoi = activePoiKey;

      // Respect CONFIG.ui.doorBeaconEnabled (false hides all 3D beacon visuals
      const compassEnabled = window.FFH.CONFIG?.ui?.doorBeaconEnabled ?? true;
      this.doorwayBeacon.visible = compassEnabled;
      this.doorwayBeacon.position.set(doorPos.x, 0.05, doorPos.z);

      if (compassEnabled) {
        if (this.doorwayBeaconRing) {
          const ringScale = 1.0 + Math.sin(timeSec * 6) * 0.18;
          this.doorwayBeaconRing.scale.set(ringScale, ringScale, 1.0);
        }
        if (this.doorwayBeaconArrow) {
          this.doorwayBeaconArrow.position.y = 1.3 + Math.sin(timeSec * 4) * 0.22;
          this.doorwayBeaconArrow.rotation.y += delta * 2.5;
        }
        if (this.doorwaySpotlight) {
          this.doorwaySpotlight.material.opacity = 0.18 + Math.sin(timeSec * 3) * 0.08;
        }
      }

      // Auto-trigger if walked into active door zone (< 1.6m) and cooldown is clear
      if (this.doorInteractionCooldown <= 0 && !this.phase.isEnteringBuilding && !this.phase.isExitingBuilding && !this.phase.inputDisabled) {
        const distToDoor = Math.hypot(this.phase.playerPos.x - doorPos.x, this.phase.playerPos.z - doorPos.z);
        if (distToDoor < 1.6) {
          this.doorInteractionCooldown = 2.5;
          console.log(`[Doorway] Walked into active door zone of ${activePoiKey}! Triggering entry.`);
          this.phase.startBuildingEntry(activePoiKey, doorPos);
        }
      }
    } else if (this.doorwayBeacon) {
      this.doorwayBeacon.visible = false;
      this.activeDoorPos = null;
      this.activeDoorPoi = null;
    }
  }

  dispose() {
    if (this.doorwayBeacon) {
      this.game.scene.remove(this.doorwayBeacon);
      this.doorwayBeacon = null;
      this.doorwayBeaconRing = null;
      this.doorwayBeaconArrow = null;
      this.doorwaySpotlight = null;
    }
    this.activeDoorPos = null;
    this.activeDoorPoi = null;
  }
};
