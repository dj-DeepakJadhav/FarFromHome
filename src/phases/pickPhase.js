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
    this.pickDuration = 0;

    this.onTap = this.onTap.bind(this);
  }

  enter() {
    const state = this.game.state;

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

    // Audio-Leads-Manifest: Setup reveal timing and speak first item
    const firstUnpacked = state.activeOrder[0];
    if (firstUnpacked) {
      firstUnpacked.promptStarted = true;
      firstUnpacked.revealAt = Date.now() + window.FFH.iconRevealDelay(state.currentShift, state.upgrades) * 1000;
      // Play pre-recorded voice sprite for the specific item
      if (firstUnpacked.id) {
        this.game.speech.speakKey(firstUnpacked.id.toLowerCase());
      }
      setTimeout(() => {
        this.pulseRailForGender(firstUnpacked.gender);
      }, 200);
    }

    this.game.ui.showWarehouseManifest();
    window.addEventListener('pointerdown', this.onTap);

    if (state.isVipRush) {
      setTimeout(() => {
        this.game.ui.showTutorialBanner(`🔥 VIP EXPRESS RUSH: 2.5x Customer Tips Active! (Fast Timer)`, '#FF006E', 6000);
      }, 300);
    } else if (this.shift && this.shift.briefing) {
      setTimeout(() => {
        this.game.ui.showTutorialBanner(`📦 ${this.shift.name}: ${this.shift.briefing}`, '#3A86FF', 6000);
      }, 400);
    }

    if (state.currentShift === 1) {
      setTimeout(() => {
        this.game.ui.showTutorialBanner("Listen closely! Pick items by their gender color: Der = Blue, Die = Pink, Das = Purple", 8000);
      }, 6500);
    } else if (state.currentShift === 2 && !state.hasSeenShift2Tutorial) {
      state.hasSeenShift2Tutorial = true;
      setTimeout(() => {
        this.game.ui.showTutorialBanner("The item icon is hidden for 1.5s. Guess early based on the audio for a 2.0x early pick bonus!", 8000);
      }, 6500);
    }
    // Setup camera target for the shelf (zooming in close to the 3-tier shelves at origin)
    const cam = this.game.cameras.mainCamera;
    this.startCamPos = new THREE.Vector3().copy(cam.position);
    this.startCamZoom = cam.zoom || 1.0;
    this.endCamTarget = new THREE.Vector3(0, 1.2, 0);
    // Offset matching isometric camera angle (down and facing front of shelf)
    this.endCamPos = this.endCamTarget.clone().add(new THREE.Vector3(10.0, 13.5, 10.0)); 
    this.endCamZoom = 2.4;
    
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

    if (this.timeRemaining > 0) {
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
          currentPrompt.revealAt = Date.now() + window.FFH.iconRevealDelay(state.currentShift, state.upgrades) * 1000;
          if (currentPrompt.id) {
            this.game.speech.speakKey(currentPrompt.id.toLowerCase());
          }
          this.pulseRailForGender(currentPrompt.gender);
          this.game.ui.showWarehouseManifest();
        } else if (!currentPrompt.revealed && Date.now() >= currentPrompt.revealAt) {
          currentPrompt.revealed = true;
          this.game.ui.showWarehouseManifest();
        }
      }

      // Time expired: end shift with whatever was packed
      if (this.timeRemaining <= 0) {
        this.exit();
        // Pre-compute last payout in case time runs out
        this.game.lastPayout = window.FFH.calculatePayout(this.game.state);
        
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
  buildShelf(shift, order) {
    const derBucket = [];
    const dieBucket = [];
    const dasBucket = [];

    // 1. Sort ordered items into gender buckets
    for (const line of order) {
      const itemDef = window.FFH.items.find(it => it.id === line.id);
      if (itemDef.gender === 'der') derBucket.push(itemDef);
      else if (itemDef.gender === 'die') dieBucket.push(itemDef);
      else if (itemDef.gender === 'das') dasBucket.push(itemDef);
    }

    // 2. Pad each bucket to 4 items with decoys of the same gender
    const pool = window.FFH.getShiftItemPool(shift.index);
    const poolItems = pool.map(id => window.FFH.items.find(it => it.id === id));
    
    const derPool = poolItems.filter(it => it.gender === 'der');
    const diePool = poolItems.filter(it => it.gender === 'die');
    const dasPool = poolItems.filter(it => it.gender === 'das');

    // Fallbacks in case the shift pool lacks items of a specific gender
    const derAll = window.FFH.items.filter(it => it.gender === 'der');
    const dieAll = window.FFH.items.filter(it => it.gender === 'die');
    const dasAll = window.FFH.items.filter(it => it.gender === 'das');

    while (derBucket.length < 4) {
      const src = derPool.length ? derPool : derAll;
      derBucket.push(src[Math.floor(Math.random() * src.length)]);
    }
    while (dieBucket.length < 4) {
      const src = diePool.length ? diePool : dieAll;
      dieBucket.push(src[Math.floor(Math.random() * src.length)]);
    }
    while (dasBucket.length < 4) {
      const src = dasPool.length ? dasPool : dasAll;
      dasBucket.push(src[Math.floor(Math.random() * src.length)]);
    }

    // 3. Shuffle each bucket independently
    this.shuffle(derBucket);
    this.shuffle(dieBucket);
    this.shuffle(dasBucket);

    this.shelfGroup = new THREE.Group();

    const steelMat = window.FFH.createCelMaterial(0x2B2D42);
    const shelfBoardMat = window.FFH.createCelMaterial(0x8D99AE);

    // 4 Corner Steel Uprights
    const postGeo = new THREE.BoxGeometry(0.1, 3.4, 0.1);
    const offsets = [[-1.8, -0.35], [1.8, -0.35], [-1.8, 0.35], [1.8, 0.35]];
    offsets.forEach(([px, pz]) => {
      const p = new THREE.Mesh(postGeo, steelMat);
      p.position.set(px, 1.3, pz);
      this.shelfGroup.add(p);
    });

    const shelfGeo = new THREE.BoxGeometry(3.7, 0.08, 0.75);
    const tagGeo = new THREE.BoxGeometry(3.7, 0.05, 0.02);
    const tiers = 3;

    // Row 0 (bottom) = der (0x3A86FF), Row 1 (middle) = die (0xFF006E), Row 2 (top) = das (0x8338EC)
    const railColors = [0x3A86FF, 0xFF006E, 0x8338EC];

    for (let y = 0; y < tiers; y++) {
      const plank = new THREE.Mesh(shelfGeo, shelfBoardMat);
      plank.position.set(0, y * 0.95 + 0.1, 0);
      plank.receiveShadow = true;
      
      // Price tag rail
      const tagRailMat = window.FFH.createCelMaterial(railColors[y]);
      const tagRail = new THREE.Mesh(tagGeo, tagRailMat);
      tagRail.position.set(0, y * 0.95 + 0.1, 0.38);
      
      this.shelfGroup.add(plank, tagRail);
      this.tagRails.push(tagRail);
    }

    if (this.shelfWorldPos) {
      this.shelfGroup.position.copy(this.shelfWorldPos);
    }
    
    // Rotate shelf so its open front (+Z in local space) faces the camera (+X, +Z in world space)
    this.shelfGroup.rotation.y = Math.PI / 4; 

    this.game.scene.add(this.shelfGroup);

    const shelfHeights = [0.05, 1.05, 2.05];
    const spread = 1.2;
    const buckets = [derBucket, dieBucket, dasBucket];

    const symbols = ['▲', '●', '■'];
    
    buckets.forEach((bucket, row) => {
      bucket.forEach((itemDef, col) => {
        const x = -spread + (col / 3) * spread * 2;
        const itemMesh = window.FFH.createItemMesh(itemDef.type, itemDef.hex);
        itemMesh.position.set(x, shelfHeights[row] + 0.4, 0);
        itemMesh.userData = { id: itemDef.id, def: itemDef };

        if (this.game.state.upgrades?.shelfLabels) {
          const canvas = document.createElement('canvas');
          canvas.width = 64; canvas.height = 64;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#' + railColors[row].toString(16).padStart(6, '0');
          ctx.font = 'bold 48px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(symbols[row], 32, 36);

          const tex = new THREE.CanvasTexture(canvas);
          const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(0.4, 0.4, 1);
          sprite.position.set(0, 0.4, 0); // float above item
          itemMesh.add(sprite);
        }

        this.shelfGroup.add(itemMesh);
        this.shelvedMeshes.push(itemMesh);
      });
    });
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  onTap(e) {
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
    const neededItem = state.activeOrder.find(it => it.id === target.userData.id && !it.packed);

    if (neededItem) {
      this.onCorrectPick(neededItem, itemDef, target, e.clientX, e.clientY);
    } else {
      this.onMispick(target, e.clientX, e.clientY);
    }
  }

  onCorrectPick(orderLine, itemDef, mesh, eClientX, eClientY) {
    const state = this.game.state;
    const now = Date.now();

    const isEarly = now < orderLine.revealAt;
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
    const labelText = isEarly ? `gehört! +${itemDef.nameDe}!${streakLabel}` : `+${itemDef.nameDe}!${streakLabel}`;
    const labelColor = isEarly ? '#FFD700' : '#2A9D8F';
    this.game.ui.spawnFloatingText(labelText, eClientX || window.innerWidth / 2, eClientY || window.innerHeight / 2, labelColor);

    this.animateBagDrop(mesh);
    this.game.ui.showWarehouseManifest();

    if (this.activePicksCount >= state.activeOrder.length) {
      setTimeout(() => {
        this.exit();
        // Pre-compute last payout
        this.game.lastPayout = window.FFH.calculatePayout(this.game.state);
        
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
    this.game.ui.spawnFloatingText(`❌ FALSCH! (-${window.FFH.ECONOMY.MISPICK_INTEGRITY_COST}%)`, eClientX || window.innerWidth / 2, eClientY || window.innerHeight / 2, '#E63946');
    this.shakeItem(mesh);
    this.game.ui.showWarehouseManifest();
  }

  animateBagDrop(mesh) {
    const startPos = mesh.position.clone();
    const endPos = new THREE.Vector3(0, 0.4, 2.0);
    const duration = 0.45;
    let elapsed = 0;

    const idx = this.shelvedMeshes.indexOf(mesh);
    if (idx !== -1) this.shelvedMeshes.splice(idx, 1);

    const updateTrajectory = () => {
      elapsed += 0.016;
      const t = Math.min(elapsed / duration, 1.0);

      mesh.position.lerpVectors(startPos, endPos, t);
      mesh.position.y += Math.sin(t * Math.PI) * 1.8;
      
      // Squash and stretch
      const squash = Math.sin(t * Math.PI) * 0.3;
      mesh.scale.set(1.0 + squash, 1.0 - squash * 0.5, 1.0 + squash);

      if (t < 1.0) {
        requestAnimationFrame(updateTrajectory);
      } else {
        this.game.scene.remove(mesh);
        // Bag bounce effect on receive
        if (this.bagMesh) {
          this.bagMesh.scale.set(1.2, 0.8, 1.2);
          setTimeout(() => {
            if (this.bagMesh) this.bagMesh.scale.set(1.0, 1.0, 1.0);
          }, 120);
        }
      }
    };
    updateTrajectory();
  }

  shakeItem(mesh) {
    const startX = mesh.position.x;
    let elapsed = 0;
    const duration = 0.2;

    const runShake = () => {
      elapsed += 0.016;
      if (elapsed < duration) {
        mesh.position.x = startX + Math.sin(elapsed * 100) * 0.15;
        requestAnimationFrame(runShake);
      } else {
        mesh.position.x = startX;
      }
    };
    runShake();
  }

  pulseRailForGender(gender) {
    const row = gender === 'der' ? 0 : gender === 'die' ? 1 : 2;
    const rail = this.tagRails[row];

    // Day 1 FTUE: First-Shift Tutorial
    if (this.game.state.currentShift === 1 && this.game.ui && this.game.ui.showTutorialBanner) {
      if (gender === 'der') this.game.ui.showTutorialBanner('Der (Masculine) ➔ Look for Blue', 4000);
      if (gender === 'die') this.game.ui.showTutorialBanner('Die (Feminine) ➔ Look for Pink', 4000);
      if (gender === 'das') this.game.ui.showTutorialBanner('Das (Neuter) ➔ Look for Purple', 4000);
    }

    if (rail) {
      const originalScale = rail.scale.clone();
      // Handle both standard materials and custom ShaderMaterials
      const colorSource = rail.material.color || (rail.material.uniforms && rail.material.uniforms.uColor ? rail.material.uniforms.uColor.value : null);
      if (!colorSource) return; // Cannot pulse color

      const originalColor = colorSource.clone();
      
      let elapsed = 0;
      const pulseDuration = 0.5;
      const flashColor = new THREE.Color(0xffffff);
      const isTutorial = this.game.state.currentShift === 1;
      
      const pulseInterval = setInterval(() => {
        elapsed += 0.05;
        const t = Math.sin((elapsed / pulseDuration) * Math.PI);
        const currentColorTarget = rail.material.color || (rail.material.uniforms ? rail.material.uniforms.uColor.value : null);

        if (t < 0 || elapsed >= pulseDuration) {
          if (rail.scale) rail.scale.copy(originalScale);
          if (currentColorTarget) currentColorTarget.copy(originalColor);
          if (rail.material && rail.material.uniforms && rail.material.uniforms.uEmissive) {
              rail.material.uniforms.uEmissive.value = new THREE.Color(0x000000);
          } else if (rail.material && rail.material.emissive) {
              rail.material.emissive.setHex(0x000000);
          }
          clearInterval(pulseInterval);
        } else {
          if (rail.scale) {
            rail.scale.set(originalScale.x, originalScale.y * (1 + t * 0.3), originalScale.z * (1 + t * 0.3));
          }
          if (currentColorTarget) {
            currentColorTarget.lerpColors(originalColor, flashColor, t * 0.5);
          }
          // Extra bright glow for tutorial
          if (isTutorial) {
            if (rail.material && rail.material.uniforms && rail.material.uniforms.uEmissive) {
                // If the shader supports emissive (needs to be added if missing)
                rail.material.uniforms.uEmissive.value.copy(originalColor).multiplyScalar(t * 1.5);
            } else if (rail.material && rail.material.emissive) {
                rail.material.emissive.copy(originalColor).multiplyScalar(t * 1.5);
            }
          }
        }
      }, 50);
    }
  }

  exit() {
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
