// CityCamera: Manages third-person follow camera, zoom levels, scenic idle drift, and building occlusion fading.
window.FFH = window.FFH || {};

window.FFH.CityCamera = class {
  constructor(game, phase) {
    this.game = game;
    this.phase = phase;

    const CAM = (window.FFH.CONFIG && window.FFH.CONFIG.camera) || {};

    this.camZoom = CAM.defaultZoom !== undefined ? CAM.defaultZoom : 2.88;
    this.targetCamZoom = this.camZoom;
    this.minCamZoom = CAM.minZoom !== undefined ? CAM.minZoom : 1.0;
    this.maxCamZoom = CAM.maxZoom !== undefined ? CAM.maxZoom : 3.84;
    this.initialCamZoom = this.camZoom;

    this.camCurrentAngle = undefined;
    this.manualCameraAngle = undefined;
    this.cameraHoldTimer = 0;
    this.idleTimer = 0;
    this.idleDriftAngle = 0;

    this.cameraPanOffset = new THREE.Vector3(0, 0, 0);
    this.isPanningCamera = false;
    this.initialPanOffset = new THREE.Vector3(0, 0, 0);

    this.currentLookTarget = new THREE.Vector3();
    this.targetLookTarget = new THREE.Vector3();
    this.lookaheadOffset = new THREE.Vector3();
    this.targetLookahead = new THREE.Vector3();

    this.occlusionRaycaster = new THREE.Raycaster();
    this.fadedObjects = new Set();
  }

  setZoom(val) {
    this.targetCamZoom = THREE.MathUtils.clamp(val, this.minCamZoom, this.maxCamZoom);
  }

  onWheel(e) {
    e.preventDefault();
    const sensitivity = window.FFH.CONFIG?.camera?.wheelZoomSensitivity ?? 0.001;
    const zoomDelta = e.deltaY * -sensitivity;
    this.setZoom(this.targetCamZoom + zoomDelta);
  }

  resetIdle() {
    this.idleTimer = 0;
    this.idleDriftAngle = 0;
    this.manualCameraAngle = undefined;
    this.cameraHoldTimer = 0;
  }

  update(delta, timeSec, isMoving) {
    if (this.phase.isShowingInteriorModal) return;
    const cam = this.game.currentCamera;
    if (!cam) return;

    const dt = Math.min(delta || 0.016, 0.1);

    if (!this.camZoom) this.camZoom = (window.FFH.CONFIG?.camera?.defaultZoom ?? 2.88);
    if (!this.targetCamZoom) this.targetCamZoom = this.camZoom;

    // Smoothly interpolate zoom on OrthographicCamera using exponential damping
    const zoomDamp = 1.0 - Math.exp(-8.0 * dt);
    this.camZoom = THREE.MathUtils.lerp(this.camZoom, this.targetCamZoom, zoomDamp);
    if (Math.abs(cam.zoom - this.camZoom) > 0.001) {
      cam.zoom = this.camZoom;
      cam.updateProjectionMatrix();
    }

    const zoomFactor = THREE.MathUtils.clamp((this.camZoom - this.minCamZoom) / (this.maxCamZoom - this.minCamZoom), 0, 1);

    // Follow Camera pitch & distance: read from CONFIG so devs can tune without touching logic
    const CAM = (window.FFH.CONFIG && window.FFH.CONFIG.camera) || {};
    let baseDistance = THREE.MathUtils.lerp(
      CAM.baseDistanceFar   !== undefined ? CAM.baseDistanceFar   : 1.7,
      CAM.baseDistanceClose !== undefined ? CAM.baseDistanceClose : 0.70,
      zoomFactor
    );
    let baseHeight = THREE.MathUtils.lerp(
      CAM.baseHeightFar   !== undefined ? CAM.baseHeightFar   : 0.95,
      CAM.baseHeightClose !== undefined ? CAM.baseHeightClose : 0.45,
      zoomFactor
    );

    if (this.cameraHoldTimer > 0) {
      this.cameraHoldTimer -= dt;
    }

    // The camera should always stay at the fixed isometric angle (miniature mode).
    // Spinning the camera based on player heading makes point-and-click steering extremely difficult.
    const restDeg = CAM.startAngleDeg !== undefined ? CAM.startAngleDeg : 135;
    const restAngle = restDeg * Math.PI / 180;
    const isMiniature = CAM.fixedMiniature !== false;
    
    let targetAngle = restAngle;

    if (!isMiniature && this.manualCameraAngle !== undefined) {
      targetAngle = this.manualCameraAngle;
    }

    if (isMoving) {
      this.resetIdle();
    } else if (!isMiniature) {
      this.idleTimer += dt;
      const idleDelay = CAM.idleDriftDelay !== undefined ? CAM.idleDriftDelay : 5.0;
      if (this.idleTimer > idleDelay) {
        // Continuous scenic drone camera orbit around city diorama
        const droneSpeed = CAM.idleDroneSpeed !== undefined ? CAM.idleDroneSpeed : 0.08;
        this.idleDriftAngle += dt * droneSpeed;
        targetAngle += this.idleDriftAngle;
      }
    }

    if (this.camCurrentAngle === undefined || isMiniature) {
      this.camCurrentAngle = targetAngle;
    } else {
      // Shortest-path angular unwrapping to eliminate 360-degree snap / whipping
      let angleDiff = targetAngle - this.camCurrentAngle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

      // Follow camera angle damping: read from CONFIG
      const angleDampRate = isMoving
        ? (CAM.angleDampMoving !== undefined ? CAM.angleDampMoving : 6.5)
        : (CAM.angleDampIdle   !== undefined ? CAM.angleDampIdle   : 3.0);
      const angleDamp = 1.0 - Math.exp(-angleDampRate * dt);
      this.camCurrentAngle += angleDiff * angleDamp;
    }

    // Lookahead: zero in miniature mode so player remains rock-solid centered
    if (!isMiniature && isMoving && this.phase.playerHeading !== undefined) {
      const lookaheadDist = THREE.MathUtils.lerp(
        CAM.lookaheadFar   !== undefined ? CAM.lookaheadFar   : 0.15,
        CAM.lookaheadClose !== undefined ? CAM.lookaheadClose : 0.05,
        zoomFactor
      );
      this.targetLookahead.set(
        Math.sin(this.phase.playerHeading) * lookaheadDist,
        0,
        Math.cos(this.phase.playerHeading) * lookaheadDist
      );
    } else {
      this.targetLookahead.set(0, 0, 0);
    }
    const lookaheadDamp = 1.0 - Math.exp(-5.0 * dt);
    this.lookaheadOffset.lerp(this.targetLookahead, lookaheadDamp);

    // Calculate desired look-at focal point: elevated by CONFIG.camera.lookTargetYOffset
    const lookYOffset = CAM.lookTargetYOffset !== undefined ? CAM.lookTargetYOffset : 1.1;
    this.targetLookTarget.set(
      this.phase.playerPos.x + this.cameraPanOffset.x + this.lookaheadOffset.x,
      this.phase.playerPos.y + lookYOffset + this.cameraPanOffset.y,
      this.phase.playerPos.z + this.cameraPanOffset.z + this.lookaheadOffset.z
    );

    if (this.currentLookTarget.lengthSq() === 0) {
      this.currentLookTarget.copy(this.targetLookTarget);
    } else {
      const focalDampRate = CAM.focalDampRate !== undefined ? CAM.focalDampRate : 6.0;
      const focalDamp = 1.0 - Math.exp(-focalDampRate * dt);
      this.currentLookTarget.lerp(this.targetLookTarget, focalDamp);
    }

    // Ideal camera position relative to smoothed focal target
    const offsetX = Math.sin(this.camCurrentAngle) * baseDistance;
    const offsetZ = Math.cos(this.camCurrentAngle) * baseDistance;
    const offsetY = baseHeight;

    const desiredCamX = this.currentLookTarget.x + offsetX;
    const desiredCamY = this.currentLookTarget.y + offsetY;
    const desiredCamZ = this.currentLookTarget.z + offsetZ;

    // Smooth camera movement with exponential damp
    const camPosDampRate = CAM.posDampRate !== undefined ? CAM.posDampRate : 8.0;
    const camPosDamp = 1.0 - Math.exp(-camPosDampRate * dt);
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, desiredCamX, camPosDamp);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, desiredCamY, camPosDamp);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, desiredCamZ, camPosDamp);

    cam.lookAt(this.currentLookTarget.x, this.currentLookTarget.y, this.currentLookTarget.z);

    this.updateBuildingOcclusionFade();
  }

  snapToTarget() {
    const cam = this.game.currentCamera;
    if (!cam) return;
    if (Math.abs(cam.zoom - this.camZoom) > 0.001) {
      cam.zoom = this.camZoom;
      cam.updateProjectionMatrix();
    }
    const zoomFactor = THREE.MathUtils.clamp((this.camZoom - this.minCamZoom) / (this.maxCamZoom - this.minCamZoom), 0, 1);
    const CAM = (window.FFH.CONFIG && window.FFH.CONFIG.camera) || {};
    let baseDistance = THREE.MathUtils.lerp(
      CAM.baseDistanceFar   !== undefined ? CAM.baseDistanceFar   : 1.7,
      CAM.baseDistanceClose !== undefined ? CAM.baseDistanceClose : 0.70,
      zoomFactor
    );
    let baseHeight = THREE.MathUtils.lerp(
      CAM.baseHeightFar   !== undefined ? CAM.baseHeightFar   : 0.95,
      CAM.baseHeightClose !== undefined ? CAM.baseHeightClose : 0.45,
      zoomFactor
    );
    const lookYOffset = CAM.lookTargetYOffset !== undefined ? CAM.lookTargetYOffset : 1.1;

    // Use CONFIG.camera.startAngleDeg if set, otherwise fall back to playerHeading + 180°
    const startAngleDeg = CAM.startAngleDeg !== undefined ? CAM.startAngleDeg : null;
    let targetAngle = startAngleDeg !== null
      ? (startAngleDeg * Math.PI / 180)
      : (this.phase.playerHeading !== undefined ? this.phase.playerHeading : Math.PI / 4) + Math.PI;
    this.camCurrentAngle = targetAngle;
    this.lookaheadOffset.set(0, 0, 0);
    this.targetLookahead.set(0, 0, 0);

    const lookTargetX = this.phase.playerPos.x + this.cameraPanOffset.x;
    const lookTargetY = this.phase.playerPos.y + lookYOffset;
    const lookTargetZ = this.phase.playerPos.z + this.cameraPanOffset.z;

    this.currentLookTarget.set(lookTargetX, lookTargetY, lookTargetZ);
    this.targetLookTarget.set(lookTargetX, lookTargetY, lookTargetZ);

    const offsetX = Math.sin(this.camCurrentAngle) * baseDistance;
    const offsetZ = Math.cos(this.camCurrentAngle) * baseDistance;
    const offsetY = baseHeight;

    cam.position.set(lookTargetX + offsetX, lookTargetY + offsetY, lookTargetZ + offsetZ);
    cam.lookAt(lookTargetX, lookTargetY, lookTargetZ);
  }

  updateBuildingOcclusionFade() {
    const cam = this.game.currentCamera;
    if (!cam) return;
    if (this.camZoom < 0.6) return;

    // Cast FROM player TO camera so we hit the front faces of buildings reliably
    const charPos = new THREE.Vector3(this.phase.playerPos.x, this.phase.playerPos.y + 0.8, this.phase.playerPos.z);
    const camPos = cam.position.clone();
    const rayDir = new THREE.Vector3().subVectors(camPos, charPos).normalize();
    const rayDist = camPos.distanceTo(charPos);

    // Create a "fat ray" using 5 rays (center, left, right, up, down) relative to the camera's orientation
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion).normalize();
    const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion).normalize();
    const spread = 0.8; // How wide the fat ray is

    const offsets = [
      new THREE.Vector3(0, 0, 0),
      camRight.clone().multiplyScalar(-spread),
      camRight.clone().multiplyScalar(spread),
      camUp.clone().multiplyScalar(spread),
      camUp.clone().multiplyScalar(-spread)
    ];

    const currentlyHitMeshes = new Set();

    const targets = (this.phase.buildingMeshes && this.phase.buildingMeshes.length > 0)
      ? this.phase.buildingMeshes
      : this.phase.interactiveMeshes;

    offsets.forEach(offset => {
      const rayStart = charPos.clone().add(offset);
      this.occlusionRaycaster.set(rayStart, rayDir);
      this.occlusionRaycaster.near = 0.1;
      this.occlusionRaycaster.far = rayDist;

      const hits = this.occlusionRaycaster.intersectObjects(targets, true);
      hits.forEach(hit => {
        let root = hit.object;
        while (root.parent && root.parent !== this.phase.worldGroup && root.parent !== this.game.scene) {
          root = root.parent;
        }
        currentlyHitMeshes.add(root);
      });
    });

    const CAM = (window.FFH.CONFIG && window.FFH.CONFIG.camera) || {};
    const targetOpacity = CAM.occlusionOpacity !== undefined ? CAM.occlusionOpacity : 0.05;

    currentlyHitMeshes.forEach(group => {
      this.fadedObjects.add(group);
      group.traverse(child => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => {
            // Make the blocking building almost completely invisible (0.05) instead of ghosting
            m.opacity = THREE.MathUtils.lerp(m.opacity, targetOpacity, 0.2);
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
              m.opacity = THREE.MathUtils.lerp(m.opacity, 1.0, 0.2);
              if (m.opacity < 0.98) allRestored = false;
              else m.opacity = 1.0;
            });
          }
        });
        if (allRestored) {
          this.fadedObjects.delete(group);
        }
      }
    });
  }

  dispose() {
    if (this.game.currentCamera) {
      this.game.currentCamera.zoom = 1.0;
      this.game.currentCamera.updateProjectionMatrix();
    }
    this.fadedObjects.clear();
  }
};
