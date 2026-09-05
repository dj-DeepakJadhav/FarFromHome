// CityInput: Manages touch joystick, tap-to-move pointer gestures, WASD/arrow keyboard input, and pointer camera orbit.
window.FFH = window.FFH || {};

window.FFH.CityInput = class {
  constructor(game, phase) {
    this.game = game;
    this.phase = phase;

    // Movement state
    this.directMoveVector = { x: 0, z: 0, strength: 0 };
    this.keysDown = {};

    // Touch joystick state
    this.isTouchDragging = false;
    this.dragOriginX = 0;
    this.dragOriginY = 0;
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.touchStartTime = 0;
    this.touchJoystickEl = null;
    this.touchKnobEl = null;
    this.initialPinchDist = null;

    // Pointer state
    this.isPointerDown = false;
    this.isDraggingCamera = false;
    this.pointerDownX = 0;
    this.pointerDownY = 0;
    this.lastPointerX = 0;
    this.lastPointerY = 0;
    this.pointerDownTime = 0;

    // Double tap detection
    this.lastTapTime = 0;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onContextMenu = (e) => e.preventDefault();
  }

  attach() {
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
    window.addEventListener('keyup', this.onKeyUp);
  }

  detach() {
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
    window.removeEventListener('keyup', this.onKeyUp);
    this.hideTouchJoystick();
  }

  onKeyDown(e) {
    this.keysDown[e.key.toLowerCase()] = true;
  }

  onKeyUp(e) {
    this.keysDown[e.key.toLowerCase()] = false;
  }

  onWheel(e) {
    if (this.phase.cameraController) {
      this.phase.cameraController.onWheel(e);
    }
  }

  onTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.initialPinchDist = Math.hypot(dx, dy);
      if (this.phase.cameraController) {
        this.phase.cameraController.initialCamZoom = this.phase.cameraController.targetCamZoom;
      }
      this.isTouchDragging = false;
      this.hideTouchJoystick();
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch.target.closest('#title-bar') || touch.target.closest('#city-poi-card') || 
          touch.target.closest('#tab-home') || touch.target.closest('#tab-work') || touch.target.closest('#tab-shop')) {
        return;
      }
      this.isTouchDragging = true;
      this.dragOriginX = touch.clientX;
      this.dragOriginY = touch.clientY;
      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;
      this.touchStartTime = Date.now();
      // Lock reference camera angle at the moment of touch to decouple from dynamic camera tracking
      this.touchBaseCamAngle = this.phase.cameraController?.camCurrentAngle !== undefined 
        ? this.phase.cameraController.camCurrentAngle 
        : 0;
      this.showTouchJoystick(touch.clientX, touch.clientY);
    }
  }

  updateDragVector(clientX, clientY) {
    this.lastTouchX = clientX;
    this.lastTouchY = clientY;
    const dx = clientX - this.dragOriginX;
    const dy = clientY - this.dragOriginY;
    const dist = Math.hypot(dx, dy);

    const TOUCH = (window.FFH.CONFIG && window.FFH.CONFIG.touch) || {};
    const smoothRate = TOUCH.smoothRate !== undefined ? TOUCH.smoothRate : 0.28;

    if (TOUCH.messengerStyleInput) {
      // True Messenger Style: Continuous follow cursor (Raycast to ground)
      const rect = this.game.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      this.phase.raycaster.setFromCamera(mouse, this.game.currentCamera);
      const hits = this.phase.raycaster.intersectObjects(this.phase.groundMeshes, true);
      
      if (hits.length > 0) {
        this.phase.playerPath = [];
        this.phase.targetMovePos = null;
        if (this.phase.targetMarker) this.phase.targetMarker.visible = false;

        const hit = hits[0].point;
        const dirX = hit.x - this.phase.playerPos.x;
        const dirZ = hit.z - this.phase.playerPos.z;
        const distToHit = Math.hypot(dirX, dirZ);

        // Stop jittering when hovering directly over the player
        if (distToHit > 0.4) {
          const normX = dirX / distToHit;
          const normZ = dirZ / distToHit;
          this.directMoveVector.x = THREE.MathUtils.lerp(this.directMoveVector.x, normX, smoothRate);
          this.directMoveVector.z = THREE.MathUtils.lerp(this.directMoveVector.z, normZ, smoothRate);
          this.directMoveVector.strength = THREE.MathUtils.lerp(this.directMoveVector.strength, 1.0, smoothRate);
        } else {
          this.directMoveVector.strength = THREE.MathUtils.lerp(this.directMoveVector.strength, 0, 0.45);
        }
      }
      return;
    }

    const deadzone  = TOUCH.deadzone      !== undefined ? TOUCH.deadzone      : 18;
    const maxRadius = TOUCH.maxRadius     !== undefined ? TOUCH.maxRadius     : 75;
    const curve     = TOUCH.responseCurve !== undefined ? TOUCH.responseCurve : 1.8;

    if (dist > deadzone) {
      this.phase.playerPath = [];
      this.phase.targetMovePos = null;
      if (this.phase.targetMarker) this.phase.targetMarker.visible = false;

      const effectiveDist = Math.min(dist - deadzone, maxRadius - deadzone);
      const linearNorm = effectiveDist / (maxRadius - deadzone);
      const curvedStrength = Math.pow(linearNorm, curve);

      const camAngle = this.touchBaseCamAngle !== undefined 
        ? this.touchBaseCamAngle 
        : (this.phase.cameraController?.camCurrentAngle || 0);

      const forwardX = -Math.sin(camAngle);
      const forwardZ = -Math.cos(camAngle);
      const rightX = Math.cos(camAngle);
      const rightZ = -Math.sin(camAngle);

      const screenFwd = -dy / dist;
      const screenRt = dx / dist;

      const targetWorldX = rightX * screenRt + forwardX * screenFwd;
      const targetWorldZ = rightZ * screenRt + forwardZ * screenFwd;

      this.directMoveVector.x = THREE.MathUtils.lerp(this.directMoveVector.x, targetWorldX, smoothRate);
      this.directMoveVector.z = THREE.MathUtils.lerp(this.directMoveVector.z, targetWorldZ, smoothRate);
      this.directMoveVector.strength = THREE.MathUtils.lerp(this.directMoveVector.strength, curvedStrength, smoothRate);

      this.updateTouchJoystickKnob(dx, dy, maxRadius);
    } else {
      this.directMoveVector.strength = THREE.MathUtils.lerp(this.directMoveVector.strength, 0, 0.45);
      if (this.directMoveVector.strength < 0.02) {
        this.directMoveVector.strength = 0;
        this.directMoveVector.x = 0;
        this.directMoveVector.z = 0;
      }
      this.updateTouchJoystickKnob(0, 0, maxRadius);
    }
  }

  onTouchMove(e) {
    if (e.touches.length === 2 && this.initialPinchDist) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / this.initialPinchDist;
      if (this.phase.cameraController) {
        this.phase.cameraController.setZoom(this.phase.cameraController.initialCamZoom * factor);
      }
      return;
    }

    if (this.isTouchDragging && e.touches.length === 1) {
      this.updateDragVector(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  onTouchEnd(e) {
    if (e.touches.length < 2) {
      this.initialPinchDist = null;
    }
    if (this.isTouchDragging) {
      const elapsed = Date.now() - (this.touchStartTime || 0);
      const dragDist = Math.hypot((this.lastTouchX || this.dragOriginX) - this.dragOriginX, (this.lastTouchY || this.dragOriginY) - this.dragOriginY);

      this.isTouchDragging = false;
      this.directMoveVector.strength = 0;
      this.directMoveVector.x = 0;
      this.directMoveVector.z = 0;
      this.hideTouchJoystick();

      const TOUCH = (window.FFH.CONFIG && window.FFH.CONFIG.touch) || {};
      const tapMaxDrag = TOUCH.tapMaxDragPx !== undefined ? TOUCH.tapMaxDragPx : 16;
      const tapMaxMs   = TOUCH.tapMaxMs     !== undefined ? TOUCH.tapMaxMs     : 350;
      if (dragDist < tapMaxDrag && elapsed < tapMaxMs) {
        this.phase.handleSingleOrDoubleTap({
          clientX: this.lastTouchX || this.dragOriginX,
          clientY: this.lastTouchY || this.dragOriginY
        });
      }
    }
  }

  showTouchJoystick(x, y) {
    if (window.FFH.CONFIG?.touch?.messengerStyleInput) return; // Hide UI
    if (!this.touchJoystickEl) {
      this.touchJoystickEl = document.createElement('div');
      this.touchJoystickEl.id = 'ffh-touch-joystick';
      this.touchJoystickEl.style.cssText = `
        position: fixed;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(46,196,182,0.2) 0%, rgba(20,25,35,0.45) 75%);
        border: 2.5px solid rgba(46,196,182,0.65);
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        display: none;
        box-shadow: 0 0 20px rgba(46,196,182,0.3);
      `;
      this.touchKnobEl = document.createElement('div');
      this.touchKnobEl.style.cssText = `
        position: absolute;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #2EC4B6;
        box-shadow: 0 3px 10px rgba(0,0,0,0.45), inset 0 1px 3px rgba(255,255,255,0.6);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
      this.touchJoystickEl.appendChild(this.touchKnobEl);
      document.body.appendChild(this.touchJoystickEl);
    }
    this.touchJoystickEl.style.left = `${x}px`;
    this.touchJoystickEl.style.top = `${y}px`;
    this.touchJoystickEl.style.display = 'block';
    if (this.touchKnobEl) {
      this.touchKnobEl.style.transform = 'translate(-50%, -50%)';
    }
  }

  updateTouchJoystickKnob(dx, dy, maxRadius) {
    if (window.FFH.CONFIG?.touch?.messengerStyleInput) return; // Hide UI
    if (!this.touchKnobEl) return;
    const dist = Math.hypot(dx, dy);
    let knobX = dx;
    let knobY = dy;
    if (dist > maxRadius) {
      knobX = (dx / dist) * maxRadius;
      knobY = (dy / dist) * maxRadius;
    }
    this.touchKnobEl.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  }

  hideTouchJoystick() {
    if (this.touchJoystickEl) {
      this.touchJoystickEl.style.display = 'none';
    }
  }

  onPointerDown(e) {
    if (e.pointerType === 'touch') return;
    if (e.target.closest('#title-bar') || e.target.closest('#city-poi-card') || 
        e.target.closest('#tab-home') || e.target.closest('#tab-work') || e.target.closest('#tab-shop')) return;
    
    this.pointerDownX = e.clientX;
    this.pointerDownY = e.clientY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.pointerDownTime = Date.now();

    if (e.button === 2 || e.button === 1 || e.shiftKey) {
      if (this.phase.cameraController) {
        this.phase.cameraController.isPanningCamera = true;
        this.phase.cameraController.initialPanOffset.copy(this.phase.cameraController.cameraPanOffset);
      }
      return;
    }

    this.isPointerDown = true;
    this.isDraggingCamera = false;

    if (window.FFH.CONFIG?.touch?.messengerStyleInput) {
      this.isTouchDragging = true;
      this.dragOriginX = e.clientX;
      this.dragOriginY = e.clientY;
      this.lastTouchX = e.clientX;
      this.lastTouchY = e.clientY;
      this.touchStartTime = Date.now();
      this.touchBaseCamAngle = this.phase.cameraController?.camCurrentAngle !== undefined 
        ? this.phase.cameraController.camCurrentAngle 
        : 0;
    }
  }

  onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    if (this.phase.cameraController?.isPanningCamera) {
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      return;
    }

    if (!this.isPointerDown) return;

    if (window.FFH.CONFIG?.touch?.messengerStyleInput) {
      // Messenger style: drag steers character, does not orbit camera
      if (this.isTouchDragging) {
        this.updateDragVector(e.clientX, e.clientY);
      }
      return;
    }

    // Original style: drag orbits camera
    const dragDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
    if (dragDist > 8 && this.phase.cameraController) {
      this.isDraggingCamera = true;
      const dx = e.clientX - this.lastPointerX;
      if (this.phase.cameraController.manualCameraAngle === undefined) {
        this.phase.cameraController.manualCameraAngle = this.phase.cameraController.camCurrentAngle !== undefined 
          ? this.phase.cameraController.camCurrentAngle 
          : (Math.PI / 4 + Math.PI);
      }
      const orbitSens = window.FFH.CONFIG?.camera?.orbitSensitivity ?? 0.01;
      this.phase.cameraController.manualCameraAngle -= dx * orbitSens;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    }
  }

  onPointerUp(e) {
    if (e.pointerType === 'touch') return;
    if (this.phase.cameraController?.isPanningCamera) {
      this.phase.cameraController.isPanningCamera = false;
      return;
    }
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    
    if (window.FFH.CONFIG?.touch?.messengerStyleInput) {
      if (this.isTouchDragging) {
        this.isTouchDragging = false;
        this.directMoveVector.strength = 0;
        this.directMoveVector.x = 0;
        this.directMoveVector.z = 0;
      }
    }

    const elapsed = Date.now() - this.pointerDownTime;
    const dragDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);

    if (dragDist < 8 && elapsed < 400) {
      this.phase.handleSingleOrDoubleTap(e);
    }
  }

  getMoveIntent(camAngle) {
    let keyFwd = 0;
    let keyRt = 0;
    if (this.keysDown['w'] || this.keysDown['arrowup']) keyFwd += 1;
    if (this.keysDown['s'] || this.keysDown['arrowdown']) keyFwd -= 1;
    if (this.keysDown['d'] || this.keysDown['arrowright']) keyRt += 1;
    if (this.keysDown['a'] || this.keysDown['arrowleft']) keyRt -= 1;

    if (keyFwd !== 0 || keyRt !== 0) {
      const fwdX = -Math.sin(camAngle);
      const fwdZ = -Math.cos(camAngle);
      const rtX = Math.cos(camAngle);
      const rtZ = -Math.sin(camAngle);

      const len = Math.hypot(keyFwd, keyRt);
      keyFwd /= len;
      keyRt /= len;

      return {
        moveDirX: rtX * keyRt + fwdX * keyFwd,
        moveDirZ: rtZ * keyRt + fwdZ * keyFwd,
        moveSpeedRatio: 1.0,
        isDirect: true
      };
    } else if (this.directMoveVector.strength > 0.05) {
      return {
        moveDirX: this.directMoveVector.x,
        moveDirZ: this.directMoveVector.z,
        moveSpeedRatio: this.directMoveVector.strength,
        isDirect: true
      };
    }

    return { moveDirX: 0, moveDirZ: 0, moveSpeedRatio: 0, isDirect: false };
  }
};
