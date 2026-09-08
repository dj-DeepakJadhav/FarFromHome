// Phase 1: Warehouse packing.
//
// This is the core action of the whole game: read the order, find the item,
// tap it. Everything else in the loop is pressure and payoff around this.
window.FFH.PickPhase = class {
  constructor(game) {
    this.game = game;
    this.shelfGroup = null;
    this.shelvedMeshes = [];
    this.tagRails = [];
    this.bagMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.activePicksCount = 0;
    this.shift = null;
    this.timeRemaining = 0;
    this.briefingHold = false;
    this.pickDuration = 0;

    this.onTap = this.onTap.bind(this);
  }

  enter(params = {}) {
    const state = this.game.state;
    this.currentStoryParams = params;
    this.briefingHold = false;
    this.finishing = false;
    this.promptElapsed = 0;

    // Every per-shift meter resets here.
    window.FFH.resetShiftState(state);

    // Hide the city exploration world meshes entirely during warehouse picking
    if (this.game.phases.CITY_EXPLORATION.worldGroup) {
      this.game.phases.CITY_EXPLORATION.worldGroup.visible = false;
    }
    if (this.game.phases.CITY_EXPLORATION.courier) {
      this.game.phases.CITY_EXPLORATION.courier.visible = false;
    }

    this.shelvedMeshes = [];
    this.tagRails = [];
    this.activePicksCount = 0;
    this.shift = window.FFH.getShift(state.currentShift);
    
    // Check if VIP Express Rush mode was chosen
    if (state.isVipRush) {
      this.timeRemaining = Math.max(12, Math.round((this.shift.pickTimeLimit || 25) * 0.75));
    } else {
      this.timeRemaining = this.shift.pickTimeLimit || 25;
    }
    this.pickDuration = this.timeRemaining;

    state.activeOrder = this.buildOrder(this.shift);
    
    // Position room and shelves at origin (0, 0, 0)
    this.shelfWorldPos = new THREE.Vector3(0, 0.4, 0);
    
    // Spawn warehouse diorama room shell
    this.warehouseRoom = window.FFH.createWarehouseRoom ? window.FFH.createWarehouseRoom() : window.FFH.createRoomShell(0x8ECAE6, 0x489FB5);
    this.warehouseRoom.position.set(0, 0, 0);
    this.game.scene.add(this.warehouseRoom);

    // Build picking shelves
    this.buildShelf(this.shift, state.activeOrder);

    // Paper bag the picked items drop into
    const bagGeo = new THREE.BoxGeometry(0.8, 1.0, 0.6);
    const bagMat = window.FFH.createCelMaterial(0xD2B48C);
    this.bagMesh = new THREE.Mesh(bagGeo, bagMat);
    
    // Position bag near the shelf inside the room
    this.bagMesh.position.set(1.0, 0.1, 1.0);
    this.game.scene.add(this.bagMesh);

    // Start the first cue in update, after the briefing and camera settle.
    // Otherwise the early-pick window expires while the player reads Klaus.

    this.game.ui.showWarehouseManifest();
    window.addEventListener('pointerdown', this.onTap);

    if (this.currentStoryParams && this.currentStoryParams.storyScene) {
      const sceneId = this.currentStoryParams.storyScene.id;
      if (sceneId === 'shift_1_teach') {
        setTimeout(() => {
          this.game.ui.showTutorialBanner("SHELF MAP  •  BLUE ▲ bottom  •  PINK ● middle  •  PURPLE ■ top", '#2EC4B6', 6000);
        }, 300);
      } else if (sceneId === 'shift_2_anticipate') {
        setTimeout(() => {
          this.game.ui.showTutorialBanner("Rail first: tap any grocery on the lit shelf before the name appears for an Early Pick.", '#FF9F1C', 8000);
        }, 300);
      } else if (sceneId === 'shift_3_test') {
        setTimeout(() => {
          this.game.ui.showTutorialBanner("Before the name: tap the lit shelf. After the name: find that grocery.", '#E76F51', 8000);
        }, 300);
      }
    } else if (state.isVipRush) {
      setTimeout(() => {
        this.game.ui.showTutorialBanner(`🔥 VIP EXPRESS RUSH: 2.5x Customer Tips Active! (Fast Timer)`, '#FF006E', 6000);
      }, 300);
    } else if (this.shift && this.shift.briefing) {
      setTimeout(() => {
        this.game.ui.showTutorialBanner(`📦 ${this.shift.name}: ${this.shift.briefing}`, '#3A86FF', 6000);
      }, 400);
    }
    // Setup camera target for the shelf (zooming in close to the 3-tier shelves at origin)
    const cam = this.game.cameras.mainCamera;
    this.startCamPos = new THREE.Vector3().copy(cam.position);
    this.startCamZoom = cam.zoom || 1.0;
    this.endCamTarget = new THREE.Vector3(0, 1.45, 0);
    // Offset matching isometric camera angle (down and facing front of shelf)
    // Near-frontal, not isometric. At height 13.5 the camera looked down at 44
    // degrees, so every shelf plank occluded the tier beneath it and the middle
    // and bottom rows were barely readable. Height 4.5 is ~18 degrees: still
    // dimensional, but all three tiers present their faces to the player.
    this.endCamPos = this.endCamTarget.clone().add(new THREE.Vector3(10.0, 4.5, 10.0));
    // The shelf occupied ~4.6% of a 390x844 screen at zoom 2.4, with ~35px
    // between adjacent items, below the 44px minimum touch target.
    this.endCamZoom = 2.75;
    
    this.isTransitioning = true;
    this.transitionTime = 0;
  }

  update(delta) {
    const cam = this.game.cameras.mainCamera;
    // Camera transition
    if (this.isTransitioning) {
      this.transitionTime += delta * 2.5;
      if (this.transitionTime >= 1.0) {
        this.transitionTime = 1.0;
        this.isTransitioning = false;
      }
      const t = this.transitionTime < 0.5 ? 2 * this.transitionTime * this.transitionTime : -1 + (4 - 2 * this.transitionTime) * this.transitionTime;
      cam.position.lerpVectors(this.startCamPos, this.endCamPos, t);
      if (cam.isOrthographicCamera) {
        cam.zoom = THREE.MathUtils.lerp(this.startCamZoom, this.endCamZoom, t);
        cam.updateProjectionMatrix();
      }
      
      cam.lookAt(this.endCamTarget);
    } else {
      if (cam.isOrthographicCamera && cam.zoom !== this.endCamZoom) {
        cam.zoom = this.endCamZoom;
        cam.updateProjectionMatrix();
      }
      cam.position.copy(this.endCamPos);
      cam.lookAt(this.endCamTarget);
    }

    // Idle spin on every un-packed item, so its silhouette reads from all sides
    // rather than presenting one flat face to a near-frontal camera.
    if (this.shelvedMeshes) {
      for (const m of this.shelvedMeshes) {
        if (m.visible && m.userData && m.userData.spinSpeed) {
          m.rotation.y += m.userData.spinSpeed * delta;
        }
      }
    }

    // The shift clock is held while the briefing prose plays over the shelf.
    // It used to run during the briefing, so the player lost seconds reading
    // text they could not skip past.
    if (this.timeRemaining > 0 && !this.briefingHold && !this.isTransitioning && !this.finishing) {
      this.timeRemaining = Math.max(0, this.timeRemaining - delta);
      
      // Decay freshness off elapsed pick time
      const decayRatio = delta / this.pickDuration;
      const state = this.game.state;
      state.freshness = Math.max(0, state.freshness - (decayRatio * 35));

      // Refresh HUD timer and freshness bar
      if (this.game.ui && this.game.ui.updatePickHUD) {
        this.game.ui.updatePickHUD(this.timeRemaining, this.pickDuration, state.freshness);
      }

      // Check current active prompt and manage state
      const currentPrompt = state.activeOrder ? state.activeOrder.find(it => !it.packed) : null;
      if (currentPrompt) {
        if (!currentPrompt.promptStarted) {
          currentPrompt.promptStarted = true;
          this.promptElapsed = 0;
          const delay = this.currentStoryParams && this.currentStoryParams.iconDelay !== undefined
            ? this.currentStoryParams.iconDelay
            : window.FFH.iconRevealDelay(state.currentShift, state.upgrades);
          currentPrompt.revealDelay = delay;
          currentPrompt.revealed = delay === 0;
          this.game.speech.playTalkBlip('NPC_NINA');
          this.pulseRailForGender(currentPrompt.gender);
          this.game.ui.showWarehouseManifest();
        } else if (!currentPrompt.revealed) {
          this.promptElapsed += delta;
          if (this.promptElapsed >= currentPrompt.revealDelay) {
            currentPrompt.revealed = true;
            this.game.ui.showWarehouseManifest();
          }
        }
      }

      // Time expired: end shift with whatever was packed
      if (this.timeRemaining <= 0) {
        this.finishing = true;
        this.exit();
        // Pre-compute last payout in case time runs out
        this.game.lastPayout = window.FFH.calculatePayout(this.game.state);

        // Record trial performance for story gates. The bar is deliberately low:
        // you only fail by barely engaging. Anyone actually playing passes.
        window.FFH.recordShiftPerformance(this.game.state);

        // If triggered via StoryRunner, hand control back to the story engine
        if (this.currentStoryParams && typeof this.currentStoryParams.onComplete === 'function') {
          const callback = this.currentStoryParams.onComplete;
          this.currentStoryParams = null;
          callback();
          return;
        }
        
        // Select random Altbau townhouse as delivery destination
        const pool = [];
        const grid = window.FFH.LUBECK_CITY_GRID;
        for (let z = 0; z < grid.length; z++) {
          for (let x = 0; x < grid[z].length; x++) {
            const type = grid[z][x];
            if (type.startsWith('A') || type.startsWith('B_')) {
              // Exclude Dark Store (starting point)
              if (type !== 'B_DARKSTORE') {
                const poi = window.FFH.POI_METADATA[type];
                pool.push({ x, z, name: poi ? poi.name : `Altbau Townhouse #${x}-${z}` });
              }
            }
          }
        }
        const target = pool[Math.floor(Math.random() * pool.length)] || { x: 9, z: 3, name: 'Altbau Townhouse #9-3' };
        this.game.state.activeDelivery = true;
        this.game.state.deliveryTarget = {
          gridX: target.x,
          gridZ: target.z,
          name: target.name
        };
        
        // Ride Phase is removed to keep continuous isometric city delivery.
        this.game.transitionTo('CITY_EXPLORATION');
      }
    }
  }

  // The order ticket. Items may repeat - buildShelf guarantees enough copies.
  buildOrder(shift) {
    // If running under StoryRunner with explicit storyScene items
    if (this.currentStoryParams && this.currentStoryParams.storyScene) {
      const sceneId = this.currentStoryParams.storyScene.id;
      let manifestIds = null;
      if (sceneId === 'shift_1_teach') {
        manifestIds = ['milch', 'kaese', 'brot'];
      } else if (sceneId === 'shift_2_anticipate') {
        manifestIds = ['kaese', 'milch', 'apfel', 'brot'];
      } else if (sceneId === 'shift_3_test') {
        // 'karton' is not an item id (the carton is 'milch'), so the Aha shift
        // silently ran four items instead of the five it declares. 'karotte'
        // keeps the tier spread even: der x2, die x2, das x1.
        manifestIds = ['apfel', 'milch', 'brot', 'kaese', 'karotte'];
      }

      if (manifestIds) {
        const order = [];
        for (const id of manifestIds) {
          const itemData = window.FFH.items.find(it => it.id.toLowerCase() === id.toLowerCase());
          if (itemData) {
            order.push({ ...itemData, packed: false });
          }
        }
        if (order.length > 0) return order;
      }
    }

    const pool = window.FFH.getShiftItemPool(shift.index);
    const order = [];

    for (let i = 0; i < shift.itemsCount; i++) {
      const itemId = pool[Math.floor(Math.random() * pool.length)];
      const itemData = window.FFH.items.find(it => it.id === itemId);
      order.push({ ...itemData, packed: false });
    }
    return order;
  }

  // Fills the shelf so that EVERY ordered item (including duplicates) has a
  // mesh to tap, then pads the remaining slots with decoys.
  //
  // The previous version filled all 12 slots at random from the full deck,
  // independently of the order - so an ordered item could simply not be on the
  // shelf and the phase could never complete. That was a hard soft-lock.
  // Builds the 3-tier shelves and populates items/labels (decoupled into pickShelfView.js)
  buildShelf(shift, order) {
    const res = window.FFH.buildWarehouseShelf({
      shift,
      order,
      upgrades: this.game.state.upgrades,
      shelfWorldPos: this.shelfWorldPos,
      scene: this.game.scene
    });
    this.shelfGroup = res.shelfGroup;
    this.shelvedMeshes = res.shelvedMeshes;
    this.tagRails = res.tagRails;
  }

  onTap(e) {
    if (this.briefingHold || this.isTransitioning || this.finishing
        || document.hidden || document.getElementById('ffh-pause-modal')) return;
    // Only handle tap if not clicking on HTML UI
    if (e.target && e.target.closest('#ui-container')) {
      return;
    }

    const rect = this.game.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const cam = this.game.cameras.mainCamera;
    this.raycaster.setFromCamera(this.mouse, cam);
    const intersects = this.raycaster.intersectObjects(this.shelvedMeshes, true);
    if (intersects.length === 0) return;

    // Walk up to the group that carries userData
    let target = intersects[0].object;
    while (target.parent && !target.userData.id) {
      target = target.parent;
    }
    if (!target.userData || !target.userData.id) return;

    const state = this.game.state;
    const itemDef = target.userData.def;
    const prompt = state.activeOrder.find(it => !it.packed);
    if (prompt && prompt.promptStarted && !prompt.revealed && prompt.revealDelay > 0) {
      // Before the item is revealed, colour is the only information available.
      // Accept any grocery on that tier and pack the actual prompted item.
      if (itemDef.gender === prompt.gender) {
        const promptedMesh = this.shelvedMeshes.find(m => m.userData.id === prompt.id);
        if (promptedMesh) this.onCorrectPick(prompt, prompt, promptedMesh, e.clientX, e.clientY);
      } else {
        this.onMispick(target, e.clientX, e.clientY);
      }
      return;
    }
    const neededItem = state.activeOrder.find(it => it.id === target.userData.id && !it.packed);

    if (neededItem) {
      this.onCorrectPick(neededItem, itemDef, target, e.clientX, e.clientY);
    } else {
      this.onMispick(target, e.clientX, e.clientY);
    }
  }

  onCorrectPick(orderLine, itemDef, mesh, eClientX, eClientY) {
    if (this.finishing || orderLine.packed) return;
    const state = this.game.state;

    const isEarly = !!orderLine.promptStarted && !orderLine.revealed && orderLine.revealDelay > 0;
    orderLine.packed = true;
    orderLine.pickedEarly = isEarly;
    
    this.activePicksCount++;

    if (isEarly) {
      state.streak += 2; // Extra streak step
      state.stats.wordsLearned = (state.stats.wordsLearned || 0) + 1;
    } else {
      state.streak++;
    }
    
    state.stats.itemsPacked++;
    state.shiftBestStreak = Math.max(state.shiftBestStreak, state.streak);
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.streak);

    this.game.sfx.playSfx(isEarly ? 'early_success' : 'success');
    
    // Gold particles for early pick, normal item color for late pick
    const particleColor = isEarly ? '#FFD700' : itemDef.hex;
    this.game.particles.spawnBurst(mesh.position.x, mesh.position.y, mesh.position.z, particleColor);
    this.game.particles.spawnStarSparkles(mesh.position.x, mesh.position.y, mesh.position.z);
    
    // Spawn floating score / combo text
    const streakLabel = state.streak > 1 ? ` (x${window.FFH.streakMultiplier(state.streak).toFixed(1)})` : '';
    // English-first, no emoji. "gehört!" was a leftover from the abandoned
    // audio-cue design and nameDe alone broke the zero-language-burden rule.
    const labelText = isEarly
      ? `EARLY  +${itemDef.nameEn}${streakLabel}`
      : `+${itemDef.nameEn}${streakLabel}`;
    const labelColor = isEarly ? '#FFD700' : '#2A9D8F';
    this.game.ui.spawnFloatingText(labelText, eClientX || window.innerWidth / 2, eClientY || window.innerHeight / 2, labelColor);
    if (this.game.ui.showPickOutcome) {
      this.game.ui.showPickOutcome(isEarly ? 'early' : 'correct', itemDef.nameEn);
    }

    this.animateBagDrop(mesh);
    this.game.ui.showWarehouseManifest();

    if (this.activePicksCount >= state.activeOrder.length) {
      this.finishing = true;
      this.completionTimer = setTimeout(() => {
        this.completionTimer = null;
        this.exit();
        // Pre-compute last payout
        this.game.lastPayout = window.FFH.calculatePayout(this.game.state);

        // Order fully packed: performance recorded on this path too.
        window.FFH.recordShiftPerformance(this.game.state);

        // If triggered via StoryRunner, hand control back to the story engine
        if (this.currentStoryParams && typeof this.currentStoryParams.onComplete === 'function') {
          const callback = this.currentStoryParams.onComplete;
          this.currentStoryParams = null;
          callback();
          return;
        }
        
        const pool = [];
        const grid = window.FFH.LUBECK_CITY_GRID;
        for (let z = 0; z < grid.length; z++) {
          for (let x = 0; x < grid[z].length; x++) {
            const type = grid[z][x];
            if (type.startsWith('A') || type.startsWith('B_')) {
              // Exclude Dark Store (starting point)
              if (type !== 'B_DARKSTORE') {
                const poi = window.FFH.POI_METADATA[type];
                pool.push({ x, z, name: poi ? poi.name : `Altbau Townhouse #${x}-${z}` });
              }
            }
          }
        }
        const target = pool[Math.floor(Math.random() * pool.length)] || { x: 9, z: 3, name: 'Altbau Townhouse #9-3' };
        this.game.state.activeDelivery = true;
        this.game.state.deliveryTarget = {
          gridX: target.x,
          gridZ: target.z,
          name: target.name
        };
        
        // Ride Phase is removed to keep continuous isometric city delivery.
        this.game.transitionTo('CITY_EXPLORATION');
      }, 700);
    }
  }

  onMispick(mesh, eClientX, eClientY) {
    const state = this.game.state;

    state.streak = 0;
    state.mispicks++;
    state.stats.totalMispicks++;
    state.bagIntegrity = Math.max(0, state.bagIntegrity - window.FFH.ECONOMY.MISPICK_INTEGRITY_COST);

    this.game.sfx.playSfx('error');
    this.game.particles.spawnErrorSparks(mesh.position.x, mesh.position.y, mesh.position.z);
    this.game.ui.spawnFloatingText(`Wrong shelf  (-${window.FFH.ECONOMY.MISPICK_INTEGRITY_COST}%)`, eClientX || window.innerWidth / 2, eClientY || window.innerHeight / 2, '#E63946');
    if (this.game.ui.showPickOutcome) {
      this.game.ui.showPickOutcome('wrong', `Bag integrity −${window.FFH.ECONOMY.MISPICK_INTEGRITY_COST}%`);
    }
    this.shakeItem(mesh);
    this.game.ui.showWarehouseManifest();
  }

  animateBagDrop(mesh) {
    const idx = this.shelvedMeshes.indexOf(mesh);
    if (idx !== -1) this.shelvedMeshes.splice(idx, 1);
    window.FFH.animateBagDrop(mesh, this.bagMesh);
  }

  shakeItem(mesh) {
    window.FFH.shakeItem(mesh);
  }

  pulseRailForGender(gender) {
    window.FFH.pulseRailForGender(gender, this.tagRails, this.game.state.currentShift, this.game.ui);
  }

  exit() {
    if (this.completionTimer) clearTimeout(this.completionTimer);
    this.completionTimer = null;
    this.finishing = true;
    window.removeEventListener('pointerdown', this.onTap);
    const cam = this.game.cameras.mainCamera;
    if (cam && cam.isOrthographicCamera) {
      cam.zoom = 1.0;
      cam.updateProjectionMatrix();
    }
    if (this.shelfGroup) {
      this.game.scene.remove(this.shelfGroup);
      this.shelfGroup = null;
    }
    if (this.bagMesh) {
      this.game.scene.remove(this.bagMesh);
      this.bagMesh = null;
    }
    if (this.warehouseRoom) {
      this.game.scene.remove(this.warehouseRoom);
      this.warehouseRoom = null;
    }
    
    // Restore the city exploration world meshes visibility
    if (this.game.phases.CITY_EXPLORATION.worldGroup) {
      this.game.phases.CITY_EXPLORATION.worldGroup.visible = true;
    }
    if (this.game.phases.CITY_EXPLORATION.courier) {
      this.game.phases.CITY_EXPLORATION.courier.visible = true;
    }

    this.shelvedMeshes = [];
    this.tagRails = [];
    this.game.ui.hideWarehouseManifest();
  }
};
